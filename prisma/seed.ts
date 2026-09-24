import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { syncAMFIMutualFunds } from "../lib/market-data/amfi-sync";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // Password hashing for pre-configured accounts
  const plainPassword = "Insim@123";
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  // 1. Seed Admin Account
  const adminEmail = "jatinranasiwan113@gmail.com";
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: Role.ADMIN,
      firstName: "Admin",
      lastName: "Rana",
      passwordHash,
    },
    create: {
      clerkUserId: "seed_admin_jatin113",
      email: adminEmail,
      firstName: "Admin",
      lastName: "Rana",
      role: Role.ADMIN,
      passwordHash,
    },
  });
  console.log(`✅ Provisioned ADMIN Account: ${admin.email} (${admin.role})`);

  // 2. Seed Teacher Account
  const teacherEmail = "jatinwork1000@gmail.com";
  const teacher = await prisma.user.upsert({
    where: { email: teacherEmail },
    update: {
      role: Role.TEACHER,
      firstName: "Teacher",
      lastName: "Jatin",
      passwordHash,
    },
    create: {
      clerkUserId: "seed_teacher_jatin1000",
      email: teacherEmail,
      firstName: "Teacher",
      lastName: "Jatin",
      role: Role.TEACHER,
      passwordHash,
    },
  });
  console.log(`✅ Provisioned TEACHER Account: ${teacher.email} (${teacher.role})`);

  // 3. Seed Student Account
  const studentEmail = "jatinranaprep@gmail.com";
  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {
      role: Role.STUDENT,
      firstName: "Student",
      lastName: "Rana",
      passwordHash,
    },
    create: {
      clerkUserId: "seed_student_jatinprep",
      email: studentEmail,
      firstName: "Student",
      lastName: "Rana",
      role: Role.STUDENT,
      passwordHash,
    },
  });
  console.log(`✅ Provisioned STUDENT Account: ${student.email} (${student.role})`);

  // 4. Seed Top Curated AMFI Mutual Funds & Price History
  console.log("📈 Ingesting Top 20 AMFI Mutual Funds & NAV Data...");
  const syncResult = await syncAMFIMutualFunds();
  console.log(`✅ Synced ${syncResult.totalFundsSynced} Mutual Funds to Database.`);

  console.log("🎉 Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error Seeding Database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
