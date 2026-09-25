"use server";

import prisma from "@/lib/db/db";
import { getCurrentUserWithRole } from "@/lib/auth/rbac";
import { generateUniqueClassroomCode } from "@/lib/classroom/code-generator";
import { createClassroomSchema } from "@/lib/validation/classroom";
import { Role } from "@prisma/client";
import Decimal from "decimal.js";
import { z } from "zod";
import { runSerializableTransaction } from "@/lib/db/serializable-transaction";
import { assertRateLimit, consumeRateLimit } from "@/lib/security/rate-limit";

const createUserByAdminSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.nativeEnum(Role).default(Role.STUDENT),
});

/**
 * Ensures the authenticated user has ADMIN privileges.
 */
async function requireAdmin() {
  const dbUser = await getCurrentUserWithRole();
  if (!dbUser || dbUser.role !== Role.ADMIN) {
    throw new Error("Forbidden: Admin access required.");
  }
  return dbUser;
}

/**
 * Retrieves all registered users from the Neon PostgreSQL database.
 */
export async function getAllUsers() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          createdClassrooms: true,
          classroomMemberships: true,
        },
      },
    },
  });

  return users;
}

/**
 * Directly provisions a new Teacher or Student account in the database.
 */
export async function createUserByAdmin(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  role: Role;
}) {
  await requireAdmin();
  const parsed = createUserByAdminSchema.parse(input);

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email },
  });

  if (existing) {
    throw new Error("A user with this email address already exists.");
  }

  const placeholderClerkId = `admin_created_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const user = await prisma.user.create({
    data: {
      clerkUserId: placeholderClerkId,
      email: parsed.email,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      role: parsed.role,
    },
  });

  return user;
}

/**
 * Updates an existing user's role (ADMIN, TEACHER, STUDENT).
 */
export async function updateUserRole(userId: string, newRole: Role) {
  await requireAdmin();

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  return user;
}

/**
 * Deletes a user profile from the database.
 */
export async function deleteUserByAdmin(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) {
    throw new Error("Cannot delete your own admin account.");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return { success: true };
}

/**
 * Admin action to create a classroom for any selected Teacher.
 */
export async function adminCreateClassroom(input: {
  teacherId: string;
  name: string;
  startingBalance?: number;
}) {
  await requireAdmin();

  const parsed = createClassroomSchema.parse({
    name: input.name,
    startingBalance: input.startingBalance,
  });

  const teacher = await prisma.user.findUnique({
    where: { id: input.teacherId },
  });

  if (!teacher) {
    throw new Error("Selected teacher does not exist.");
  }

  // Ensure user has Teacher or Admin role
  if (teacher.role === Role.STUDENT) {
    await prisma.user.update({
      where: { id: teacher.id },
      data: { role: Role.TEACHER },
    });
  }

  const code = await generateUniqueClassroomCode();
  const startingBalanceDecimal = new Decimal(parsed.startingBalance);

  const classroom = await prisma.classroom.create({
    data: {
      name: parsed.name,
      code,
      startingBalance: startingBalanceDecimal,
      teacherId: teacher.id,
    },
  });

  return {
    ...classroom,
    startingBalance: classroom.startingBalance.toNumber(),
  };
}

/**
 * Admin action to directly assign any Student to any Classroom.
 */
export async function adminAssignStudentToClassroom(studentId: string, classroomId: string) {
  const admin = await requireAdmin();
  assertRateLimit(consumeRateLimit(`admin-assign:${admin.id}`, 30, 60_000));
  let membership;
  try {
    membership = await runSerializableTransaction(async (tx) => {
      const student = await tx.user.findUnique({ where: { id: studentId } });
      if (!student) throw new Error("Selected student does not exist.");

      const classroom = await tx.classroom.findUnique({ where: { id: classroomId } });
      if (!classroom) throw new Error("Selected classroom does not exist.");

      const existing = await tx.classroomMembership.findUnique({
        where: { studentId_classroomId: { studentId, classroomId } },
      });
      if (existing) throw new Error("Student is already enrolled in this classroom.");

      return tx.classroomMembership.create({
        data: { studentId, classroomId, cashBalance: classroom.startingBalance },
        include: { classroom: true, student: true },
      });
    });
  } catch (error: any) {
    if (error?.code === "P2002") throw new Error("Student is already enrolled in this classroom.");
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
 * Retrieves list of all teachers, students, and classrooms for admin selectors.
 */
export async function getAdminClassroomsAndStudents() {
  await requireAdmin();

  const [teachers, students, classrooms] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: [Role.TEACHER, Role.ADMIN] } },
      orderBy: { firstName: "asc" },
    }),
    prisma.user.findMany({
      where: { role: Role.STUDENT },
      orderBy: { firstName: "asc" },
    }),
    prisma.classroom.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        teacher: {
          select: { firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { memberships: true },
        },
      },
    }),
  ]);

  return {
    teachers,
    students,
    classrooms: classrooms.map((c) => ({
      ...c,
      startingBalance: c.startingBalance.toNumber(),
      studentCount: c._count.memberships,
    })),
  };
}

/**
 * Retrieves full system classroom details including teacher info, funds allotted per student,
 * total allocated capital, funds used (capital invested), cash remaining, total net worth,
 * overall classroom profit or loss (P&L), and student roster breakdown.
 */
export async function getAdminDetailedClassrooms() {
  await requireAdmin();

  const classrooms = await prisma.classroom.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      teacher: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          clerkUserId: true,
          imageUrl: true,
        },
      },
      memberships: {
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
      },
    },
  });

  return classrooms.map((c) => {
    const startingBalance = c.startingBalance.toNumber();
    const studentCount = c.memberships.length;
    const totalAllocatedCapital = startingBalance * studentCount;

    let classroomAvailableCash = 0;
    let classroomFundsUsed = 0;
    let classroomHoldingsValue = 0;

    const studentRoster = c.memberships.map((m) => {
      const cash = new Decimal(m.cashBalance).toNumber();
      let studentFundsUsed = 0;
      let studentHoldingsVal = 0;

      m.holdings.forEach((h) => {
        const invested = new Decimal(h.totalInvested).toNumber();
        const units = new Decimal(h.units).toNumber();
        const nav = new Decimal(h.fund.currentNav).toNumber();

        studentFundsUsed += invested;
        studentHoldingsVal += units * nav;
      });

      const netWorth = cash + studentHoldingsVal;
      const profitLoss = studentHoldingsVal - studentFundsUsed;
      const returnPercent = studentFundsUsed > 0 ? (profitLoss / studentFundsUsed) * 100 : 0;

      classroomAvailableCash += cash;
      classroomFundsUsed += studentFundsUsed;
      classroomHoldingsValue += studentHoldingsVal;

      const studentName =
        m.student.firstName || m.student.lastName
          ? `${m.student.firstName || ""} ${m.student.lastName || ""}`.trim()
          : m.student.email.split("@")[0];

      return {
        membershipId: m.id,
        studentId: m.student.id,
        displayName: studentName,
        email: m.student.email,
        imageUrl: m.student.imageUrl,
        joinedAt: m.joinedAt,
        cashBalance: cash,
        fundsUsed: studentFundsUsed,
        holdingsValue: studentHoldingsVal,
        netWorth,
        profitLoss,
        returnPercent,
        holdingsCount: m.holdings.length,
      };
    });

    const classroomNetWorth = classroomAvailableCash + classroomHoldingsValue;
    const classroomProfitLoss = classroomHoldingsValue - classroomFundsUsed;
    const classroomReturnPercent = classroomFundsUsed > 0 ? (classroomProfitLoss / classroomFundsUsed) * 100 : 0;

    const teacherName =
      c.teacher.firstName || c.teacher.lastName
        ? `${c.teacher.firstName || ""} ${c.teacher.lastName || ""}`.trim()
        : c.teacher.email;

    return {
      id: c.id,
      name: c.name,
      code: c.code,
      status: c.status,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      startingBalance,
      studentCount,
      totalAllocatedCapital,
      teacher: {
        id: c.teacher.id,
        name: teacherName,
        email: c.teacher.email,
        imageUrl: c.teacher.imageUrl,
      },
      financials: {
        availableCash: classroomAvailableCash,
        fundsUsed: classroomFundsUsed,
        holdingsValue: classroomHoldingsValue,
        totalNetWorth: classroomNetWorth,
        profitLoss: classroomProfitLoss,
        returnPercent: classroomReturnPercent,
      },
      students: studentRoster,
    };
  });
}
