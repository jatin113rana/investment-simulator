"use server";

import prisma from "@/lib/db/db";
import { syncCurrentUser } from "@/lib/auth/user-sync";
import { generateUniqueClassroomCode } from "./code-generator";
import { createClassroomSchema, joinClassroomSchema } from "@/lib/validation/classroom";
import Decimal from "decimal.js";
import { Role } from "@prisma/client";

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
  const dbUser = await syncCurrentUser(Role.TEACHER);
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
    },
  });

  return classrooms.map((c) => ({
    ...c,
    startingBalance: c.startingBalance.toNumber(),
    studentCount: c._count.memberships,
  }));
}

/**
 * Joins a classroom using a 6-character join code for the authenticated Student.
 */
export async function joinClassroomByCode(code: string) {
  const dbUser = await syncCurrentUser(Role.STUDENT);
  if (!dbUser) {
    throw new Error("Unauthorized: Please sign in to join a classroom.");
  }

  const parsed = joinClassroomSchema.parse({ code });
  const classroom = await prisma.classroom.findUnique({
    where: { code: parsed.code },
  });

  if (!classroom) {
    throw new Error("Invalid join code. Please check the code and try again.");
  }

  if (classroom.status === "ARCHIVED") {
    throw new Error("This classroom has been archived by the teacher.");
  }

  // Check existing enrollment
  const existingMembership = await prisma.classroomMembership.findUnique({
    where: {
      studentId_classroomId: {
        studentId: dbUser.id,
        classroomId: classroom.id,
      },
    },
  });

  if (existingMembership) {
    throw new Error("You are already enrolled in this classroom!");
  }

  // Create membership with default starting cash in ₹
  const membership = await prisma.classroomMembership.create({
    data: {
      studentId: dbUser.id,
      classroomId: classroom.id,
      cashBalance: classroom.startingBalance,
    },
    include: {
      classroom: true,
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
 * Retrieves all enrolled classrooms for the authenticated Student.
 */
export async function getStudentMemberships() {
  const dbUser = await syncCurrentUser(Role.STUDENT);
  if (!dbUser) {
    return [];
  }

  const memberships = await prisma.classroomMembership.findMany({
    where: { studentId: dbUser.id },
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
    },
  });

  return memberships.map((m) => ({
    ...m,
    cashBalance: m.cashBalance.toNumber(),
    classroom: {
      ...m.classroom,
      startingBalance: m.classroom.startingBalance.toNumber(),
    },
  }));
}
