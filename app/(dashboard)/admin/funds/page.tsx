"use client";

import { FundExplorer } from "@/components/student/fund-explorer";
import { Role } from "@prisma/client";

export default function AdminFundsPage() {
  return <FundExplorer expectedRole={Role.ADMIN} />;
}