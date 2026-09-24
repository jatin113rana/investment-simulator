"use client";

import { useState, useEffect } from "react";
import { ClassroomLeaderboard } from "@/components/student/classroom-leaderboard";
import { Trophy, X, ChevronRight, Sparkles } from "lucide-react";

interface LeaderboardDrawerProps {
  classrooms: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

export function LeaderboardDrawer({ classrooms }: LeaderboardDrawerProps) {
  const [open, setOpen] = useState(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState(classrooms[0]?.id || "");

  useEffect(() => {
    if (classrooms.length > 0 && !selectedClassroomId) {
      setSelectedClassroomId(classrooms[0].id);
    }
  }, [classrooms, selectedClassroomId]);

  if (classrooms.length === 0) return null;

  const currentClassroom = classrooms.find((c) => c.id === selectedClassroomId) || classrooms[0];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-2xl text-xs font-black shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
      >
        <Trophy className="h-4 w-4 text-amber-100" />
        <span>View Classroom Leaderboard</span>
        <ChevronRight className="h-3.5 w-3.5 text-amber-200" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Right Slide-Over Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
              
              {/* Drawer Top Header */}
              <div className="p-5 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">
                      Live Rankings
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Real-time net worth rankings & performance
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Classroom Selector */}
              {classrooms.length > 1 && (
                <div className="px-5 py-3 border-b border-slate-100 bg-white">
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                    Select Classroom
                  </label>
                  <select
                    value={selectedClassroomId}
                    onChange={(e) => setSelectedClassroomId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-amber-500"
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Code: {c.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Leaderboard Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {selectedClassroomId ? (
                  <ClassroomLeaderboard
                    classroomId={selectedClassroomId}
                    classroomName={currentClassroom.name}
                  />
                ) : (
                  <div className="text-center py-10 text-xs text-slate-400">
                    Select a classroom to view rankings.
                  </div>
                )}
              </div>

              {/* Footnote */}
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center text-[11px] text-slate-400 font-semibold">
                Rankings automatically update based on live AMFI NAV fund valuations
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
