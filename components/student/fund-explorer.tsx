"use client";

import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TradeModal } from "@/components/student/trade-modal";
import { getStudentPortfolioSummaries } from "@/lib/classroom";
import { fetchUserRoleAndRedirectPath } from "@/lib/auth/rbac";
import {
  Search,
  Filter,
  RefreshCw,
  Building2,
} from "lucide-react";
import { Role } from "@prisma/client";

interface MutualFundItem {
  id: string;
  schemeCode: string;
  name: string;
  category: string;
  fundHouse: string | null;
  currentNav: number;
  date?: string;
  updatedAt: string;
}

interface FundExplorerProps {
  expectedRole: Role;
}

export function FundExplorer({ expectedRole }: FundExplorerProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [funds, setFunds] = useState<MutualFundItem[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [authRes, syncRes, memRes] = await Promise.all([
        fetchUserRoleAndRedirectPath().catch(() => null),
        fetch("/api/market-data/funds").then((response) => response.json()).catch(() => null),
        expectedRole === Role.STUDENT ? getStudentPortfolioSummaries().catch(() => []) : Promise.resolve([]),
      ]);

      if (!authRes?.authenticated || authRes.role !== expectedRole) {
        window.location.href = "/dashboard";
        return;
      }

      setUserProfile(authRes);
      if (Array.isArray(syncRes?.funds)) setFunds(syncRes.funds);
      if (Array.isArray(memRes)) setMemberships(memRes);
    } catch (error) {
      console.error("Failed to load mutual funds data:", error);
    } finally {
      setLoading(false);
    }
  }, [expectedRole]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleManualSync = async () => {
    setSyncing(true);
    if (expectedRole === Role.ADMIN) {
      await fetch("/api/market-data/sync", { method: "POST" });
    }
    await loadData();
    setSyncing(false);
  };

  const filteredFunds = funds.filter((fund) => {
    const query = searchTerm.toLowerCase();
    return (
      fund.name.toLowerCase().includes(query) ||
      (fund.fundHouse || "").toLowerCase().includes(query) ||
      fund.schemeCode.toLowerCase().includes(query)
    );
  });

  const roleHeading = expectedRole === Role.ADMIN ? "AMFI Ingestion Data" : "Indian Mutual Fund Explorer & Trade Desk";
  const roleDescription = expectedRole === Role.ADMIN
    ? "Monitor the synchronized AMFI mutual fund catalog and current authoritative NAV data."
    : "Browse NAV prices and execute virtual mutual fund orders in ₹ (INR).";
  const badgeLabel = expectedRole === Role.ADMIN ? "AMFI INGESTION" : expectedRole === Role.TEACHER ? "TEACHER MARKET DESK" : "LIVE AMFI NAV MARKET DATA";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-emerald-100">
      <Sidebar
        role={expectedRole}
        userEmail={userProfile?.email}
        userName={userProfile?.firstName}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={`flex-1 w-full p-4 sm:p-6 lg:p-8 transition-all duration-300 ${sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[288px]"}`}>
        <div className="max-w-7xl mx-auto space-y-8 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-extrabold tracking-wider uppercase mb-1 border border-emerald-200">
                {badgeLabel}
              </span>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{roleHeading}</h1>
              <p className="text-xs text-slate-500 mt-1">{roleDescription}</p>
            </div>

            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 text-emerald-400 ${syncing ? "animate-spin" : ""}`} />
              <span>{syncing ? "Refreshing NAVs..." : expectedRole === Role.ADMIN ? "Sync AMFI Data" : "Refresh Fund Catalog"}</span>
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search scheme name, AMC, or scheme code..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-16 text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin mr-3 text-emerald-600" />
              <span className="text-sm font-semibold">Loading AMFI mutual fund catalog...</span>
            </div>
          ) : filteredFunds.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-lg border border-slate-200 text-slate-500 text-xs font-medium">
              No mutual funds match your search criteria.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredFunds.map((fund) => (
                <div key={fund.schemeCode} className="bg-white rounded-lg p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-black tracking-wider uppercase font-mono">Code: {fund.schemeCode}</span>
                      <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-extrabold">Active AMFI Feed</span>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">{fund.name}</h3>
                    <div className="text-xs text-slate-500 space-y-1">
                      <p className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{fund.fundHouse || "Asset Management Company"}</span></p>
                      <p className="flex items-center gap-1.5 text-[11px] text-slate-400"><Filter className="h-3 w-3 text-slate-400 shrink-0" /><span className="truncate">{fund.category}</span></p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Current NAV</span>
                      <span className="text-xl font-black text-emerald-600">₹{fund.currentNav ? fund.currentNav.toFixed(4) : "0.0000"}</span>
                    </div>
                    {expectedRole === Role.STUDENT ? (
                      <TradeModal fund={fund} memberships={memberships} onTradeComplete={loadData} />
                    ) : (
                      <span className="rounded-lg bg-slate-100 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-500">Read only</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
