"use client";

import { FundExplorer } from "@/components/student/fund-explorer";
import { Role } from "@prisma/client";

export default function TeacherFundsPage() {
  return <FundExplorer expectedRole={Role.TEACHER} />;
}