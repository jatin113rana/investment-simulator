"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
  TrendingUp,
  LayoutDashboard,
  Users,
  BookOpen,
  ShieldCheck,
  LineChart,
  ShoppingBag,
  RefreshCw,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Role } from "@prisma/client";

interface SidebarProps {
  role: Role;
  userEmail?: string;
  userName?: string;
}

export function Sidebar({ role, userEmail, userName }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();

  const displayName = userName || user?.firstName || userEmail?.split("@")[0] || "User";
  const displayEmail = userEmail || user?.primaryEmailAddress?.emailAddress || "";

  // Menu items grouped by role, pointing to unified /dashboard
  const getNavItems = () => {
    switch (role) {
      case Role.ADMIN:
        return [
          { label: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard },
          { label: "User Directory", href: "/dashboard", icon: Users },
          { label: "System Classrooms", href: "/dashboard", icon: BookOpen },
          { label: "AMFI Ingestion Explorer", href: "/student/funds", icon: RefreshCw },
        ];
      case Role.TEACHER:
        return [
          { label: "Dashboard & Analytics", href: "/dashboard", icon: LayoutDashboard },
          { label: "Classroom Roster", href: "/dashboard", icon: Users },
          { label: "Browse Mutual Funds", href: "/student/funds", icon: LineChart },
        ];
      case Role.STUDENT:
      default:
        return [
          { label: "My Portfolios", href: "/dashboard", icon: LayoutDashboard },
          { label: "Browse Mutual Funds", href: "/student/funds", icon: ShoppingBag },
          { label: "Enrolled Classrooms", href: "/dashboard", icon: BookOpen },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    switch (role) {
      case Role.ADMIN:
        return { label: "Admin Superpower", bg: "bg-purple-100 text-purple-800 border-purple-200" };
      case Role.TEACHER:
        return { label: "Educator Portal", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case Role.STUDENT:
      default:
        return { label: "Student Trader", bg: "bg-blue-100 text-blue-800 border-blue-200" };
    }
  };

  const badge = getRoleBadge();

  return (
    <>
      {/* Mobile Menu Toggle Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 shadow-xs">
        <Link href="/" className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="font-extrabold tracking-tight text-slate-900">Investment Sim</span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay Backdrop for Mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Logo Header */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight leading-none block">
                Invest Sim
              </span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mt-0.5">
                Indian NAV Simulator
              </span>
            </div>
          </Link>

          {/* Role Status Badge */}
          <div className="pt-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${badge.bg}`}
            >
              {role === Role.ADMIN && <ShieldCheck className="h-3.5 w-3.5" />}
              {role === Role.TEACHER && <BookOpen className="h-3.5 w-3.5" />}
              {role === Role.STUDENT && <Users className="h-3.5 w-3.5" />}
              <span>{badge.label}</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-2">
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Main Menu
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out Footnote */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold text-slate-900 truncate">{displayName}</div>
                <div className="text-[10px] text-slate-500 truncate">{displayEmail}</div>
              </div>
            </div>

            <SignOutButton>
              <button
                title="Sign Out"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </SignOutButton>
          </div>
        </div>
      </aside>
    </>
  );
}
