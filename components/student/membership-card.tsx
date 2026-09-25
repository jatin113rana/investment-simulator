"use client";

import Link from "next/link";
import { Wallet, BookOpen, Layers, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ShoppingBag } from "lucide-react";
import { PortfolioDetailsModal } from "@/components/student/portfolio-details-modal";

interface MembershipCardProps {
  membership: any;
  onRefresh?: () => void;
}

export function MembershipCard({ membership, onRefresh }: MembershipCardProps) {
  const teacherName = membership.classroom?.teacher
    ? `${membership.classroom.teacher.firstName || ""} ${membership.classroom.teacher.lastName || ""}`.trim() || membership.classroom.teacher.email
    : "Teacher";

  const totalNetWorth = membership.totalNetWorth ?? membership.cashBalance;
  const currentMarketValue = membership.currentMarketValue ?? 0;
  const totalInvested = membership.totalInvested ?? 0;
  const overallProfitLoss = membership.overallProfitLoss ?? 0;
  const overallReturnPercent = membership.overallReturnPercent ?? 0;
  const holdingsCount = membership.holdings?.length ?? 0;
  const isProfit = overallProfitLoss >= 0;

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-5">
      {/* Top Header */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="font-black text-slate-900 text-lg tracking-tight line-clamp-1">
            {membership.classroom.name}
          </h4>
          <span className="font-mono text-xs font-extrabold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg">
            {membership.classroom.code}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
          <div className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            <span>Teacher: {teacherName}</span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
            <Layers className="h-3 w-3" />
            {holdingsCount} {holdingsCount === 1 ? "Fund Held" : "Funds Held"}
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 bg-slate-50/80 border border-slate-200/60 p-4 rounded-lg">
        {/* Net Worth */}
        <div>
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Total Net Worth
          </span>
          <span className="font-black text-base text-slate-900">
            ₹{totalNetWorth.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Holdings Value */}
        <div>
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Holdings Value
          </span>
          <span className="font-extrabold text-base text-blue-700">
            ₹{currentMarketValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* Available Cash */}
        <div>
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Available Cash
          </span>
          <span className="font-extrabold text-sm text-slate-700">
            ₹{membership.cashBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* P&L */}
        <div>
          <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
            Unrealized Return
          </span>
          <div className="flex items-center gap-0.5">
            {isProfit ? (
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 text-rose-600" />
            )}
            <span
              className={`font-black text-xs ${
                isProfit ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {isProfit ? "+" : ""}₹{overallProfitLoss.toFixed(2)} ({isProfit ? "+" : ""}{overallReturnPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-1">
        <PortfolioDetailsModal membership={membership} onRefresh={onRefresh} />
        
        <Link
          href="/student/funds"
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-lg text-xs font-extrabold transition-colors"
        >
          <ShoppingBag className="h-3.5 w-3.5 text-slate-500" />
          <span>Trade Funds in Market</span>
        </Link>
      </div>
    </div>
  );
}
