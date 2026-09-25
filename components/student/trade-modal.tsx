"use client";

import { useState } from "react";
import { executeBuyOrder } from "@/lib/portfolio/buy";
import { executeSellOrder } from "@/lib/portfolio/sell";
import {
  X,
  TrendingUp,
  ArrowRightLeft,
  DollarSign,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  ShoppingBag,
} from "lucide-react";

interface TradeModalProps {
  fund: {
    id: string;
    schemeCode: string;
    name: string;
    category: string;
    currentNav: number;
  };
  memberships: Array<{
    id: string;
    cashBalance: number;
    classroom: {
      name: string;
      code: string;
    };
  }>;
  onTradeComplete?: () => void;
}

export function TradeModal({ fund, memberships, onTradeComplete }: TradeModalProps) {
  const [open, setOpen] = useState(false);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");
  const [selectedMembershipId, setSelectedMembershipId] = useState(memberships[0]?.id || "");
  const [amount, setAmount] = useState<string>("5000");
  const [units, setUnits] = useState<string>("10");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const selectedMembership = memberships.find((m) => m.id === selectedMembershipId) || memberships[0];
  const nav = fund.currentNav;

  const estimatedUnits = tradeType === "BUY" && !isNaN(parseFloat(amount)) ? parseFloat(amount) / nav : 0;
  const estimatedCost = tradeType === "SELL" && !isNaN(parseFloat(units)) ? parseFloat(units) * nav : 0;

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!selectedMembershipId) {
        throw new Error("Please select an enrolled classroom.");
      }

      if (tradeType === "BUY") {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) throw new Error("Enter a valid positive investment amount in ₹.");
        const res = await executeBuyOrder({
          membershipId: selectedMembershipId,
          fundId: fund.id,
          amountInRupees: val,
        });
        setSuccessMsg(res.message);
      } else {
        const val = parseFloat(units);
        if (isNaN(val) || val <= 0) throw new Error("Enter a valid number of units to sell.");
        const res = await executeSellOrder({
          membershipId: selectedMembershipId,
          fundId: fund.id,
          unitsToSell: val,
        });
        setSuccessMsg(res.message);
      }

      if (onTradeComplete) onTradeComplete();
      setTimeout(() => {
        setOpen(false);
        setSuccessMsg(null);
      }, 2000);
    } catch (err: any) {
      setError(err?.message || "Transaction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (memberships.length === 0) {
    return (
      <button
        disabled
        className="px-3.5 py-2 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold border border-slate-200 cursor-not-allowed"
        title="Join a classroom to start trading"
      >
        Join Class to Trade
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-extrabold transition-all shadow-xs cursor-pointer active:scale-95"
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        <span>Trade Fund</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-lg p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="inline-block px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black tracking-wider uppercase mb-1">
                  Virtual Trade Execution
                </span>
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {fund.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Code: {fund.schemeCode} • Current NAV: <span className="font-bold text-emerald-600">₹{nav.toFixed(4)}</span>
                </p>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Error or Success Alert */}
            {error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-xs font-bold text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleTrade} className="space-y-4 pt-4">
              {/* Buy / Sell Mode Segment Switcher */}
              <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setTradeType("BUY")}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                    tradeType === "BUY"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Buy Fund
                </button>
                <button
                  type="button"
                  onClick={() => setTradeType("SELL")}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                    tradeType === "SELL"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Sell Fund
                </button>
              </div>

              {/* Enrolled Classroom Selector */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Select Enrolled Classroom
                </label>
                <select
                  value={selectedMembershipId}
                  onChange={(e) => setSelectedMembershipId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-slate-50/70 focus:bg-white focus:border-emerald-500 focus:outline-none"
                >
                  {memberships.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.classroom.name} (Code: {m.classroom.code}) — Avail: ₹{m.cashBalance.toLocaleString("en-IN")}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input */}
              {tradeType === "BUY" ? (
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Investment Amount in ₹ (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="100"
                      min="100"
                      max={selectedMembership?.cashBalance || 1000000}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:border-emerald-500 focus:outline-none bg-slate-50/70 focus:bg-white"
                      placeholder="e.g. 5000"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">
                    Units to Sell
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0.0001"
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-900 focus:border-rose-500 focus:outline-none bg-slate-50/70 focus:bg-white"
                    placeholder="e.g. 10.5"
                    required
                  />
                </div>
              )}

              {/* Estimated Math Box */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500 font-semibold">
                  <span>Execution NAV:</span>
                  <span className="font-bold text-slate-800">₹{nav.toFixed(4)}</span>
                </div>

                {tradeType === "BUY" ? (
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Estimated Units Purchased:</span>
                    <span className="font-bold text-emerald-600">{estimatedUnits.toFixed(4)} units</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-slate-500 font-semibold">
                    <span>Estimated Sales Proceeds:</span>
                    <span className="font-bold text-emerald-600">₹{estimatedCost.toLocaleString("en-IN")}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-500 font-semibold border-t border-slate-200/60 pt-1.5">
                  <span>Virtual Transaction Fee:</span>
                  <span className="font-bold text-slate-800">₹0.00</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-lg text-xs font-extrabold text-white transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 ${
                  tradeType === "BUY"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Trade Order...</span>
                  </span>
                ) : tradeType === "BUY" ? (
                  `Execute Buy Order (₹${parseFloat(amount || "0").toLocaleString("en-IN")})`
                ) : (
                  `Execute Sell Order (${units} Units)`
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
