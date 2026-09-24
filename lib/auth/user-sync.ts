import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db/db";
import { Role } from "@prisma/client";

/**
 * Synchronizes the currently authenticated Clerk user profile
 * to the Neon PostgreSQL User table.
 * Supports matching pre-seeded or admin-created users by email.
 */
export async function syncCurrentUser(fallbackRole: Role = Role.STUDENT) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return null;
  }

  const primaryEmail = clerkUser.emailAddresses?.[0]?.emailAddress;
  if (!primaryEmail) {
    throw new Error("User email is required for database synchronization.");
  }

  // Extract role from Clerk public metadata if assigned, else fallback
  const metadataRole = clerkUser.publicMetadata?.role as Role | undefined;
  const targetRole =
    metadataRole && Object.values(Role).includes(metadataRole)
      ? metadataRole
      : fallbackRole;

  // 1. Check if user already exists by clerkUserId OR primary email
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ clerkUserId: clerkUser.id }, { email: primaryEmail }],
    },
  });

  if (existingUser) {
    // Link real Clerk User ID and update profile fields while preserving DB role
    const dbUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        clerkUserId: clerkUser.id,
        email: primaryEmail,
        firstName: clerkUser.firstName || existingUser.firstName,
        lastName: clerkUser.lastName || existingUser.lastName,
        imageUrl: clerkUser.imageUrl || existingUser.imageUrl,
      },
    });
    return dbUser;
  }

  // 2. If no record exists, create new user
  const dbUser = await prisma.user.create({
    data: {
      clerkUserId: clerkUser.id,
      email: primaryEmail,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
      role: targetRole,
    },
  });

  return dbUser;
}
