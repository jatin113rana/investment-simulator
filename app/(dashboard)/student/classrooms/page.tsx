"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { JoinClassroomCard } from "@/components/student/join-classroom-card";
import { MembershipCard } from "@/components/student/membership-card";
import { LeaderboardDrawer } from "@/components/teacher/leaderboard-drawer";
import { getStudentPortfolioSummaries } from "@/lib/classroom";
import { fetchUserRoleAndRedirectPath } from "@/lib/auth/rbac";
import {
  BookOpen,
  Wallet,
  ShoppingBag,
  ArrowRight,
  Loader2,
  RefreshCw,
  PieChart,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { Role } from "@prisma/client";

let classroomsRequest: Promise<any[]> | null = null;
let classroomsCache: { data: any[]; expiresAt: number } | null = null;

async function getSharedClassrooms(forceRefresh = false) {
  if (!forceRefresh && classroomsCache && classroomsCache.expiresAt > Date.now()) {
    return classroomsCache.data;
  }

  if (!forceRefresh && classroomsRequest) {
    return classroomsRequest;
  }

  classroomsRequest = getStudentPortfolioSummaries()
    .then((data) => {
      classroomsCache = { data, expiresAt: Date.now() + 5000 };
      return data;
    })
    .finally(() => {
      classroomsRequest = null;
    });

  return classroomsRequest;
}

export default function StudentClassroomsPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [studentMemberships, setStudentMemberships] = useState<any[]>([]);
  const initialLoadStarted = useRef(false);

  const loadData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const [authRes, sMemberships] = await Promise.all([
        fetchUserRoleAndRedirectPath(),
        getSharedClassrooms(forceRefresh),
      ]);
      if (!authRes.authenticated) {
        window.location.href = "/";
        return;
      }

      setRole(authRes.role as Role);
      setUserProfile(authRes);
      setStudentMemberships(sMemberships);
    } catch (err) {
      console.error("Failed to load student classrooms page:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialLoadStarted.current) return;
    initialLoadStarted.current = true;
    loadData();
  }, [loadData]);

  if (loading || !role) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 shadow-md">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Loading Enrolled Classrooms...</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Fetching portfolio performance & holdings</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate aggregated totals across all student memberships
  const totalEnrolled = studentMemberships.length;
  const totalCash = studentMemberships.reduce((acc, m) => acc + (m.cashBalance || 0), 0);
  const totalInvested = studentMemberships.reduce((acc, m) => acc + (m.totalInvested || 0), 0);
  const totalMarketValue = studentMemberships.reduce((acc, m) => acc + (m.currentMarketValue || 0), 0);
  const totalNetWorth = totalCash + totalMarketValue;
  const overallProfitLoss = totalMarketValue - totalInvested;
  const overallReturnPercent = totalInvested > 0 ? (overallProfitLoss / totalInvested) * 100 : 0;
  const isOverallProfit = overallProfitLoss >= 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-blue-100">
      {/* Collapsible Sidebar */}
      <Sidebar
        role={role}
        userEmail={userProfile?.email}
        userName={userProfile?.firstName}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 w-full p-4 sm:p-6 lg:p-8 space-y-8 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[288px]"
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-8 p-5">
          
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Enrolled Classrooms & Active Portfolios
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Browse classrooms you&apos;re enrolled in, track portfolio Net Worth, available cash, and view detailed holdings.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* <button
                onClick={loadData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 text-emerald-400" />
                <span>Refresh Data</span>
              </button> */}

              {studentMemberships.length > 0 && (
                <LeaderboardDrawer
                  classrooms={studentMemberships.map((m) => m.classroom)}
                />
              )}

              <Link
                href="/student/funds"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-98"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Browse & Trade Funds</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Join Classroom Action Bar */}
          <div className="space-y-4">
            <JoinClassroomCard onJoined={() => loadData(true)} />
          </div>

          {/* Aggregated Portfolio Metrics Banner */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Enrolled Classrooms</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">{totalEnrolled}</span>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Available Cash</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-emerald-700">
                ₹{totalCash.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Net Worth</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">
                ₹{totalNetWorth.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Overall Return P&L</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isOverallProfit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {isOverallProfit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-xl font-black ${isOverallProfit ? "text-emerald-600" : "text-rose-600"}`}>
                  {isOverallProfit ? "+" : ""}₹{overallProfitLoss.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </span>
                <span className={`text-xs font-extrabold ${isOverallProfit ? "text-emerald-600" : "text-rose-600"}`}>
                  ({isOverallProfit ? "+" : ""}{overallReturnPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

          </div> */}

          {/* Enrolled Classrooms & Active Portfolios Grid */}
          <div className="space-y-4 pt-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>Enrolled Classrooms & Active Portfolios</span>
            </h2>

            {studentMemberships.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
                <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="font-extrabold text-slate-800 text-lg mb-1">Not Enrolled in Any Classroom</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Ask your teacher for a 6-character join code and enter it above to start trading virtual mutual funds!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {studentMemberships.map((m) => (
                  <MembershipCard key={m.id} membership={m} onRefresh={() => loadData(true)} />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
