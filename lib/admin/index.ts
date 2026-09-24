"use server";

import prisma from "@/lib/db/db";
import { syncCurrentUser } from "@/lib/auth/user-sync";
import { generateUniqueClassroomCode } from "@/lib/classroom/code-generator";
import { createClassroomSchema } from "@/lib/validation/classroom";
import { Role } from "@prisma/client";
import Decimal from "decimal.js";
import { z } from "zod";

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
  const dbUser = await syncCurrentUser(Role.ADMIN);
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
  await requireAdmin();

  const student = await prisma.user.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new Error("Selected student does not exist.");
  }

  const classroom = await prisma.classroom.findUnique({
    where: { id: classroomId },
  });

  if (!classroom) {
    throw new Error("Selected classroom does not exist.");
  }

  // Check if student is already enrolled
  const existing = await prisma.classroomMembership.findUnique({
    where: {
      studentId_classroomId: {
        studentId,
        classroomId,
      },
    },
  });

  if (existing) {
    throw new Error("Student is already enrolled in this classroom.");
  }

  const membership = await prisma.classroomMembership.create({
    data: {
      studentId,
      classroomId,
      cashBalance: classroom.startingBalance,
    },
    include: {
      classroom: true,
      student: true,
    },
  });

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
