"use client";

import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";
import { TrendingUp, LayoutDashboard, LogIn } from "lucide-react";

export function Navbar() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur support-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-emerald-600 font-bold text-xl tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="hidden sm:inline-block">Investment Simulator</span>
          <span className="sm:hidden">InvestSim</span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-4">
          {isLoaded && isSignedIn && (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs sm:text-sm font-extrabold text-white shadow-xs hover:bg-slate-800 transition-all"
              >
                <LayoutDashboard className="h-4 w-4 text-emerald-400" />
                <span>My Dashboard</span>
              </Link>
              <div className="ml-2 pl-2 border-l border-slate-200 flex items-center">
                <UserButton />
              </div>
            </>
          )}

          {isLoaded && !isSignedIn && (
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
