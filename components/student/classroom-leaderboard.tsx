"use client";

import { useEffect, useState, useCallback } from "react";
import { getClassroomLeaderboard } from "@/lib/portfolio/portfolio";
import { Trophy, TrendingUp, TrendingDown, Medal, User, Loader2, RefreshCw } from "lucide-react";

interface ClassroomLeaderboardProps {
  classroomId: string;
  classroomName: string;
}

export function ClassroomLeaderboard({ classroomId, classroomName }: ClassroomLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClassroomLeaderboard(classroomId);
      setLeaderboard(data);
    } catch (err) {
      console.error("Failed to load classroom leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-black text-xs border border-amber-300">🥇 1</span>;
      case 2:
        return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-700 font-black text-xs border border-slate-300">🥈 2</span>;
      case 3:
        return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-700/10 text-amber-800 font-black text-xs border border-amber-600/30">🥉 3</span>;
      default:
        return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-xs">#{rank}</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black tracking-wider uppercase mb-1">
            <Trophy className="h-3 w-3 text-amber-600" />
            Classroom Rankings
          </span>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            {classroomName} Leaderboard
          </h3>
        </div>

        <button
          onClick={loadLeaderboard}
          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          title="Refresh Leaderboard"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-10 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2 text-emerald-600" />
          <span className="text-xs font-semibold">Calculating rankings & net worth...</span>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400 font-medium">
          No enrolled students in this classroom yet.
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((item) => {
            const isProfit = item.profitLoss >= 0;

            return (
              <div
                key={item.studentId}
                className={`p-4 rounded-lg border transition-all flex items-center justify-between ${
                  item.rank === 1
                    ? "bg-gradient-to-r from-amber-500/10 via-amber-100/30 to-white border-amber-300 shadow-xs"
                    : "bg-slate-50/60 border-slate-200/80 hover:bg-white"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {getRankBadge(item.rank)}

                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-slate-900 truncate">
                      {item.displayName}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate">
                      Cash: ₹{item.cashBalance.toLocaleString("en-IN")} • Holdings: ₹{item.holdingsValue.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-black text-slate-900">
                    ₹{item.netWorth.toLocaleString("en-IN")}
                  </div>
                  <div
                    className={`text-[10px] font-bold flex items-center justify-end gap-0.5 ${
                      isProfit ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {isProfit ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    <span>
                      {isProfit ? "+" : ""}
                      {item.returnPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
