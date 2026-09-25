"use client";

import { useState } from "react";
import { Users, Copy, Check, IndianRupee, TrendingDown, TrendingUp, Wallet } from "lucide-react";

interface ClassroomCardProps {
  classroom: {
    id: string;
    name: string;
    code: string;
    startingBalance: number;
    studentCount: number;
    createdAt: string | Date;
    totalAllocatedCapital: number;
    totalInvested: number;
    currentMarketValue: number;
    profitLoss: number;
    profitLossPercent: number;
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
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
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

      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md bg-slate-50 p-2.5">
          <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            <Wallet className="h-3 w-3" /> Allocated
          </span>
          <span className="mt-1 block font-black text-slate-800">₹{classroom.totalAllocatedCapital.toLocaleString("en-IN")}</span>
        </div>
        <div className={`rounded-md p-2.5 ${classroom.profitLoss >= 0 ? "bg-emerald-50" : "bg-rose-50"}`}>
          <span className={`flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider ${classroom.profitLoss >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {classroom.profitLoss >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} P&L
          </span>
          <span className={`mt-1 block font-black ${classroom.profitLoss >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {classroom.profitLoss >= 0 ? "+" : "-"}₹{Math.abs(classroom.profitLoss).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  );
}
