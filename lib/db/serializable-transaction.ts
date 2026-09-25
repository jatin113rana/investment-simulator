import { Prisma } from "@prisma/client";
import prisma from "@/lib/db/db";

const MAX_SERIALIZATION_RETRIES = 3;

export async function runSerializableTransaction<T>(
  work: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  for (let attempt = 0; attempt < MAX_SERIALIZATION_RETRIES; attempt += 1) {
    try {
      return await prisma.$transaction(work, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      });
    } catch (error: any) {
      const isSerializationConflict = error?.code === "P2034";
      if (!isSerializationConflict || attempt === MAX_SERIALIZATION_RETRIES - 1) {
        throw error;
      }
    }
  }

  throw new Error("Serializable transaction failed after retries.");
}
