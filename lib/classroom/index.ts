"use server";

import prisma from "@/lib/db/db";
import { syncCurrentUser } from "@/lib/auth/user-sync";
import { getCurrentUserWithRole } from "@/lib/auth/rbac";
import { generateUniqueClassroomCode } from "./code-generator";
import { createClassroomSchema, joinClassroomSchema } from "@/lib/validation/classroom";
import Decimal from "decimal.js";
import { Role } from "@prisma/client";
import { runSerializableTransaction } from "@/lib/db/serializable-transaction";
import { assertRateLimit, consumeRateLimit } from "@/lib/security/rate-limit";

/**
 * Creates a new classroom for the authenticated Teacher or Admin.
 * Strictly forbidden for Student accounts.
 */
export async function createClassroom(input: { name: string; startingBalance?: number }) {
  const dbUser = await syncCurrentUser(Role.TEACHER);
  if (!dbUser) {
    throw new Error("Unauthorized: Please sign in to create a classroom.");
  }

  // Strictly enforce that only Teachers and Admins can create classrooms
  if (dbUser.role !== Role.TEACHER && dbUser.role !== Role.ADMIN) {
    throw new Error("Forbidden: Only Teachers and Admins can create and share classroom codes.");
  }

  const parsed = createClassroomSchema.parse(input);
  const code = await generateUniqueClassroomCode();
  const startingBalanceDecimal = new Decimal(parsed.startingBalance);

  const classroom = await prisma.classroom.create({
    data: {
      name: parsed.name,
      code,
      startingBalance: startingBalanceDecimal,
      teacherId: dbUser.id,
    },
    include: {
      _count: {
        select: { memberships: true },
      },
    },
  });

  return {
    ...classroom,
    startingBalance: classroom.startingBalance.toNumber(),
  };
}

/**
 * Retrieves all classrooms created by the authenticated Teacher or Admin.
 */
export async function getTeacherClassrooms() {
  const dbUser = await getCurrentUserWithRole();
  if (!dbUser) {
    return [];
  }

  if (dbUser.role !== Role.TEACHER && dbUser.role !== Role.ADMIN) {
    return [];
  }

  const classrooms = await prisma.classroom.findMany({
    where: { teacherId: dbUser.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { memberships: true },
      },
      memberships: {
        select: {
          cashBalance: true,
          holdings: {
            select: {
              units: true,
              totalInvested: true,
              fund: {
                select: { currentNav: true },
              },
            },
          },
        },
      },
    },
  });

  return classrooms.map((c) => {
    const totalCash = c.memberships.reduce((sum, membership) => sum + membership.cashBalance.toNumber(), 0);
    const totalInvested = c.memberships.reduce(
      (sum, membership) =>
        sum + membership.holdings.reduce((holdingSum, holding) => holdingSum + holding.totalInvested.toNumber(), 0),
      0
    );
    const currentMarketValue = c.memberships.reduce(
      (sum, membership) =>
        sum +
        membership.holdings.reduce(
          (holdingSum, holding) => holdingSum + holding.units.toNumber() * holding.fund.currentNav.toNumber(),
          0
        ),
      0
    );
    const profitLoss = currentMarketValue - totalInvested;

    return {
      id: c.id,
      name: c.name,
      code: c.code,
      status: c.status,
      createdAt: c.createdAt,
      startingBalance: c.startingBalance.toNumber(),
      studentCount: c._count.memberships,
      totalAllocatedCapital: c.startingBalance.toNumber() * c._count.memberships,
      totalCash,
      totalInvested,
      currentMarketValue,
      totalNetWorth: totalCash + currentMarketValue,
      profitLoss,
      profitLossPercent: totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0,
    };
  });
}

/**
 * Joins a classroom using a 6-character join code for the authenticated Student.
 */
export async function joinClassroomByCode(code: string) {
  const dbUser = await syncCurrentUser(Role.STUDENT);
  if (!dbUser) {
    throw new Error("Unauthorized: Please sign in to join a classroom.");
  }
  assertRateLimit(consumeRateLimit(`join-classroom:${dbUser.id}`, 10, 60_000));

  const parsed = joinClassroomSchema.parse({ code });
  let membership;
  try {
    membership = await runSerializableTransaction(async (tx) => {
      const classroom = await tx.classroom.findUnique({ where: { code: parsed.code } });
      if (!classroom) throw new Error("Invalid join code. Please check the code and try again.");
      if (classroom.status === "ARCHIVED") throw new Error("This classroom has been archived by the teacher.");

      const existingMembership = await tx.classroomMembership.findUnique({
        where: { studentId_classroomId: { studentId: dbUser.id, classroomId: classroom.id } },
      });
      if (existingMembership) throw new Error("You are already enrolled in this classroom!");

      return tx.classroomMembership.create({
        data: { studentId: dbUser.id, classroomId: classroom.id, cashBalance: classroom.startingBalance },
        include: { classroom: true },
      });
    });
  } catch (error: any) {
    if (error?.code === "P2002") throw new Error("You are already enrolled in this classroom!");
    throw error;
  }

  return {
    ...membership,
    cashBalance: membership.cashBalance.toNumber(),
    classroom: {
      ...membership.classroom,
      startingBalance: membership.classroom.startingBalance.toNumber(),
    },
  };
}

