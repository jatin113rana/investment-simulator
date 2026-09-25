"use client";

import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  BarChart3,
  TrendingDown,
  Wallet,
  Sparkles,
} from "lucide-react";

interface TeacherAnalyticsProps {
  classrooms: Array<{
    id: string;
    name: string;
    code: string;
    startingBalance: number;
    createdAt: Date | string;
    studentCount: number;
    totalAllocatedCapital: number;
    totalInvested: number;
    currentMarketValue: number;
    totalNetWorth: number;
    profitLoss: number;
    profitLossPercent: number;
  }>;
}

export function TeacherAnalytics({ classrooms }: TeacherAnalyticsProps) {

  const totalClassrooms = classrooms.length;
  const totalStudents = classrooms.reduce((acc, c) => acc + c.studentCount, 0);
  const totalAllocatedCapital = classrooms.reduce(
    (acc, c) => acc + c.totalAllocatedCapital,
    0
  );
  const totalInvested = classrooms.reduce((acc, c) => acc + c.totalInvested, 0);
  const totalMarketValue = classrooms.reduce((acc, c) => acc + c.currentMarketValue, 0);
  const totalProfitLoss = classrooms.reduce((acc, c) => acc + c.profitLoss, 0);
  const totalReturnPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;
  const maxAbsoluteProfitLoss = Math.max(...classrooms.map((c) => Math.abs(c.profitLoss)), 1);

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-lg p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Total Classrooms
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{totalClassrooms}</div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Across your teaching portfolio</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{totalStudents}</div>
          <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Across all active classrooms</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Total Allocated Capital
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">
            ₹{totalAllocatedCapital.toLocaleString("en-IN")}
          </div>
          <div className="text-xs font-semibold text-purple-600 flex items-center gap-1 mt-1">
            <span>Starting balance across all students</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Portfolio P&L</span>
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${totalProfitLoss >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
              {totalProfitLoss >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
            </div>
          </div>
          <div className={`text-3xl font-black mt-3 ${totalProfitLoss >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
            {totalProfitLoss >= 0 ? "+" : "-"}₹{Math.abs(totalProfitLoss).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          <div className={`text-xs font-semibold flex items-center gap-1 mt-1 ${totalProfitLoss >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            <span>{totalReturnPercent.toFixed(2)}% return on invested capital</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-lg p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                <span>Classroom Performance</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Profit or loss by class against the combined portfolio
              </p>
            </div>
          </div>

          {classrooms.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No classroom data available yet. Create your first classroom!
            </div>
          ) : (
            <div className="space-y-5 pt-2">
              {classrooms.map((c) => {
                const percent = Math.max(8, Math.round((Math.abs(c.profitLoss) / maxAbsoluteProfitLoss) * 100));
                const positive = c.profitLoss >= 0;

                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800">{c.name}</span>
                      <span className={`font-black ${positive ? "text-emerald-700" : "text-rose-700"}`}>
                        {positive ? "+" : "-"}₹{Math.abs(c.profitLoss).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${Math.max(percent, 8)}%` }}
                        className={`${positive ? "bg-emerald-500" : "bg-rose-500"} rounded-full transition-all duration-500`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{c.studentCount} students • ₹{c.totalAllocatedCapital.toLocaleString("en-IN")} allocated</span>
                      <span>{c.profitLossPercent.toFixed(2)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 bg-slate-900 rounded-lg p-6 text-white shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-extrabold flex items-center gap-2"><Wallet className="h-5 w-5 text-emerald-400" /> Portfolio Snapshot</h3>
            <p className="text-xs text-slate-400 mt-1">Live value across all student holdings.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 text-sm">
              <span className="text-slate-400">Invested capital</span><span className="font-black">₹{totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 text-sm">
              <span className="text-slate-400">Current market value</span><span className="font-black">₹{totalMarketValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Capital utilization</span><span className="font-black">{totalAllocatedCapital > 0 ? ((totalInvested / totalAllocatedCapital) * 100).toFixed(1) : "0.0"}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
