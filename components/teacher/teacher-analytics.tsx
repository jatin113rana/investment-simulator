"use client";

import { useState } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  Plus,
  Copy,
  Check,
  Building2,
  DollarSign,
  PieChart,
  BarChart3,
  UserPlus,
  ArrowUpRight,
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
    memberships?: Array<{
      id: string;
      cashBalance: number;
      student: {
        id: string;
        firstName?: string | null;
        lastName?: string | null;
        email: string;
      };
    }>;
  }>;
  onCreateClassroomClick: () => void;
  onAssignStudentClick?: () => void;
}

export function TeacherAnalytics({
  classrooms,
  onCreateClassroomClick,
  onAssignStudentClick,
}: TeacherAnalyticsProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const totalClassrooms = classrooms.length;
  const totalStudents = classrooms.reduce((acc, c) => acc + c.studentCount, 0);
  const totalAllocatedCapital = classrooms.reduce(
    (acc, c) => acc + c.startingBalance * Math.max(1, c.studentCount),
    0
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Active Classrooms
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{totalClassrooms}</div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Ready for student enrollment</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Enrolled Students
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">{totalStudents}</div>
          <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 mt-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Across all active classrooms</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Allocated Virtual Capital
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-3">
            ₹{totalAllocatedCapital.toLocaleString("en-IN")}
          </div>
          <div className="text-xs font-semibold text-purple-600 flex items-center gap-1 mt-1">
            <span>Virtual ₹ INR capital pool</span>
          </div>
        </div>
      </div>

      {/* Classroom Student Distribution Chart & Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Chart Section */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                <span>Classroom Student Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison of student enrollment density per classroom
              </p>
            </div>
          </div>

          {classrooms.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400">
              No classroom data available yet. Create your first classroom!
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              {classrooms.map((c) => {
                const maxCount = Math.max(...classrooms.map((item) => item.studentCount), 1);
                const percent = Math.min(100, Math.round((c.studentCount / maxCount) * 100));

                return (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-slate-800">{c.name}</span>
                      <span className="font-bold text-slate-500">
                        {c.studentCount} {c.studentCount === 1 ? "student" : "students"}
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${Math.max(percent, 8)}%` }}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Classroom Roster Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <span>Classroom Roster</span>
              </h3>
              <button
                onClick={onCreateClassroomClick}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>New</span>
              </button>
            </div>

            {classrooms.length === 0 ? (
              <p className="text-xs text-slate-500">No active classrooms.</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {classrooms.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Initial: ₹{c.startingBalance.toLocaleString("en-IN")} • {c.studentCount} Students
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyCode(c.code)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors"
                      title="Copy Join Code"
                    >
                      {copiedCode === c.code ? (
                        <Check className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-slate-400" />
                      )}
                      <span>{c.code}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {onAssignStudentClick && (
            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={onAssignStudentClick}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs"
              >
                <UserPlus className="h-4 w-4" />
                <span>Assign Student directly</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
