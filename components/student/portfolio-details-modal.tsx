"use client";

import { useState } from "react";
import Link from "next/link";
import { TradeModal } from "@/components/student/trade-modal";
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingBag,
  History,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  DollarSign,
  Layers,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

export interface HoldingDetail {
  id: string;
  fundId: string;
  schemeCode: string;
  fundName: string;
  category: string;
  fundHouse?: string | null;
  units: number;
  averageCostNav: number;
  currentNav: number;
  totalInvested: number;
  currentValue: number;
  profitLoss: number;
  profitLossPercent: number;
  fund: {
    id: string;
    schemeCode: string;
    name: string;
    category: string;
    currentNav: number;
  };
}

export interface TransactionDetail {
  id: string;
  fundName: string;
  schemeCode: string;
  type: "BUY" | "SELL";
  units: number;
  executionNav: number;
  totalAmount: number;
  createdAt: string | Date;
}

export interface MembershipPortfolioProps {
  membership: {
    id: string;
    cashBalance: number;
    totalInvested: number;
    currentMarketValue: number;
    totalNetWorth: number;
    overallProfitLoss: number;
    overallReturnPercent: number;
    holdings: HoldingDetail[];
    transactions: TransactionDetail[];
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
  onRefresh?: () => void;
}

export function PortfolioDetailsView({ membership, onRefresh }: MembershipPortfolioProps) {
  const [activeTab, setActiveTab] = useState<"HOLDINGS" | "HISTORY">("HOLDINGS");

  const teacherName = membership.classroom.teacher
    ? `${membership.classroom.teacher.firstName || ""} ${membership.classroom.teacher.lastName || ""}`.trim() || membership.classroom.teacher.email
    : "Teacher";

  const isProfit = membership.overallProfitLoss >= 0;
  const holdingsValue = membership.currentMarketValue || 0;
  const bestHolding = membership.holdings.reduce< HoldingDetail | null>(
    (best, holding) => (!best || holding.profitLossPercent > best.profitLossPercent ? holding : best),
    null
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl overflow-hidden border-x border-slate-200 bg-white shadow-sm">
            
            {/* Modal Header */}
            <div className="px-5 sm:px-7 py-5 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                  <PieChart className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">
                      {membership.classroom.name}
                    </h3>
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded-lg">
                      {membership.classroom.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    Educator: {teacherName} • Joined {new Date(membership.joinedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>

              <Link
                href="/student/classrooms"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to classrooms</span>
              </Link>
            </div>

            {/* Portfolio Summary Stats Grid */}
            <div className="p-5 sm:p-7 bg-slate-950 text-white border-b border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">Portfolio performance</span>
                  <h4 className="mt-1 text-lg font-black tracking-tight">Your classroom investment snapshot</h4>
                </div>
                <div className="text-left sm:text-right">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Best performing fund</span>
                  <span className="mt-1 block max-w-[220px] truncate text-xs font-bold text-slate-200">{bestHolding?.fundName || "No holdings yet"}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                
                {/* Total Net Worth */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Total Net Worth
                  </span>
                  <span className="text-2xl font-black text-white mt-1 block">
                    ₹{membership.totalNetWorth.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Available Cash */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Available Cash
                  </span>
                  <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                    ₹{membership.cashBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Total Invested */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Total Invested
                  </span>
                  <span className="text-xl font-extrabold text-blue-400 mt-1 block">
                    ₹{membership.totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Overall P&L */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    Overall Return (P&L)
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    {isProfit ? (
                      <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-rose-400" />
                    )}
                    <span
                      className={`text-lg font-black ${
                        isProfit ? "text-emerald-400" : "text-rose-400"
                      }`}
                    >
                      {isProfit ? "+" : ""}₹
                      {membership.overallProfitLoss.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                      <span className="text-xs font-bold ml-1">
                        ({isProfit ? "+" : ""}{membership.overallReturnPercent.toFixed(2)}%)
                      </span>
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 sm:px-7 border-b border-slate-200/80 bg-white flex items-center gap-5">
              <button
                onClick={() => setActiveTab("HOLDINGS")}
                className={`py-2 px-1 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "HOLDINGS"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Active Holdings ({membership.holdings.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("HISTORY")}
                className={`py-3 px-1 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "HISTORY"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                }`}
              >
                <History className="h-4 w-4" />
                <span>Trade Log ({membership.transactions.length})</span>
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-slate-50">
              {activeTab === "HOLDINGS" ? (
                membership.holdings.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300 p-8 shadow-2xs">
                    <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                    <h4 className="text-lg font-extrabold text-slate-900 mb-1">
                      No Mutual Fund Holdings Found
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mb-6 font-medium">
                      You haven&apos;t purchased any mutual funds in this classroom portfolio yet. Explore live AMFI NAVs and start investing!
                    </p>
                    <Link
                      href="/student/funds"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Browse & Buy Mutual Funds</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Active holdings</span>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="text-xl font-black text-slate-900">₹{holdingsValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                            <span className="text-xs font-bold text-slate-500">current market value</span>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Capital deployed</span>
                          <span className="mt-1 block text-sm font-black text-slate-800">₹{membership.totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-slate-800"
                          style={{ width: `${Math.min(100, membership.totalNetWorth > 0 ? (holdingsValue / membership.totalNetWorth) * 100 : 0)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-[10px] font-bold text-slate-400">
                        <span>{membership.holdings.length} active {membership.holdings.length === 1 ? "position" : "positions"}</span>
                        <span>{membership.totalNetWorth > 0 ? ((holdingsValue / membership.totalNetWorth) * 100).toFixed(1) : "0.0"}% of net worth</span>
                      </div>
                    </div>
                    {membership.holdings.map((h) => {
                      const holdingProfit = h.profitLoss >= 0;
                      const allocationPercent = holdingsValue > 0 ? (h.currentValue / holdingsValue) * 100 : 0;
                      return (
                        <div
                          key={h.id}
                          className="group bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${holdingProfit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                                  {holdingProfit ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                </div>
                                <div className="min-w-0">
                                  <span className="inline-block max-w-full truncate rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-600 border border-slate-200">
                                    {h.category}
                                  </span>
                                  <h5 className="mt-1 font-black text-slate-900 text-sm leading-snug">{h.fundName}</h5>
                                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-semibold">
                                    <span>Code <strong className="text-slate-800 font-mono">{h.schemeCode}</strong></span>
                                    {h.fundHouse && <span>{h.fundHouse}</span>}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0 lg:text-right">
                              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Current value</span>
                              <span className="mt-1 block text-xl font-black text-slate-900">₹{h.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                              <span className={`mt-1 inline-flex items-center gap-1 text-xs font-black ${holdingProfit ? "text-emerald-600" : "text-rose-600"}`}>
                                {holdingProfit ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                {holdingProfit ? "+" : "-"}₹{Math.abs(h.profitLoss).toLocaleString("en-IN", { maximumFractionDigits: 2 })} ({holdingProfit ? "+" : ""}{h.profitLossPercent.toFixed(2)}%)
                              </span>
                            </div>
                          </div>

                          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/60 text-xs">
                            <div>
                              <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Units Owned</span>
                              <span className="font-extrabold text-slate-900">{h.units.toFixed(4)}</span>
                            </div>

                            <div>
                              <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Avg Buy Price (NAV)</span>
                              <span className="font-extrabold text-slate-900">₹{h.averageCostNav.toFixed(2)}</span>
                            </div>

                            <div>
                              <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Live NAV</span>
                              <span className="font-extrabold text-slate-900">₹{h.currentNav.toFixed(2)}</span>
                            </div>

                            <div>
                              <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Current Value</span>
                              <span className="font-black text-slate-900">₹{h.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                            </div>
                          </div>

                          <div className="mt-4 border-t border-slate-100 pt-4">
                            <div className="mb-3 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                              <span>Portfolio allocation</span><span>{allocationPercent.toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-slate-800 transition-all group-hover:bg-emerald-500" style={{ width: `${Math.min(100, allocationPercent)}%` }} />
                            </div>
                            <div className="mt-4 flex justify-end">
                              <TradeModal fund={h.fund} memberships={[membership]} onTradeComplete={onRefresh} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : membership.transactions.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-300 p-8 shadow-2xs">
                  <History className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h4 className="text-lg font-extrabold text-slate-900 mb-1">
                    No Transaction History
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Executed buy and sell transactions will appear here.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3">Date & Time</th>
                          <th className="px-5 py-3">Type</th>
                          <th className="px-5 py-3">Mutual Fund</th>
                          <th className="px-5 py-3">Units</th>
                          <th className="px-5 py-3">Execution NAV</th>
                          <th className="px-5 py-3 text-right">Total Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {membership.transactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-3.5 text-slate-500 font-medium whitespace-nowrap">
                              {new Date(t.createdAt).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black ${
                                  t.type === "BUY"
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : "bg-rose-100 text-rose-800 border border-rose-200"
                                }`}
                              >
                                {t.type}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-900">
                              {t.fundName}
                              <span className="block text-[10px] text-slate-400 font-normal">Code: {t.schemeCode}</span>
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-800">
                              {t.units.toFixed(4)}
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-slate-700">
                              ₹{t.executionNav.toFixed(2)}
                            </td>
                            <td className="px-5 py-3.5 text-right font-black text-slate-900">
                              ₹{t.totalAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span>All holdings update automatically based on AMFI NAV values.</span>
              <Link
                href="/student/classrooms"
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold transition-all"
              >
                Back to classrooms
              </Link>
            </div>

      </div>
    </div>
  );
}

export function PortfolioDetailsModal({ membership }: MembershipPortfolioProps) {
  return (
    <Link
      href={`/student/classrooms/${membership.id}`}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-black shadow-sm transition-all active:scale-[0.98]"
    >
      <PieChart className="h-4 w-4 text-emerald-400" />
      <span>View Holdings & Performance</span>
      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
    </Link>
  );
}
