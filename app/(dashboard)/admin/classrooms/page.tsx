"use client";

import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { AdminCreateClassroomModal } from "@/components/admin/admin-create-classroom-modal";
import { AssignStudentModal } from "@/components/admin/assign-student-modal";
import { getAdminDetailedClassrooms, getAdminClassroomsAndStudents } from "@/lib/admin";
import { fetchUserRoleAndRedirectPath } from "@/lib/auth/rbac";
import {
  BookOpen,
  Users,
  Wallet,
  ShieldCheck,
  Loader2,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronUp,
  Layers,
  ShoppingBag,
  Building2,
  RefreshCw,
} from "lucide-react";
import { Role } from "@prisma/client";

export default function SystemClassroomsPage() {
  const [role, setRole] = useState<Role | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [adminClassroomsList, setAdminClassroomsList] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [expandedClassroomId, setExpandedClassroomId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const authRes = await fetchUserRoleAndRedirectPath();
      if (!authRes.authenticated || authRes.role !== Role.ADMIN) {
        window.location.href = "/dashboard";
        return;
      }

      setRole(authRes.role as Role);
      setUserProfile(authRes);

      const [detailedClassrooms, selectorData] = await Promise.all([
        getAdminDetailedClassrooms(),
        getAdminClassroomsAndStudents(),
      ]);

      setClassrooms(detailedClassrooms);
      setTeachers(selectorData.teachers);
      setStudents(selectorData.students);
      setAdminClassroomsList(selectorData.classrooms);
    } catch (err) {
      console.error("Failed to load admin detailed classrooms:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading || !role) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-purple-100 text-purple-600 shadow-md">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Loading System Classrooms...</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Fetching capital allocation and classroom P&L</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter classrooms by search query
  const filteredClassrooms = classrooms.filter((c) => {
    const query = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query) ||
      c.teacher.name.toLowerCase().includes(query) ||
      c.teacher.email.toLowerCase().includes(query)
    );
  });

  // Calculate system-wide aggregated metrics
  const totalClassrooms = classrooms.length;
  const totalAllocatedCapital = classrooms.reduce((acc, c) => acc + c.totalAllocatedCapital, 0);
  const totalFundsUsed = classrooms.reduce((acc, c) => acc + c.financials.fundsUsed, 0);
  const totalNetWorth = classrooms.reduce((acc, c) => acc + c.financials.totalNetWorth, 0);
  const totalProfitLoss = classrooms.reduce((acc, c) => acc + c.financials.profitLoss, 0);
  const overallReturnPercent = totalFundsUsed > 0 ? (totalProfitLoss / totalFundsUsed) * 100 : 0;
  const isSystemProfit = totalProfitLoss >= 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-purple-100">
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
          
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                System Classrooms Overview
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Monitor funds allotted per student, teacher assignments, student counts, invested capital (funds used), and classroom P&L.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={loadData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 text-emerald-400" />
                <span>Refresh Data</span>
              </button>
              <AdminCreateClassroomModal teachers={teachers} onCreated={loadData} />
              <AssignStudentModal students={students} classrooms={adminClassroomsList} onAssigned={loadData} />
            </div>
          </div>

          {/* Top System-wide Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Classrooms</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-700">
                  <BookOpen className="h-4 w-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">{totalClassrooms}</span>
            </div>

            <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Allocated Capital</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <Wallet className="h-4 w-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">
                ₹{totalAllocatedCapital.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Funds Used (Invested)</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-emerald-700">
                ₹{totalFundsUsed.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">System Net Worth</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <Building2 className="h-4 w-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">
                ₹{totalNetWorth.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Overall Return P&L</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isSystemProfit ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {isSystemProfit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className={`text-xl font-black ${isSystemProfit ? "text-emerald-600" : "text-rose-600"}`}>
                  {isSystemProfit ? "+" : ""}₹{totalProfitLoss.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
                <span className={`text-xs font-extrabold ${isSystemProfit ? "text-emerald-600" : "text-rose-600"}`}>
                  ({isSystemProfit ? "+" : ""}{overallReturnPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

          </div>

          {/* Search Controls */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search classrooms by name, 6-character join code, or teacher name/email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-2xs"
            />
          </div>

          {/* System Classrooms List */}
          <div className="space-y-6">
            {filteredClassrooms.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
                <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                <h3 className="font-extrabold text-slate-800 text-lg mb-1">No System Classrooms Found</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                  {searchTerm ? "No classrooms match your search query." : "No classrooms have been created in the system yet."}
                </p>
                <AdminCreateClassroomModal teachers={teachers} onCreated={loadData} />
              </div>
            ) : (
              filteredClassrooms.map((c) => {
                const isExpanded = expandedClassroomId === c.id;
                const isClassProfit = c.financials.profitLoss >= 0;

                return (
                  <div
                    key={c.id}
                    className="rounded-lg border border-slate-200/80 bg-white shadow-2xs overflow-hidden transition-all hover:shadow-xs"
                  >
                    {/* Classroom Top Bar */}
                    <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-50/40">
                      
                      {/* Classroom Identity */}
                      <div className="space-y-2 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-black text-purple-700 bg-purple-100 border border-purple-200 px-3 py-1 rounded-lg">
                            Code: {c.code}
                          </span>
                          <span className="text-[11px] font-extrabold text-slate-500 bg-slate-200/60 px-2.5 py-0.5 rounded-lg">
                            Created {new Date(c.createdAt).toLocaleDateString("en-IN")}
                          </span>
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                          {c.name}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                          <Users className="h-4 w-4 text-emerald-600" />
                          <span>Teacher: <strong className="text-slate-900 font-extrabold">{c.teacher.name}</strong> ({c.teacher.email})</span>
                        </div>
                      </div>

                      {/* Key Classroom Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-4 rounded-lg border border-slate-200/80 text-xs">
                        <div>
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Funds Allotted/Student</span>
                          <span className="text-base font-black text-slate-900">₹{c.startingBalance.toLocaleString("en-IN")}</span>
                        </div>

                        <div>
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Enrolled Students</span>
                          <span className="text-base font-black text-blue-700">{c.studentCount} Students</span>
                        </div>

                        <div>
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Funds Used (Invested)</span>
                          <span className="text-base font-black text-emerald-700">₹{c.financials.fundsUsed.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                        </div>

                        <div>
                          <span className="block text-[10px] font-extrabold text-slate-400 uppercase">Classroom P&L</span>
                          <span className={`inline-flex items-center gap-0.5 text-base font-black ${isClassProfit ? "text-emerald-600" : "text-rose-600"}`}>
                            {isClassProfit ? "+" : ""}₹{c.financials.profitLoss.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Financial Summary Strip */}
                    <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="flex flex-wrap items-center gap-6 font-semibold text-slate-600">
                        <span>Total Allocated: <strong className="text-slate-900 font-bold">₹{c.totalAllocatedCapital.toLocaleString("en-IN")}</strong></span>
                        <span>Available Cash: <strong className="text-slate-900 font-bold">₹{c.financials.availableCash.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></span>
                        <span>Holdings Value: <strong className="text-slate-900 font-bold">₹{c.financials.holdingsValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></span>
                        <span>Total Net Worth: <strong className="text-slate-900 font-bold">₹{c.financials.totalNetWorth.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</strong></span>
                      </div>

                      <button
                        onClick={() => setExpandedClassroomId(isExpanded ? null : c.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-black transition-all cursor-pointer"
                      >
                        <Users className="h-4 w-4 text-purple-600" />
                        <span>{isExpanded ? "Hide Student Roster" : `View Student Roster (${c.studentCount})`}</span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Expandable Student Roster Table */}
                    {isExpanded && (
                      <div className="p-6 bg-slate-50/60 border-t border-slate-200/80 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <Users className="h-4 w-4 text-purple-600" />
                            <span>Enrolled Student Portfolio Performance Roster</span>
                          </h4>
                          <span className="text-xs text-slate-500 font-bold">{c.students.length} Memberships</span>
                        </div>

                        {c.students.length === 0 ? (
                          <div className="text-center py-8 bg-white rounded-lg border border-dashed border-slate-300 p-6 text-xs text-slate-500 font-medium">
                            No students enrolled in this classroom yet. Use the &quot;Assign Student to Classroom&quot; button above to enroll students!
                          </div>
                        ) : (
                          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs text-slate-600">
                                <thead className="bg-slate-50 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                                  <tr>
                                    <th className="px-5 py-3.5">Student Name</th>
                                    <th className="px-5 py-3.5">Email</th>
                                    <th className="px-5 py-3.5">Available Cash</th>
                                    <th className="px-5 py-3.5">Funds Used (Invested)</th>
                                    <th className="px-5 py-3.5">Holdings Value</th>
                                    <th className="px-5 py-3.5">Total Net Worth</th>
                                    <th className="px-5 py-3.5 text-right">Individual Return (P&L)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {c.students.map((st: any) => {
                                    const stProfit = st.profitLoss >= 0;
                                    return (
                                      <tr key={st.membershipId} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3.5 font-extrabold text-slate-900">
                                          {st.displayName}
                                        </td>
                                        <td className="px-5 py-3.5 text-slate-500">
                                          {st.email}
                                        </td>
                                        <td className="px-5 py-3.5 font-semibold text-slate-700">
                                          ₹{st.cashBalance.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-5 py-3.5 font-bold text-blue-700">
                                          ₹{st.fundsUsed.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-5 py-3.5 font-bold text-indigo-700">
                                          ₹{st.holdingsValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-5 py-3.5 font-black text-slate-900">
                                          ₹{st.netWorth.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-black">
                                          <span className={stProfit ? "text-emerald-600" : "text-rose-600"}>
                                            {stProfit ? "+" : ""}₹{st.profitLoss.toFixed(2)} ({stProfit ? "+" : ""}{st.returnPercent.toFixed(2)}%)
                                          </span>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
