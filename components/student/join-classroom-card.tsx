"use client";

import { useState } from "react";
import { LogIn, Loader2 } from "lucide-react";
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
      setSuccess(`Successfully joined "${membership.classroom.name}"! Starting cash: ₹${membership.cashBalance.toLocaleString("en-IN")}`);
      setCode("");
      onJoined();
    } catch (err: any) {
      setError(err?.message || "Failed to join classroom.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
          <LogIn className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Join a Classroom</h3>
          <p className="text-xs text-slate-500">Enter the 6-character code provided by your teacher</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200 font-medium">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          maxLength={6}
          required
          placeholder="e.g. FIN10A"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="flex-1 uppercase tracking-widest font-mono text-center text-lg font-bold rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Join Class"}
        </button>
      </form>
    </div>
  );
}
