"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import {
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  LineChart,
  ShoppingBag,
  Building2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Role } from "@prisma/client";

interface MutualFundItem {
  id: string;
  schemeCode: string;
  name: string;
  category: string;
  fundHouse: string | null;
  currentNav: number;
  updatedAt: string;
}

export default function StudentFundsPage() {
  const [funds, setFunds] = useState<MutualFundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [syncing, setSyncing] = useState(false);

  const loadFunds = async () => {
    setLoading(true);
    try {
      // Trigger sync or load funds directly via sync API
      const res = await fetch("/api/market-data/sync", { method: "GET" });
      const data = await res.json();
      if (data.funds) {
        setFunds(data.funds);
      }
    } catch (err) {
      console.error("Failed to load mutual funds:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunds();
  }, []);

  const handleManualSync = async () => {
    setSyncing(true);
    await loadFunds();
    setSyncing(false);
  };

  const categories = ["ALL", "Equity", "Index", "Small Cap", "Mid Cap", "Large Cap", "Flexi Cap", "Hybrid"];

  const filteredFunds = funds.filter((fund) => {
    const matchesSearch =
      fund.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (fund.fundHouse && fund.fundHouse.toLowerCase().includes(searchTerm.toLowerCase())) ||
      fund.schemeCode.includes(searchTerm);

    const matchesCategory =
      selectedCategory === "ALL" ||
      fund.category.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      <Sidebar role={Role.STUDENT} />

      <main className="flex-1 lg:pl-72 w-full p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-extrabold tracking-wider uppercase mb-1">
              Live AMFI NAV Market Data
            </span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Indian Mutual Fund Explorer
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Browse real-time daily Net Asset Values (NAVs) sourced from AMFI India in ₹ (INR).
            </p>
          </div>

          <button
            onClick={handleManualSync}
            disabled={syncing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-emerald-400 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Refreshing NAVs..." : "Refresh Live NAVs"}</span>
          </button>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search scheme name, AMC (e.g. HDFC, Parag Parikh, SBI), or Scheme Code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-2xs"
            />
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mutual Funds Grid */}
        {loading ? (
          <div className="flex items-center justify-center p-16 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mr-3 text-emerald-600" />
            <span className="text-sm font-semibold">Loading AMFI Mutual Fund catalog...</span>
          </div>
        ) : filteredFunds.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs font-medium">
            No mutual funds match your search criteria. Try adjusting filters or search terms.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredFunds.map((fund) => (
              <div
                key={fund.schemeCode}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-black tracking-wider uppercase font-mono">
                      Code: {fund.schemeCode}
                    </span>
                    <span className="inline-block px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-extrabold">
                      Active AMFI Feed
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-2">
                    {fund.name}
                  </h3>

                  <div className="text-xs text-slate-500 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{fund.fundHouse || "Asset Management Company"}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Filter className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{fund.category}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                      Current NAV
                    </span>
                    <span className="text-xl font-black text-emerald-600">
                      ₹{fund.currentNav.toFixed(4)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 block">
                      NAV Date
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {fund.date || "Today"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
