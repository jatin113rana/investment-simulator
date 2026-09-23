-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('BUY', 'SELL');

-- CreateEnum
CREATE TYPE "ClassroomStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "imageUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classroom" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "startingBalance" DECIMAL(18,4) NOT NULL DEFAULT 10000.0000,
    "status" "ClassroomStatus" NOT NULL DEFAULT 'ACTIVE',
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Classroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassroomMembership" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classroomId" TEXT NOT NULL,
    "cashBalance" DECIMAL(18,4) NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassroomMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MutualFund" (
    "id" TEXT NOT NULL,
    "schemeCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "fundHouse" TEXT,
    "currentNav" DECIMAL(18,4) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MutualFund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundPriceHistory" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "schemeCode" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "nav" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holding" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "units" DECIMAL(18,4) NOT NULL,
    "averageCostNav" DECIMAL(18,4) NOT NULL,
    "totalInvested" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "units" DECIMAL(18,4) NOT NULL,
    "executionNav" DECIMAL(18,4) NOT NULL,
    "totalAmount" DECIMAL(18,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkUserId_idx" ON "User"("clerkUserId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Classroom_code_key" ON "Classroom"("code");

-- CreateIndex
CREATE INDEX "Classroom_teacherId_idx" ON "Classroom"("teacherId");

-- CreateIndex
CREATE INDEX "Classroom_code_idx" ON "Classroom"("code");

-- CreateIndex
CREATE INDEX "ClassroomMembership_studentId_idx" ON "ClassroomMembership"("studentId");

-- CreateIndex
CREATE INDEX "ClassroomMembership_classroomId_idx" ON "ClassroomMembership"("classroomId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassroomMembership_studentId_classroomId_key" ON "ClassroomMembership"("studentId", "classroomId");

-- CreateIndex
CREATE UNIQUE INDEX "MutualFund_schemeCode_key" ON "MutualFund"("schemeCode");

-- CreateIndex
CREATE INDEX "MutualFund_schemeCode_idx" ON "MutualFund"("schemeCode");

-- CreateIndex
CREATE INDEX "FundPriceHistory_schemeCode_idx" ON "FundPriceHistory"("schemeCode");

-- CreateIndex
CREATE INDEX "FundPriceHistory_date_idx" ON "FundPriceHistory"("date");

-- CreateIndex
CREATE UNIQUE INDEX "FundPriceHistory_schemeCode_date_key" ON "FundPriceHistory"("schemeCode", "date");

-- CreateIndex
CREATE INDEX "Holding_membershipId_idx" ON "Holding"("membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "Holding_membershipId_fundId_key" ON "Holding"("membershipId", "fundId");

-- CreateIndex
CREATE INDEX "Transaction_membershipId_idx" ON "Transaction"("membershipId");

-- CreateIndex
CREATE INDEX "Transaction_fundId_idx" ON "Transaction"("fundId");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- AddForeignKey
ALTER TABLE "Classroom" ADD CONSTRAINT "Classroom_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomMembership" ADD CONSTRAINT "ClassroomMembership_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassroomMembership" ADD CONSTRAINT "ClassroomMembership_classroomId_fkey" FOREIGN KEY ("classroomId") REFERENCES "Classroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundPriceHistory" ADD CONSTRAINT "FundPriceHistory_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "MutualFund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "ClassroomMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "MutualFund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "ClassroomMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "MutualFund"("id") ON DELETE CASCADE ON UPDATE CASCADE;
