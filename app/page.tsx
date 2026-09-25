"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SignIn, SignUp, useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { fetchUserRoleAndRedirectPath } from "@/lib/auth/rbac";
import {
  TrendingUp,
  BookOpen,
  Users,
  Zap,
  Lock,
  Award,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function Home() {
  const { isSignedIn, isLoaded, user } = useUser();
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [redirecting, setRedirecting] = useState(false);
  const [userRoleLabel, setUserRoleLabel] = useState<string>("");
  const router = useRouter();

  // Automatic direct role redirection on login
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setRedirecting(true);
      fetchUserRoleAndRedirectPath()
        .then((res) => {
          if (res.authenticated && res.redirectPath) {
            setUserRoleLabel(res.role || "User");
            router.replace(res.redirectPath);
          } else {
            setRedirecting(false);
          }
        })
        .catch((err) => {
          console.error("Role redirection error:", err);
          setRedirecting(false);
        });
    }
  }, [isLoaded, isSignedIn, router]);

  const clerkAppearance = {
    elements: {
      rootBox: "w-full flex justify-center",
      cardBox: "w-full shadow-none bg-transparent rounded-none border-0 p-0",
      card: "shadow-none border-0 bg-transparent p-0 w-full",
      header: "hidden",
      formButtonPrimary:
        "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-lg py-3 shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all cursor-pointer border-0 mt-2",
      formFieldInput:
        "w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-slate-50/70 focus:bg-white",
      formFieldLabel: "text-xs font-bold text-slate-700 mb-1",
      footerActionLink: "text-emerald-600 font-bold hover:text-emerald-700 text-xs",
      footerActionText: "text-xs text-slate-500",
      footer: "bg-transparent border-t-0 p-0 mt-4 flex justify-center text-xs text-slate-500",
      dividerLine: "bg-slate-200",
      dividerText: "text-slate-400 text-xs font-medium bg-white px-2.5",
      socialButtonsBlockButton:
        "border border-slate-200 hover:bg-slate-50/80 rounded-lg text-slate-700 font-semibold text-xs transition-all shadow-xs py-2.5 bg-white flex items-center justify-center gap-2",
      identityPreviewText: "text-xs font-semibold text-slate-700",
      identityPreviewEditButton: "text-xs text-emerald-600 font-bold hover:text-emerald-700",
      formFieldErrorText: "text-xs font-medium text-rose-600 mt-1",
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 relative overflow-hidden">
      {/* Background Decorative Glow Gradients */}
      <div className="absolute top-0 right-1/4 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-emerald-200/50 via-teal-200/20 to-transparent blur-3xl opacity-70 pointer-events-none" />
      <div className="absolute bottom-10 left-10 -z-10 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-blue-200/40 via-indigo-200/20 to-transparent blur-3xl opacity-60 pointer-events-none" />

      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-16 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Value Proposition & Overview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-100/90 text-emerald-800 rounded-full text-xs font-extrabold tracking-wide border border-emerald-200/80 shadow-xs">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span>Virtual Money + Live AMFI Mutual Fund NAV Data</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Master Investing in Risk-Free <span className="text-emerald-600">Classrooms.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                A modern financial simulator built for teachers and students. Track real Indian mutual fund NAVs, execute virtual transactions in ₹ (INR), and compete on classroom leaderboards.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 bg-white/90 backdrop-blur-md rounded-lg border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-sm mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span>For Teachers</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Create virtual classrooms with custom initial capital (₹ INR), monitor student portfolios, and track learning progress.
                </p>
              </div>

              <div className="p-5 bg-white/90 backdrop-blur-md rounded-lg border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center gap-2.5 text-blue-600 font-bold text-sm mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <Users className="h-4 w-4" />
                  </div>
                  <span>For Students</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Join classrooms using a unique 6-character code, explore top Indian mutual funds, and build optimized virtual portfolios.
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 pt-3 text-xs font-semibold text-slate-500 border-t border-slate-200/80">
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span>100% Virtual Capital</span>
              </span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>AMFI Daily NAV Ingestion</span>
              </span>
              <span className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-600" />
                <span>Educational Platform</span>
              </span>
            </div>
          </div>

          {/* Right Column: Premium Auth Card / Direct Role Redirection */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="relative rounded-lg bg-white/90 p-6 sm:p-8 backdrop-blur-xl border border-slate-200/80 shadow-2xl shadow-slate-200/60 transition-all overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500" />

              {!isLoaded || (isSignedIn && redirecting) ? (
                /* Instant Role Redirection Spinner State */
                <div className="space-y-6 py-10 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 shadow-inner">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Signing You In...
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      {userRoleLabel
                        ? `Redirecting to your ${userRoleLabel} Dashboard...`
                        : "Detecting account role and loading your dashboard..."}
                    </p>
                  </div>
                </div>
              ) : (
                /* Signed Out State - Segmented Auth Tabs & Styled Clerk Form */
                <div>
                  {/* Clean Tab Switcher */}
                  <div className="flex rounded-lg bg-slate-100/90 p-1.5 mb-6 border border-slate-200/80 shadow-inner">
                    <button
                      onClick={() => setAuthMode("signin")}
                      className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        authMode === "signin"
                          ? "bg-white text-emerald-700 shadow-md shadow-slate-200/60"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => setAuthMode("signup")}
                      className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                        authMode === "signup"
                          ? "bg-white text-emerald-700 shadow-md shadow-slate-200/60"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>

                  <div className="mb-4 text-center">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      {authMode === "signin" ? "Welcome Back" : "Get Started Now"}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {authMode === "signin"
                        ? "Enter your email & password to sign in directly to your dashboard"
                        : "Create a new student or teacher account with email & password"}
                    </p>
                  </div>

                  {/* Clerk Auth Component */}
                  <div className="w-full">
                    {authMode === "signin" ? (
                      <SignIn routing="hash" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard" appearance={clerkAppearance} />
                    ) : (
                      <SignUp routing="hash" fallbackRedirectUrl="/dashboard" forceRedirectUrl="/dashboard" appearance={clerkAppearance} />
                    )}
                  </div>

                  {/* Email & Password / Direct Role Footnote */}
                  <div className="mt-5 pt-4 border-t border-slate-200/80 text-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-600">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>Direct login to Admin, Teacher, or Student dashboard</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
