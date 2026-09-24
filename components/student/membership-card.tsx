"use client";

import { Wallet, BookOpen } from "lucide-react";

interface MembershipCardProps {
  membership: {
    id: string;
    cashBalance: number;
    joinedAt: string | Date;
    classroom: {
      id: string;
      name: string;
      code: string;
      teacher?: {
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
      } | null;
    };
  };
}

export function MembershipCard({ membership }: MembershipCardProps) {
  const teacherName = membership.classroom.teacher
    ? `${membership.classroom.teacher.firstName || ""} ${membership.classroom.teacher.lastName || ""}`.trim() || membership.classroom.teacher.email
    : "Teacher";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-bold text-slate-900 text-lg tracking-tight line-clamp-1">
            {membership.classroom.name}
          </h4>
          <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {membership.classroom.code}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
          <BookOpen className="h-3.5 w-3.5 text-slate-400" />
          <span>Teacher: {teacherName}</span>
        </div>
      </div>

      <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <span className="block text-[10px] font-semibold text-emerald-800 uppercase tracking-wider">
              Available Cash
            </span>
            <span className="font-bold text-lg text-emerald-900">
              ₹{membership.cashBalance.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
