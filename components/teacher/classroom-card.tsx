"use client";

import { useState } from "react";
import { Users, Copy, Check, IndianRupee } from "lucide-react";

interface ClassroomCardProps {
  classroom: {
    id: string;
    name: string;
    code: string;
    startingBalance: number;
    studentCount: number;
    createdAt: string | Date;
  };
}

export function ClassroomCard({ classroom }: ClassroomCardProps) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(classroom.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <h4 className="font-bold text-slate-900 text-lg tracking-tight line-clamp-1">
            {classroom.name}
          </h4>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
            <Users className="h-3 w-3 text-slate-500" />
            <span>{classroom.studentCount} Students</span>
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 mb-4 flex items-center justify-between">
          <div>
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Student Join Code
            </span>
            <span className="font-mono text-xl font-bold tracking-wider text-emerald-700">
              {classroom.code}
            </span>
          </div>
          <button
            onClick={copyCode}
            className="flex items-center gap-1.5 rounded-md bg-white border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-500" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1 font-medium text-slate-700">
          <IndianRupee className="h-3.5 w-3.5 text-emerald-600" />
          <span>Starting: ₹{classroom.startingBalance.toLocaleString("en-IN")}</span>
        </span>
        <span>
          Created {new Date(classroom.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
        </span>
      </div>
    </div>
  );
}
