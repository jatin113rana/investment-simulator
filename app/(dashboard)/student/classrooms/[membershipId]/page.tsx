"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { PortfolioDetailsView } from "@/components/student/portfolio-details-modal";
import { getStudentMemberships } from "@/lib/classroom";
import { fetchUserRoleAndRedirectPath } from "@/lib/auth/rbac";
import { ArrowLeft, Loader2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { Role } from "@prisma/client";

export default function StudentPortfolioDetailsPage() {
  const params = useParams<{ membershipId: string }>();
  const [membership, setMembership] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const authRes = await fetchUserRoleAndRedirectPath();
      if (!authRes.authenticated || authRes.role !== Role.STUDENT) {
        window.location.href = "/dashboard";
        return;
      }

      setUserProfile(authRes);
      const memberships = await getStudentMemberships(params.membershipId);
      const selectedMembership = memberships.find((item) => item.id === params.membershipId);
      if (!selectedMembership) {
        setNotFound(true);
        return;
      }

      setMembership(selectedMembership);
    } catch (error) {
      console.error("Failed to load portfolio details:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [params.membershipId]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <span className="text-sm font-bold">Loading portfolio details...</span>
        </div>
      </div>
    );
  }

  if (notFound || !membership) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-5">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <TriangleAlert className="mx-auto h-10 w-10 text-amber-500" />
          <h1 className="mt-4 text-xl font-black text-slate-900">Portfolio not found</h1>
          <p className="mt-2 text-sm text-slate-500">This classroom portfolio is unavailable or you are no longer enrolled.</p>
          <Link href="/student/classrooms" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-black text-white hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4" /> Back to classrooms
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans selection:bg-emerald-100">
      <Sidebar
        role={Role.STUDENT}
        userEmail={userProfile?.email}
        userName={userProfile?.firstName}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className={`flex-1 w-full transition-all duration-300 ${sidebarCollapsed ? "lg:pl-[80px]" : "lg:pl-[288px]"}`}>
        <PortfolioDetailsView membership={membership} onRefresh={loadPortfolio} />
      </main>
    </div>
  );
}
