"use client";

import { useEffect, useState, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { CreateClassroomModal } from "@/components/teacher/create-classroom-modal";
import { ClassroomCard } from "@/components/teacher/classroom-card";
import { TeacherAnalytics } from "@/components/teacher/teacher-analytics";
import { JoinClassroomCard } from "@/components/student/join-classroom-card";
import { MembershipCard } from "@/components/student/membership-card";
import { CreateUserModal } from "@/components/admin/create-user-modal";
import { AssignStudentModal } from "@/components/admin/assign-student-modal";
import { AdminCreateClassroomModal } from "@/components/admin/admin-create-classroom-modal";
import { getTeacherClassrooms, getStudentMemberships } from "@/lib/classroom";
import { getAllUsers, updateUserRole, deleteUserByAdmin, getAdminClassroomsAndStudents } from "@/lib/admin";
import { fetchUserRoleAndRedirectPath } from "@/lib/auth/rbac";
import {
  BookOpen,
  Users,
  Wallet,
  ShieldCheck,
  UserCheck,
  Trash2,
  Loader2,
  IndianRupee,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { Role } from "@prisma/client";

export default function UnifiedDashboard() {
  const [role, setRole] = useState<Role | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Admin State
  const [users, setUsers] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [adminClassrooms, setAdminClassrooms] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [syncingAmfi, setSyncingAmfi] = useState(false);

  // Teacher State
  const [teacherClassrooms, setTeacherClassrooms] = useState<any[]>([]);

  // Student State
  const [studentMemberships, setStudentMemberships] = useState<any[]>([]);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const authRes = await fetchUserRoleAndRedirectPath();
      if (!authRes.authenticated || !authRes.role) {
        window.location.href = "/";
        return;
      }

      setRole(authRes.role as Role);
      setUserProfile(authRes);

      if (authRes.role === Role.ADMIN) {
        const [allUsers, adminData] = await Promise.all([
          getAllUsers(),
          getAdminClassroomsAndStudents(),
        ]);
        setUsers(allUsers);
        setTeachers(adminData.teachers);
        setStudents(adminData.students);
        setAdminClassrooms(adminData.classrooms);
      } else if (authRes.role === Role.TEACHER) {
        const tClassrooms = await getTeacherClassrooms();
        setTeacherClassrooms(tClassrooms);
      } else {
        const sMemberships = await getStudentMemberships();
        setStudentMemberships(sMemberships);
      }
    } catch (err) {
      console.error("Failed to load unified dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Admin Actions
  const handleRoleChange = async (userId: string, newRole: Role) => {
    setActionLoading(userId);
    try {
      await updateUserRole(userId, newRole);
      await loadDashboardData();
    } catch (err: any) {
      alert(err?.message || "Failed to update user role.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user profile?")) return;
    setActionLoading(userId);
    try {
      await deleteUserByAdmin(userId);
      await loadDashboardData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncAMFI = async () => {
    setSyncingAmfi(true);
    try {
      const res = await fetch("/api/market-data/sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert(`AMFI Sync Successful! Ingested ${data.totalFundsSynced} Mutual Funds.`);
      } else {
        alert(data.error || "Sync failed");
      }
    } catch (err) {
      alert("Error triggering AMFI sync.");
    } finally {
      setSyncingAmfi(false);
    }
  };

  if (loading || !role) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans p-4">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-md">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900">Loading Your Dashboard...</h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">Fetching account role and permissions</p>
          </div>
        </div>
      </div>
    );
  }

  const studentTotalCash = studentMemberships.reduce((acc, m) => acc + m.cashBalance, 0);
  const adminCount = users.filter((u) => u.role === Role.ADMIN).length;
  const teacherCount = users.filter((u) => u.role === Role.TEACHER).length;
  const studentCount = users.filter((u) => u.role === Role.STUDENT).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans">
      {/* Dynamic Role-Based Sidebar */}
      <Sidebar
        role={role}
        userEmail={userProfile?.email}
        userName={userProfile?.firstName}
      />

      {/* Main Role-Specific View */}
      <main className="flex-1 lg:pl-72 w-full p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* ================================================================= */}
        {/* ROLE 1: ADMIN DASHBOARD VIEW                                     */}
        {/* ================================================================= */}
        {role === Role.ADMIN && (
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-[11px] font-extrabold tracking-wider uppercase mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-600" />
                  System Admin Superpowers
                </span>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Admin & System Directory Portal
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Provision user accounts, change roles, assign students to classrooms, and trigger AMFI NAV sync.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleSyncAMFI}
                  disabled={syncingAmfi}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${syncingAmfi ? "animate-spin" : ""}`} />
                  <span>{syncingAmfi ? "Syncing AMFI..." : "Sync AMFI Data"}</span>
                </button>
                <CreateUserModal onCreated={loadDashboardData} />
                <AdminCreateClassroomModal teachers={teachers} onCreated={loadDashboardData} />
                <AssignStudentModal students={students} classrooms={adminClassrooms} onAssigned={loadDashboardData} />
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Users</span>
                  <span className="text-2xl font-black text-slate-900">{users.length}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Admins</span>
                  <span className="text-2xl font-black text-slate-900">{adminCount}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Teachers</span>
                  <span className="text-2xl font-black text-slate-900">{teacherCount}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xs flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <UserCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Students</span>
                  <span className="text-2xl font-black text-slate-900">{studentCount}</span>
                </div>
              </div>
            </div>

            {/* User Directory Table */}
            <div className="rounded-3xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200/80 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900">User Directory & Role Management</h2>
                <span className="text-xs text-slate-500 font-bold">{users.length} Profiles</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3.5">User</th>
                      <th className="px-6 py-3.5">Role</th>
                      <th className="px-6 py-3.5">Classrooms / Enrolled</th>
                      <th className="px-6 py-3.5">Joined Date</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-extrabold text-slate-900">
                            {u.firstName || u.lastName ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "No Name"}
                          </div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
                              u.role === Role.ADMIN
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : u.role === Role.TEACHER
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-blue-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-700">
                          {u.role === Role.TEACHER && `${u._count.createdClassrooms} Created`}
                          {u.role === Role.STUDENT && `${u._count.classroomMemberships} Enrolled`}
                          {u.role === Role.ADMIN && "System Admin"}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={u.role}
                              disabled={actionLoading === u.id}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                              className="rounded-xl border border-slate-200 px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                            >
                              <option value={Role.STUDENT}>Set Student</option>
                              <option value={Role.TEACHER}>Set Teacher</option>
                              <option value={Role.ADMIN}>Set Admin</option>
                            </select>
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={actionLoading === u.id}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ROLE 2: TEACHER DASHBOARD VIEW                                   */}
        {/* ================================================================= */}
        {role === Role.TEACHER && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-extrabold tracking-wider uppercase mb-1">
                  Teacher Dashboard
                </span>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Classroom & Student Analytics
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Create virtual classrooms, monitor student portfolios, and manage starting virtual capital in ₹ (INR).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <CreateClassroomModal onCreated={loadDashboardData} />
              </div>
            </div>

            {/* Analytics & Visual Distribution Component */}
            <TeacherAnalytics
              classrooms={teacherClassrooms}
              onCreateClassroomClick={() => {
                const btn = document.querySelector("[data-create-classroom-btn]") as HTMLButtonElement;
                if (btn) btn.click();
              }}
            />

            {/* Classroom Cards Grid */}
            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <span>Active Classroom Cards</span>
              </h2>

              {teacherClassrooms.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
                  <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="font-extrabold text-slate-800 text-lg mb-1">No Classrooms Created Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
                    You haven&apos;t created any virtual investment classrooms yet. Launch your first classroom!
                  </p>
                  <CreateClassroomModal onCreated={loadDashboardData} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teacherClassrooms.map((c) => (
                    <ClassroomCard key={c.id} classroom={c} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* ROLE 3: STUDENT DASHBOARD VIEW                                   */}
        {/* ================================================================= */}
        {role === Role.STUDENT && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-[11px] font-extrabold tracking-wider uppercase mb-1">
                  Student Dashboard
                </span>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                  Virtual Investment Portfolios
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Join classrooms with teacher codes, browse Indian mutual funds, and execute virtual trades in ₹ (INR).
                </p>
              </div>

              <Link
                href="/student/funds"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-[0.98]"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Browse Mutual Funds</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <BookOpen className="h-7 w-7" />
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">Enrolled Classrooms</span>
                  <span className="text-3xl font-black text-slate-900">{studentMemberships.length}</span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Wallet className="h-7 w-7" />
                </div>
                <div>
                  <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider">Available Virtual Cash</span>
                  <span className="text-3xl font-black text-slate-900">₹{studentTotalCash.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Join Classroom Card */}
            <div className="space-y-4">
              <JoinClassroomCard onJoined={loadDashboardData} />
            </div>

            {/* Enrolled Classrooms Grid */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span>Enrolled Classrooms & Portfolios</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studentMemberships.map((m) => (
                    <MembershipCard key={m.id} membership={m} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
