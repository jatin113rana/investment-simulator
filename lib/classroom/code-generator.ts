import prisma from "@/lib/db/db";

// Character set excluding ambiguous characters (0, O, 1, I)
const CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates a random 6-character uppercase string.
 */
export function generateRandomCode(length: number = 6): string {
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * CODE_CHARS.length);
    result += CODE_CHARS.charAt(randomIndex);
  }
  return result;
}

/**
 * Generates a collision-free 6-character join code verified against the database.
 */
export async function generateUniqueClassroomCode(): Promise<string> {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateRandomCode(6);
    const existing = await prisma.classroom.findUnique({
      where: { code },
    });

    if (!existing) {
      return code;
    }
    attempts++;
  }

  throw new Error("Failed to generate unique classroom join code after multiple attempts.");
}