/**
 * Retrieves all enrolled classrooms for the authenticated Student.
 */
export async function getStudentMemberships(membershipId?: string) {
  const dbUser = await getCurrentUserWithRole();
  if (!dbUser) {
    return [];
  }

  const memberships = await prisma.classroomMembership.findMany({
    where: { studentId: dbUser.id, ...(membershipId ? { id: membershipId } : {}) },
    orderBy: { joinedAt: "desc" },
    include: {
      classroom: {
        include: {
          teacher: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      holdings: {
        include: {
          fund: true,
        },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          fund: true,
        },
      },
    },
  });

  return memberships.map((m) => {
    const cashBalance = m.cashBalance.toNumber();
    let totalInvested = 0;
    let currentMarketValue = 0;

    const holdings = m.holdings.map((h) => {
      const units = new Decimal(h.units).toNumber();
      const averageCostNav = new Decimal(h.averageCostNav).toNumber();
      const totalInvestedAmount = new Decimal(h.totalInvested).toNumber();
      const currentNav = new Decimal(h.fund.currentNav).toNumber();
      const currentValue = units * currentNav;
      const profitLoss = currentValue - totalInvestedAmount;
      const profitLossPercent = totalInvestedAmount > 0 ? (profitLoss / totalInvestedAmount) * 100 : 0;

      totalInvested += totalInvestedAmount;
      currentMarketValue += currentValue;

      return {
        id: h.id,
        fundId: h.fundId,
        schemeCode: h.fund.schemeCode,
        fundName: h.fund.name,
        category: h.fund.category,
        fundHouse: h.fund.fundHouse,
        units,
        averageCostNav,
        currentNav,
        totalInvested: totalInvestedAmount,
        currentValue,
        profitLoss,
        profitLossPercent,
        fund: {
          id: h.fund.id,
          schemeCode: h.fund.schemeCode,
          name: h.fund.name,
          category: h.fund.category,
          currentNav: currentNav,
        },
      };
    });

    const totalNetWorth = cashBalance + currentMarketValue;
    const overallProfitLoss = currentMarketValue - totalInvested;
    const overallReturnPercent = totalInvested > 0 ? (overallProfitLoss / totalInvested) * 100 : 0;

    return {
      id: m.id,
      studentId: m.studentId,
      classroomId: m.classroomId,
      joinedAt: m.joinedAt,
      updatedAt: m.updatedAt,
      cashBalance,
      totalInvested,
      currentMarketValue,
      totalNetWorth,
      overallProfitLoss,
      overallReturnPercent,
      holdings,
      transactions: m.transactions.map((t) => ({
        id: t.id,
        fundName: t.fund.name,
        schemeCode: t.fund.schemeCode,
        type: t.type,
        units: new Decimal(t.units).toNumber(),
        executionNav: new Decimal(t.executionNav).toNumber(),
        totalAmount: new Decimal(t.totalAmount).toNumber(),
        createdAt: t.createdAt,
      })),
      classroom: {
        ...m.classroom,
        startingBalance: m.classroom.startingBalance.toNumber(),
      },
    };
  });
}

/**
 * Retrieves only the summary data needed by the student dashboard.
 * Detailed holdings and transactions are loaded on the portfolio details route.
 */
export async function getStudentPortfolioSummaries() {
  const dbUser = await getCurrentUserWithRole();
  if (!dbUser) return [];
  if (dbUser.role !== Role.STUDENT && dbUser.role !== Role.ADMIN) return [];

  const memberships = await prisma.classroomMembership.findMany({
    where: { studentId: dbUser.id },
    orderBy: { joinedAt: "desc" },
    include: {
      classroom: {
        include: {
          teacher: {
            select: { firstName: true, lastName: true, email: true },
          },
        },
      },
      holdings: {
        select: {
          id: true,
          units: true,
          totalInvested: true,
          fund: { select: { currentNav: true } },
        },
      },
    },
  });

  return memberships.map((membership) => {
    const cashBalance = membership.cashBalance.toNumber();
    const totalInvested = membership.holdings.reduce((sum, holding) => sum + holding.totalInvested.toNumber(), 0);
    const currentMarketValue = membership.holdings.reduce(
      (sum, holding) => sum + holding.units.toNumber() * holding.fund.currentNav.toNumber(),
      0
    );
    const overallProfitLoss = currentMarketValue - totalInvested;

    return {
      id: membership.id,
      cashBalance,
      totalInvested,
      currentMarketValue,
      totalNetWorth: cashBalance + currentMarketValue,
      overallProfitLoss,
      overallReturnPercent: totalInvested > 0 ? (overallProfitLoss / totalInvested) * 100 : 0,
      holdings: membership.holdings.map((holding) => ({ id: holding.id })),
      transactions: [],
      classroom: {
        ...membership.classroom,
        startingBalance: membership.classroom.startingBalance.toNumber(),
      },
    };
  });
}
