-- DropIndex
DROP INDEX IF EXISTS "User_phoneNumber_idx";

-- DropIndex
DROP INDEX IF EXISTS "User_phoneNumber_key";

-- AlterTable: Drop phoneNumber and enforce email NOT NULL
ALTER TABLE "User" DROP COLUMN IF EXISTS "phoneNumber",
ALTER COLUMN "email" SET NOT NULL;
