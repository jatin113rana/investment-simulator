# Current Project Status

## Project Overview
- **Project Name**: Investment Simulator
- **Current Development Phase**: Portfolio Hardening, Performance & Security (IN PROGRESS)
- **Last Updated Date**: 2026-09-25 19:00:00 IST

## Setup & Schema Status
- [x] Permanent project memory system created (`PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `CURRENT_STATUS.md`, `DECISIONS.md`, `AI_LOG.md`).
- [x] Agent operational rules configured (`.agents/rules/project-rules.md`).
- [x] Rule 16 added to agent rules: 100% Tailwind CSS utility classes exclusively (zero custom CSS), fully responsive layouts.
- [x] README.md established with project details and architecture overview.
- [x] Next.js 15 (App Router, TypeScript, Tailwind CSS, ESLint) initialized.
- [x] Database Schema defined in `prisma/schema.prisma` supporting Users, Roles (`ADMIN`, `TEACHER`, `STUDENT`), Classrooms, Memberships (Rupee Currency ₹), Mutual Funds, Price History, Holdings, and Ledger.
- [x] Neon Serverless PostgreSQL migrations executed (`20260923175018_init`, `20260923180500_add_phone_number`, `20260924155800_remove_phone_number`).
- [x] `@clerk/nextjs` installed and configured in `.env` and `.env.example`.
- [x] Clerk Auth Middleware (`middleware.ts`), Root Auth Consolidation on `/` with tabbed Sign-In/Sign-Up, and `syncCurrentUser()` database user sync created.
- [x] Admin Dashboard (`app/(dashboard)/admin/page.tsx`), User directory table, Role Switcher, Direct User Creation modal, Admin Create Classroom modal, and Admin Student Assignment modal created.
- [x] RBAC Helper (`lib/auth/rbac.ts`) created for role-based dashboard protection and automatic route redirection.
- [x] Custom Clerk Appearance Overrides applied to `app/page.tsx` for a seamless, glassmorphic, native-feeling Auth card without double borders.
- [x] Phase 2 Teacher Classroom Management & Student Join Flow built with 100% Tailwind CSS and full responsiveness.
- [x] Automated checks executed & passed (`npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`).

## Completed Work (Update: 2026-09-23 23:41:40 IST)
- Configured Clerk publishable key, secret key, and routing variables in `.env` and `.env.example`.
- Verified Neon PostgreSQL database schema migrations.
- Prepared implementation plan for Clerk Middleware, Authentication UI pages, and Database User Syncing.

## Completed Work (Update: 2026-09-23 23:49:30 IST)
- Wrapped root layout (`app/layout.tsx`) in `<ClerkProvider>`.
- Implemented `middleware.ts` with route protection rules protecting `/teacher/*`, `/student/*`, `/admin/*` and keeping `/`, `/api/health` public.
- Built database user synchronization service in `lib/auth/user-sync.ts` (`syncCurrentUser()`) and API endpoint `app/api/auth/sync/route.ts` to sync Clerk users directly to the Neon PostgreSQL `User` table.

## Completed Work (Update: 2026-09-24 15:41:00 IST)
- Built 6-character collision-free join code generator in `lib/classroom/code-generator.ts`.
- Implemented classroom Zod validation schemas in `lib/validation/classroom.ts`.
- Developed classroom domain services in `lib/classroom/index.ts` (`createClassroom`, `getTeacherClassrooms`, `joinClassroomByCode`, `getStudentMemberships`).
- Built responsive Teacher Dashboard (`app/(dashboard)/teacher/page.tsx`) and Student Dashboard (`app/(dashboard)/student/page.tsx`).
- Created unit test suite in `tests/classroom.test.ts` (All 7 unit tests passed).

## Completed Work (Update: 2026-09-24 16:04:00 IST)
- Consolidated Sign-In and Sign-Up authentication directly onto the root route (`/`) with an interactive tabbed hero card supporting Email + Password login.
- Migrated schema to remove `phoneNumber` column and restore required `email` field via `20260924155800_remove_phone_number` applied to Neon PostgreSQL.
- Implemented Admin Domain Services in `lib/admin/index.ts` (`getAllUsers`, `createUserByAdmin`, `updateUserRole`, `deleteUserByAdmin`).
- Built responsive Admin Dashboard (`app/(dashboard)/admin/page.tsx`) with system overview metrics, User Directory table, Role Switcher (`ADMIN`, `TEACHER`, `STUDENT`), and User Creation modal (`components/admin/create-user-modal.tsx`).
- Created database seed script (`prisma/seed.ts`) for Admin user bootstrapping.

## Completed Work (Update: 2026-09-24 16:17:30 IST)
- Optimized root page `app/page.tsx` to render the Navbar, hero headline, value proposition features, and tabbed Auth card immediately on `http://localhost:3000/` without blocking on Clerk `isLoaded` state.
- Fixed unescaped JSX apostrophe entities in `app/(dashboard)/teacher/page.tsx`.

## Completed Work (Update: 2026-09-24 16:30:30 IST)
- Created RBAC utility module in `lib/auth/rbac.ts` (`verifyRoleAccess`, `getUserDashboardRedirect`).
- Added Admin server actions in `lib/admin/index.ts`: `adminCreateClassroom()` (create a classroom for any teacher) and `adminAssignStudentToClassroom()` (enroll any student directly in a classroom with default ₹ starting balance).
- Created interactive Admin modal components: `components/admin/assign-student-modal.tsx` and `components/admin/admin-create-classroom-modal.tsx`.
- Updated Admin Dashboard (`app/(dashboard)/admin/page.tsx`) with quick action buttons for Creating Classes, Assigning Students, and viewing all active system classrooms.

## Completed Work (Update: 2026-09-24 16:53:00 IST)
- Redesigned `app/page.tsx` with a glassmorphic background, trust badges, feature cards, and custom Clerk `appearance` overrides to strip Clerk's default inner card borders/backgrounds.
- Transformed the Auth Form into a native, high-converting, premium UI/UX component matching the application's Tailwind CSS design system.
- Verified compilation: `npm run typecheck` (0 errors).

## Completed Work (Update: 2026-09-25 16:38:40 IST)
- Resolved root cause of sidebar tab order/content shifts across Admin, Teacher, and Student roles by adding dynamic role resolution (`fetchUserRoleAndRedirectPath()`) in `app/(dashboard)/student/funds/page.tsx` so the sidebar preserves the active user's true role (`ADMIN`, `TEACHER`, `STUDENT`) when navigating to mutual funds.
- Standardized tab items and fixed display order across all 3 roles in `Sidebar` (`components/dashboard/sidebar.tsx`):
  - **ADMIN**: 1. `Dashboard Overview` (`/dashboard`), 2. `User Directory` (`/dashboard#users`), 3. `System Classrooms` (`/admin/classrooms`), 4. `AMFI Mutual Funds` (`/student/funds`).
  - **TEACHER**: 1. `Dashboard & Analytics` (`/dashboard`), 2. `Classroom Roster` (`/dashboard#roster`), 3. `Browse Mutual Funds` (`/student/funds`).
  - **STUDENT**: 1. `My Portfolios` (`/dashboard`), 2. `Enrolled Classrooms` (`/student/classrooms`), 3. `Browse Mutual Funds` (`/student/funds`).
- Executed production build (`npm run build`) with 100% clean compilation across all 15 static/dynamic routes and middleware.

## Current Task
- Role-consistent dashboards, dedicated classroom routes, teacher portfolio analytics, student aggregate portfolio metrics, and route-based holdings details are implemented and verified with 0 editor diagnostics.

## Next Task
- Production deployment and user testing, including responsive verification of the student portfolio details route and trade refresh behavior.

## Known Issues
- Full command-line verification was not run during the latest UI route refactor; editor diagnostics are clean for the touched files.

## Completed Work (Update: 2026-09-25 17:00:00 IST)
- Moved student classroom portfolio details from a modal/dialog interaction to the dedicated dynamic route `/student/classrooms/[membershipId]`.
- Reworked `PortfolioDetailsModal` into a route link wrapper and reusable `PortfolioDetailsView`, preserving holdings, P&L, trade log, and buy/sell actions.
- Added route-level loading and not-found states with student authentication and membership lookup through `getStudentMemberships()`.
- Upgraded the full-page holdings experience with premium performance summary cards, best-fund callout, responsive active holding cards, P&L emphasis, and allocation bars.
- Removed the student dashboard join-classroom widget and added enrolled classroom count, available cash, total net worth, and overall return P&L metrics to My Portfolios.
- Added a dedicated teacher classroom roster route with per-class allocation, student count, and P&L; replaced teacher dashboard classroom cards with aggregate analytics.

## Completed Work (Update: 2026-09-25 17:20:00 IST)
- Separated the mutual-fund explorer by role: students use `/student/funds`, teachers use `/teacher/funds`, and admins use `/admin/funds`.
- Updated role-specific sidebar links so teacher and admin navigation no longer redirects into the student route or changes sidebar layout after navigation.
- Extracted the shared mutual-fund explorer into `components/student/fund-explorer.tsx` with fixed role input, role-specific headings, student-only trading controls, and read-only teacher/admin catalog views.

## Completed Work (Update: 2026-09-25 17:40:00 IST)
- Removed external AMFI synchronization from normal fund-page loads. Fund pages now read active records directly through `/api/market-data/funds` and `getMutualFunds()`.
- Added short-lived private caching for fund catalog responses and NAV history responses to reduce repeated database work during navigation and chart loading.
- Restricted `/api/market-data/sync` to `ADMIN` users and kept ingestion as an explicit POST action from the admin workflow.
- Added a direct database projection selecting only required fund fields and converting Prisma Decimal NAV values at the API boundary.

## Completed Work (Update: 2026-09-25 18:00:00 IST)
- Optimized unified dashboard navigation by changing normal role lookup from write-on-read Clerk synchronization to a read-only `clerkUserId` lookup.
- Added `getStudentPortfolioSummaries()` so My Portfolios loads summary holdings values without transaction history or full fund relation payloads.
- Added a Strict Mode initial-load guard to prevent duplicate dashboard effects during development remounts.
- Updated teacher and admin read paths to use the read-only role lookup while preserving explicit synchronization for onboarding and mutations.
- Verified with `npm run typecheck` (0 errors).

## Completed Work (Update: 2026-09-25 18:15:00 IST)
- Disabled automatic sidebar link prefetching to prevent a dashboard route request before the user clicks My Portfolios or Dashboard.
- Added a shared five-second dashboard request/cache layer to deduplicate simultaneous and rapid remount loads.
- Updated dashboard mutations and trade refreshes to bypass the cache and reload current data explicitly.
- Verified with `npm run typecheck` (0 errors).

## Completed Work (Update: 2026-09-25 18:25:00 IST)
- Deduplicated the student Enrolled Classrooms load with a five-second shared membership request/cache and an initial Strict Mode load guard.
- Parallelized role and classroom data loading while keeping join and trade refreshes forceful.
- Updated detailed `getStudentMemberships()` reads to use the read-only authenticated user lookup.
- Focused editor diagnostics pass; the environment skipped the final command-line typecheck rerun.

## Completed Work (Update: 2026-09-25 18:40:00 IST)
- Added `runSerializableTransaction()` with three retries for PostgreSQL serialization conflicts.
- Moved buy/sell membership, fund, holding, balance, and ledger operations into serializable ACID transactions.
- Made classroom joining and admin student assignment atomic, including duplicate-enrollment handling.
- Buy/sell flows now use read-only role lookup and avoid stale pre-transaction financial reads.
- Verified with `npm run typecheck` (0 errors).

## Completed Work (Update: 2026-09-25 19:00:00 IST)
- Fixed NAV history ordering to return the latest 14 records in chronological display order.
- Reduced portfolio query size: classroom lists and fund browsing use lightweight summaries; portfolio detail loads one membership with the latest 50 transactions.
- Added process-local rate limiting for fund/history APIs, AMFI sync, buy/sell actions, classroom joining, and admin student assignment.
- Added `Retry-After` responses for rate-limited API calls.
- Production note: replace the in-memory limiter with Redis or another shared store when deploying multiple application instances.
- Verified with `npm run typecheck` (0 errors).

## Important Files
- `lib/portfolio/buy.ts` - Atomic Buy Order server action.
- `lib/portfolio/sell.ts` - Atomic Sell Order server action.
- `lib/portfolio/portfolio.ts` - Portfolio metrics & classroom leaderboard engine.
- `components/student/trade-modal.tsx` - Interactive Buy/Sell trade execution modal.
- `components/student/classroom-leaderboard.tsx` - Classroom net worth ranking leaderboard.
- `app/(dashboard)/dashboard/page.tsx` - Single unified role-tailored dashboard.

## Tests & Status
- **Prisma Client (`npx prisma generate`)**: PASSED
- **Database Schema Sync (`prisma/schema.prisma`)**: UP-TO-DATE & SEEDED
- **AMFI Ingestion Pipeline (`lib/market-data/amfi-sync.ts`)**: TESTED & READY
- **Virtual Trading Engine (`lib/portfolio/buy.ts`, `lib/portfolio/sell.ts`)**: TESTED & ACCURATE
- **Classroom Leaderboards (`lib/portfolio/portfolio.ts`)**: OPERATIONAL


