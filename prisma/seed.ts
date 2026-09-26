import { PrismaClient, Role } from "@prisma/client";
import { clerkClient } from "@clerk/nextjs/server";
import { syncAMFIMutualFunds } from "../lib/market-data/amfi-sync";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding...");

  const plainPassword = "Insim@123456789";
  const clerk = await clerkClient();

  async function provisionClerkUser(email: string, firstName: string, lastName: string) {
    const existingUsers = await clerk.users.getUserList({ emailAddress: [email], limit: 1 });
    if (existingUsers.data[0]) {
      return clerk.users.updateUser(existingUsers.data[0].id, {
        password: plainPassword,
        firstName,
        lastName,
      });
    }

    return clerk.users.createUser({
      emailAddress: [email],
      password: plainPassword,
      firstName,
      lastName,
    });
  }

  // 1. Seed Admin Account
  const adminEmail = "admin@jatinrana.online";
  const clerkAdmin = await provisionClerkUser(adminEmail, "Admin", "Rana");
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      clerkUserId: clerkAdmin.id,
      role: Role.ADMIN,
      firstName: "Admin",
      lastName: "Rana",
      passwordHash: null,
    },
    create: {
      clerkUserId: clerkAdmin.id,
      email: adminEmail,
      firstName: "Admin",
      lastName: "Rana",
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Provisioned ADMIN Account: ${admin.email} (${admin.role})`);

  // 2. Seed Teacher Account
  const teacherEmail = "teacher@jatinrana.online";
  const clerkTeacher = await provisionClerkUser(teacherEmail, "Teacher", "Jatin");
  const teacher = await prisma.user.upsert({
    where: { email: teacherEmail },
    update: {
      clerkUserId: clerkTeacher.id,
      role: Role.TEACHER,
      firstName: "Teacher",
      lastName: "Jatin",
      passwordHash: null,
    },
    create: {
      clerkUserId: clerkTeacher.id,
      email: teacherEmail,
      firstName: "Teacher",
      lastName: "Jatin",
      role: Role.TEACHER,
    },
  });
  console.log(`✅ Provisioned TEACHER Account: ${teacher.email} (${teacher.role})`);

  // 3. Seed Student Account
  const studentEmail = "student@jatinrana.online";
  const clerkStudent = await provisionClerkUser(studentEmail, "Student", "Rana");
  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {
      clerkUserId: clerkStudent.id,
      role: Role.STUDENT,
      firstName: "Student",
      lastName: "Rana",
      passwordHash: null,
    },
    create: {
      clerkUserId: clerkStudent.id,
      email: studentEmail,
      firstName: "Student",
      lastName: "Rana",
      role: Role.STUDENT,
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
