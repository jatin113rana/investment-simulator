"use server";

import prisma from "@/lib/db/db";
import { syncCurrentUser } from "@/lib/auth/user-sync";
import Decimal from "decimal.js";

/**
 * Retrieves full portfolio performance metrics, holdings, and transaction history for a student membership.
 */
export async function getMembershipPortfolio(membershipId: string) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    throw new Error("Unauthorized: Active session required.");
  }

  const membership = await prisma.classroomMembership.findUnique({
    where: { id: membershipId },
    include: {
      classroom: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      holdings: {
        include: {
          fund: true,
        },
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        include: {
          fund: true,
        },
      },
    },
  });

  if (!membership) {
    throw new Error("Membership portfolio not found.");
  }

  const cashBalanceDecimal = new Decimal(membership.cashBalance);
  let totalInvestedDecimal = new Decimal(0);
  let totalCurrentValueDecimal = new Decimal(0);

  const formattedHoldings = membership.holdings.map((h) => {
    const units = new Decimal(h.units);
    const avgCostNav = new Decimal(h.averageCostNav);
    const invested = new Decimal(h.totalInvested);
    const currentNav = new Decimal(h.fund.currentNav);

    const currentValue = units.mul(currentNav);
    const profitLoss = currentValue.sub(invested);
    const profitLossPercent = invested.greaterThan(0)
      ? profitLoss.div(invested).mul(100)
      : new Decimal(0);

    totalInvestedDecimal = totalInvestedDecimal.add(invested);
    totalCurrentValueDecimal = totalCurrentValueDecimal.add(currentValue);

    return {
      id: h.id,
      fundId: h.fundId,
      schemeCode: h.fund.schemeCode,
      fundName: h.fund.name,
      category: h.fund.category,
      fundHouse: h.fund.fundHouse,
      units: units.toNumber(),
      averageCostNav: avgCostNav.toNumber(),
      currentNav: currentNav.toNumber(),
      totalInvested: invested.toNumber(),
      currentValue: currentValue.toNumber(),
      profitLoss: profitLoss.toNumber(),
      profitLossPercent: profitLossPercent.toNumber(),
    };
  });

  const totalNetWorthDecimal = cashBalanceDecimal.add(totalCurrentValueDecimal);
  const overallProfitLossDecimal = totalCurrentValueDecimal.sub(totalInvestedDecimal);
  const overallReturnPercentDecimal = totalInvestedDecimal.greaterThan(0)
    ? overallProfitLossDecimal.div(totalInvestedDecimal).mul(100)
    : new Decimal(0);

  return {
    membershipId: membership.id,
    classroom: {
      id: membership.classroom.id,
      name: membership.classroom.name,
      code: membership.classroom.code,
      startingBalance: membership.classroom.startingBalance.toNumber(),
    },
    student: membership.student,
    metrics: {
      cashBalance: cashBalanceDecimal.toNumber(),
      totalInvested: totalInvestedDecimal.toNumber(),
      currentMarketValue: totalCurrentValueDecimal.toNumber(),
      totalNetWorth: totalNetWorthDecimal.toNumber(),
      overallProfitLoss: overallProfitLossDecimal.toNumber(),
      overallReturnPercent: overallReturnPercentDecimal.toNumber(),
    },
    holdings: formattedHoldings,
    transactions: membership.transactions.map((t) => ({
      id: t.id,
      fundName: t.fund.name,
      schemeCode: t.fund.schemeCode,
      type: t.type,
      units: new Decimal(t.units).toNumber(),
      executionNav: new Decimal(t.executionNav).toNumber(),
      totalAmount: new Decimal(t.totalAmount).toNumber(),
      createdAt: t.createdAt,
    })),
  };
}

/**
 * Retrieves the live leaderboard rankings for a specific classroom based on total portfolio Net Worth.
 */
export async function getClassroomLeaderboard(classroomId: string) {
  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    throw new Error("Unauthorized: Active session required.");
  }

  const memberships = await prisma.classroomMembership.findMany({
    where: { classroomId },
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          imageUrl: true,
        },
      },
      holdings: {
        include: {
          fund: {
            select: { currentNav: true },
          },
        },
      },
    },
  });

  const rankedStudents = memberships.map((m) => {
    const cash = new Decimal(m.cashBalance);
    let invested = new Decimal(0);
    let holdingsValue = new Decimal(0);

    m.holdings.forEach((h) => {
      const hInvested = new Decimal(h.totalInvested);
      const hUnits = new Decimal(h.units);
      const hNav = new Decimal(h.fund.currentNav);

      invested = invested.add(hInvested);
      holdingsValue = holdingsValue.add(hUnits.mul(hNav));
    });

    const netWorth = cash.add(holdingsValue);
    const profitLoss = holdingsValue.sub(invested);
    const returnPercent = invested.greaterThan(0)
      ? profitLoss.div(invested).mul(100)
      : new Decimal(0);

    const displayName =
      m.student.firstName || m.student.lastName
        ? `${m.student.firstName || ""} ${m.student.lastName || ""}`.trim()
        : m.student.email.split("@")[0];

    return {
      membershipId: m.id,
      studentId: m.student.id,
      displayName,
      email: m.student.email,
      imageUrl: m.student.imageUrl,
      cashBalance: cash.toNumber(),
      totalInvested: invested.toNumber(),
      holdingsValue: holdingsValue.toNumber(),
      netWorth: netWorth.toNumber(),
      profitLoss: profitLoss.toNumber(),
      returnPercent: returnPercent.toNumber(),
    };
  });

  // Sort descending by Total Net Worth
  rankedStudents.sort((a, b) => b.netWorth - a.netWorth);

  return rankedStudents.map((student, index) => ({
    rank: index + 1,
    ...student,
  }));
}
