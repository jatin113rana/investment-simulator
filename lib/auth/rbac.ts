"use server";

import { syncCurrentUser } from "./user-sync";
import { Role } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/db/db";

/**
 * Retrieves the currently authenticated user from Neon PostgreSQL with their role.
 */
export async function getCurrentUserWithRole() {
  const { userId } = await auth();
  if (!userId) return null;

  const existingUser = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  return existingUser || syncCurrentUser();
}

/**
 * Returns the single unified dashboard path for all authenticated users.
 */
export async function getUserDashboardRedirect(role?: Role): Promise<string> {
  return "/dashboard";
}

/**
 * Server Action: Fetches the authenticated user's role and designated redirect path.
 */
export async function fetchUserRoleAndRedirectPath() {
  const dbUser = await syncCurrentUser();
  if (!dbUser) {
    return { authenticated: false, redirectPath: "/" };
  }

  return {
    authenticated: true,
    role: dbUser.role,
    redirectPath: "/dashboard",
    email: dbUser.email,
    firstName: dbUser.firstName,
  };
}

/**
 * Server-side RBAC protection helper.
 * Verifies if user has one of the allowed roles.
 */
export async function verifyRoleAccess(allowedRoles: Role[]) {
  const dbUser = await getCurrentUserWithRole();
  if (!dbUser) {
    return { authorized: false, redirectPath: "/" };
  }

  if (allowedRoles.includes(dbUser.role) || dbUser.role === Role.ADMIN) {
    return { authorized: true, user: dbUser };
  }

  return { authorized: false, user: dbUser, redirectPath: "/dashboard" };
}
