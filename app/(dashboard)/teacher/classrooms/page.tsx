"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ClassroomCard } from "@/components/teacher/classroom-card";
import { CreateClassroomModal } from "@/components/teacher/create-classroom-modal";
import { getTeacherClassrooms } from "@/lib/classroom";
import { fetchUserRoleAndRedirectPath } from "@/lib/auth/rbac";
import { BookOpen, Loader2, Users } from "lucide-react";
import { Role } from "@prisma/client";

export default function TeacherClassroomsPage() {
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadClassrooms = useCallback(async () => {
    setLoading(true);
    try {
      const authRes = await fetchUserRoleAndRedirectPath();
      if (!authRes.authenticated || authRes.role !== Role.TEACHER) {
        window.location.href = "/dashboard";
        return;
      }

      setUserProfile(authRes);
      setClassrooms(await getTeacherClassrooms());
    } catch (error) {
      console.error("Failed to load teacher classrooms:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClassrooms();
  }, [loadClassrooms]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span className="text-sm font-bold">Loading classroom roster...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-emerald-100">
      <Sidebar
        role={Role.TEACHER}
        userEmail={userProfile?.email}
        userName={userProfile?.firstName}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={`flex-1 w-full p-4 sm:p-6 lg:p-8 transition-all duration-300 ${sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[288px]"}`}>
        <div className="max-w-7xl mx-auto p-5 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Classroom Roster</h1>
              <p className="text-xs text-slate-500 mt-1">Review capital allocation, student enrollment, and portfolio performance for every class.</p>
            </div>
            <CreateClassroomModal onCreated={loadClassrooms} />
          </div>

          {classrooms.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
              <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h2 className="font-extrabold text-slate-800 text-lg mb-1">No Classrooms Created Yet</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">Create a classroom to start tracking students and virtual fund performance.</p>
              <CreateClassroomModal onCreated={loadClassrooms} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Classes</span>
                  <span className="mt-2 block text-3xl font-black text-slate-900">{classrooms.length}</span>
                </div>
                <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Students</span>
                  <span className="mt-2 flex items-center gap-2 text-3xl font-black text-slate-900"><Users className="h-6 w-6 text-blue-600" />{classrooms.reduce((sum, classroom) => sum + classroom.studentCount, 0)}</span>
                </div>
                <div className="rounded-lg border border-slate-200/80 bg-white p-5 shadow-2xs">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Allocated Capital</span>
                  <span className="mt-2 block text-2xl font-black text-emerald-700">₹{classrooms.reduce((sum, classroom) => sum + classroom.totalAllocatedCapital, 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {classrooms.map((classroom) => (
                  <ClassroomCard key={classroom.id} classroom={classroom} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
