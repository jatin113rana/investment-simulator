"use client";

import { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Role } from "@prisma/client";

interface SidebarProps {
  role: Role;
  userEmail?: string;
  userName?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  role,
  userEmail,
  userName,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [activeHash, setActiveHash] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== "undefined") {
        setActiveHash(window.location.hash);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const displayName = userName || user?.firstName || userEmail?.split("@")[0] || "User";
  const displayEmail = userEmail || user?.primaryEmailAddress?.emailAddress || "";

  // Fixed menu items per role with unique anchor IDs
  const getNavItems = () => {
    switch (role) {
      case Role.ADMIN:
        return [
          { id: "overview", label: "Dashboard Overview", href: "/dashboard", icon: LayoutDashboard },
          // { id: "users", label: "User Directory", href: "/dashboard#users", icon: Users },
          { id: "classrooms", label: "System Classrooms", href: "/admin/classrooms", icon: BookOpen },
          { id: "funds", label: "AMFI Ingestion Data", href: "/admin/funds", icon: RefreshCw },
        ];
      case Role.TEACHER:
        return [
          { id: "overview", label: "Dashboard & Analytics", href: "/dashboard", icon: LayoutDashboard },
          { id: "roster", label: "Classroom Roster", href: "/teacher/classrooms", icon: Users },
          { id: "funds", label: "Browse Mutual Funds", href: "/teacher/funds", icon: LineChart },
        ];
      case Role.STUDENT:
      default:
        return [
          { id: "portfolios", label: "My Portfolios", href: "/dashboard", icon: LayoutDashboard },
          { id: "enrolled", label: "Enrolled Classrooms", href: "/student/classrooms", icon: BookOpen },
          { id: "funds", label: "Browse Mutual Funds", href: "/student/funds", icon: ShoppingBag },
        ];
    }
  };

  const navItems = getNavItems();

  const getRoleBadge = () => {
    switch (role) {
      case Role.ADMIN:
        return { label: "Admin Superpower", bg: "bg-purple-100 text-purple-800 border-purple-200" };
      case Role.TEACHER:
        return { label: "Teacher Portal", bg: "bg-emerald-100 text-emerald-800 border-emerald-200" };
      case Role.STUDENT:
      default:
        return { label: "Student Trader", bg: "bg-blue-100 text-blue-800 border-blue-200" };
    }
  };

  const badge = getRoleBadge();

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center justify-between bg-white border-b border-slate-200/80 px-4 py-3 shadow-xs">
        <Link href="/" className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
            <TrendingUp className="h-4 w-4" />
          </div>
          <span className="font-extrabold tracking-tight text-slate-900">Investment Sim</span>
        </Link>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer"
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

      {/* Main Sidebar Container - Fixed Dimensions & Static Structure */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0"
        } ${isCollapsed ? "lg:w-[80px]" : "lg:w-[288px]"}`}
      >
        {/* Floating Right-Edge Collapse Toggle Button (50% inside, 50% outside) */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            className="hidden lg:flex absolute -right-3.5 top-7 h-7 w-7 items-center justify-center rounded-full bg-green border border-slate-200/90 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:scale-110 shadow-md shadow-slate-900/10 transition-all cursor-pointer z-50"
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>
        )}

        <div className={`p-4 ${isCollapsed ? "px-3" : "px-5 py-6"} space-y-6 flex-1 overflow-y-auto`}>
          
          {/* Header */}
          <div className="flex items-center justify-between h-10">
            <Link href="/" className="flex items-center gap-3 group min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 truncate">
                  <span className="text-lg font-black text-slate-900 tracking-tight leading-none block">
                    Invest Sim
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block mt-0.5">
                    Investment Simulator
                  </span>
                </div>
              )}
            </Link>
          </div>

          {/* Role Status Badge */}
          <div className="pt-1 h-8 flex items-center">
            {isCollapsed ? (
              <div className="relative group flex justify-center w-full">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${badge.bg}`}>
                  {role === Role.ADMIN && <ShieldCheck className="h-4 w-4" />}
                  {role === Role.TEACHER && <BookOpen className="h-4 w-4" />}
                  {role === Role.STUDENT && <Users className="h-4 w-4" />}
                </div>
                <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-extrabold rounded-lg whitespace-nowrap shadow-lg">
                  {badge.label}
                </div>
              </div>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold border ${badge.bg}`}
              >
                {role === Role.ADMIN && <ShieldCheck className="h-3.5 w-3.5" />}
                {role === Role.TEACHER && <BookOpen className="h-3.5 w-3.5" />}
                {role === Role.STUDENT && <Users className="h-3.5 w-3.5" />}
                <span>{badge.label}</span>
              </span>
            )}
          </div>

          {/* Fixed-Height Navigation Links - Zero Layout Shift */}
          <nav className="space-y-1.5 pt-2">
            {!isCollapsed && (
              <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 mb-2 h-4 flex items-center">
                Main Menu
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const [itemPath, itemHash] = item.href.split("#");
              const isPathMatch = pathname === itemPath;
              const isHashMatch = itemHash ? activeHash === `#${itemHash}` : !activeHash || activeHash === "#overview" || activeHash === "#portfolios";
              const isActive = isPathMatch && isHashMatch;

              return (
                <div key={item.id} className="relative group h-11">
                  <Link
                    href={item.href}
                    prefetch={false}
                    onClick={() => {
                      setMobileOpen(false);
                      if (itemHash) setActiveHash(`#${itemHash}`);
                      else setActiveHash("");
                    }}
                    className={`h-11 w-full flex items-center ${
                      isCollapsed ? "justify-center px-0" : "gap-3 px-3.5"
                    } rounded-lg text-xs font-extrabold transition-colors duration-150 ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                      <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-500"}`} />
                    </div>
                    {!isCollapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                  </Link>

                  {/* Collapsed Hover Tooltip */}
                  {isCollapsed && (
                    <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-extrabold rounded-lg whitespace-nowrap shadow-lg">
                      {item.label}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Sign Out Footnote */}
        <div className={`p-4 border-t border-slate-200/80 bg-slate-50/50 ${isCollapsed ? "px-2" : ""}`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isCollapsed ? "justify-center w-full" : "gap-3 min-w-0"}`}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-xs shadow-2xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-slate-900 truncate">{displayName}</div>
                  <div className="text-[10px] text-slate-500 truncate">{displayEmail}</div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <SignOutButton>
                <button
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </SignOutButton>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
