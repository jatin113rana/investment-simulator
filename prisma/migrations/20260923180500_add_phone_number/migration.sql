-- AlterTable: Make email optional and add phoneNumber
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL,
ADD COLUMN     "phoneNumber" TEXT;

-- CreateIndex: Unique constraint on phoneNumber
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex: Index on phoneNumber
CREATE INDEX "User_phoneNumber_idx" ON "User"("phoneNumber");
