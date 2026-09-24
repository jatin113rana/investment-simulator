"use client";

import { useState } from "react";
import { LogIn, Loader2, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { joinClassroomByCode } from "@/lib/classroom";

interface JoinClassroomCardProps {
  onJoined: () => void;
}

export function JoinClassroomCard({ onJoined }: JoinClassroomCardProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const membership = await joinClassroomByCode(code);
      setSuccess(`Joined "${membership.classroom.name}"! Virtual Cash: ₹${membership.cashBalance.toLocaleString("en-IN")}`);
      setCode("");
      onJoined();
    } catch (err: any) {
      setError(err?.message || "Failed to join classroom.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Title & Description */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-xs">
            <LogIn className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm">Join Virtual Classroom</h3>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold">
                <Sparkles className="h-3 w-3" />
                Instant Access
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter the 6-character code provided by your teacher
            </p>
          </div>
        </div>

        {/* Right Form & Actions */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 sm:w-auto w-full">
          <input
            type="text"
            maxLength={6}
            required
            placeholder="e.g. FIN10A"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-32 sm:w-36 uppercase tracking-widest font-mono text-center text-sm font-black rounded-2xl border border-slate-200 px-3 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/70 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-md shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Class"}
          </button>
        </form>

      </div>

      {/* Inline Feedback Alerts */}
      {error && (
        <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-700">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
}
