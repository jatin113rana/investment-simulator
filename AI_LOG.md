# AI Assistance & Verification Log

This file records the usage of AI tools (specifically Google Antigravity / Gemini) during the development of the **Investment Simulator** project. It serves as an open, honest log of AI assistance, architectural contributions, code generation, verification, and human oversight.

---

## Initial Project Setup & Architecture Phase (2026-09-23 20:30:00 IST)

### AI Assistance Provided
- **Architecture Brainstorming & Planning**: Assisted in structuring the fullstack architecture (Next.js App Router, Prisma ORM, Neon PostgreSQL, Zod validation, Clerk).
- **Documentation & Memory System**: Authored the initial project documentation suite (`docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, `CURRENT_STATUS.md`, `DECISIONS.md`, `.agents/rules/project-rules.md`, and `README.md`).
- **Financial Correctness Principles**: Formulated non-negotiable architectural rules regarding server-side math, `Decimal` types (`@db.Decimal(18, 4)`), atomic database transactions, and client untidiness.
- **Directory Structure & Setup**: Established initial project folder conventions (`app/`, `components/`, `lib/`, `prisma/`, `tests/`) and baseline files (`schema.prisma`, health route, package configurations).

---

## Database Schema, Phone Auth & Neon Migration Phase (2026-09-23 23:25:00 IST)

### AI Assistance Provided
- **Full Database Schema Design**: Designed the complete Prisma database schema in `prisma/schema.prisma` covering Users, RBAC (`ADMIN`, `TEACHER`, `STUDENT`), Classrooms, Student Memberships (Rupee Currency ₹), Mutual Funds, Daily Fund Price History, Holdings, and Immutable Transaction Ledgers.
- **Neon PostgreSQL Migrations**: Created versioned SQL migration files (`prisma/migrations/20260923175018_init/` & `prisma/migrations/20260923180500_add_phone_number/`) and executed `npx prisma migrate deploy` to sync schema changes to Neon Serverless PostgreSQL.
- **Decision Log Updates**: Documented decisions in `DECISIONS.md` for AMFI Daily Feed, Clerk Auth with Phone SMS OTP, 3-Role RBAC (`ADMIN`, `TEACHER`, `STUDENT`), and Rupee Currency (₹).

---

## Clerk Environment Configuration & Auth Preparation Phase (2026-09-23 23:41:40 IST)

### AI Assistance Provided
- **Environment Configuration**: Configured `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and routing variables (`NEXT_PUBLIC_CLERK_SIGN_IN_URL="/"`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL="/"`) in `.env` and `.env.example`.
- **Status & Log Timestamps**: Updated `docs/CURRENT_STATUS.md` and `AI_LOG.md` with timestamps and current milestone status (`2026-09-23 23:41:40 IST`).
- **Auth Implementation Plan**: Authored `implementation_plan.md` for Clerk Middleware, Sign-In/Sign-Up pages, and Neon DB User Syncing.

---

## Clerk Authentication UI, Middleware & User Sync Phase (2026-09-23 23:49:30 IST)

### AI Assistance Provided
- **Clerk Provider Setup**: Configured `<ClerkProvider>` in `app/layout.tsx`.
- **Route Protection Middleware**: Created `middleware.ts` using `clerkMiddleware()` protecting private routes (`/teacher/*`, `/student/*`, `/admin/*`) and permitting public access to `/`, `/api/health`.
- **Neon DB User Sync Engine**: Developed `lib/auth/user-sync.ts` (`syncCurrentUser()`) and API route `app/api/auth/sync/route.ts` to automatically upsert authenticated Clerk users into the Neon PostgreSQL `User` table with `clerkUserId`, `email`, name fields, and `role`.

---

## Teacher Classroom Management & Student Join Flow Phase (2026-09-24 15:41:00 IST)

### AI Assistance Provided
- **Rule 16 Mandate**: Added Rule 16 to `.agents/rules/project-rules.md` requiring 100% Tailwind CSS utility styling and zero custom CSS. Cleaned `app/globals.css` to pure `@tailwind` directives.
- **Join Code Generator**: Implemented `lib/classroom/code-generator.ts` producing collision-free 6-character uppercase alphanumeric join codes (excluding `0`, `O`, `1`, `I`).
- **Classroom Domain Engine**: Developed `lib/classroom/index.ts` with `createClassroom()`, `getTeacherClassrooms()`, `joinClassroomByCode()`, and `getStudentMemberships()`.
- **Responsive UI Components**: Built `components/navbar.tsx`, `components/teacher/create-classroom-modal.tsx`, `components/teacher/classroom-card.tsx`, `components/student/join-classroom-card.tsx`, and `components/student/membership-card.tsx`.
- **Dashboard Pages**: Developed responsive Teacher Dashboard (`app/(dashboard)/teacher/page.tsx`) and Student Dashboard (`app/(dashboard)/student/page.tsx`).

---

## Root Auth Consolidation & Admin Management Phase (2026-09-24 16:04:00 IST)

### AI Assistance Provided
- **Root Route Auth Consolidation**: Updated `app/page.tsx` to handle Sign-In and Sign-Up directly on the root route (`/`) using an interactive tabbed hero card featuring Clerk `<SignIn />` and `<SignUp />` with Email + Password support.
- **Schema Cleanup Migration**: Created migration `prisma/migrations/20260924155800_remove_phone_number/` dropping `phoneNumber` and enforcing required `email` field, deployed to Neon PostgreSQL via `npx prisma migrate deploy`.
- **Admin Domain Engine**: Implemented `lib/admin/index.ts` featuring `getAllUsers()`, `createUserByAdmin()`, `updateUserRole()`, and `deleteUserByAdmin()`.
- **Admin Dashboard UI**: Developed responsive Admin Dashboard (`app/(dashboard)/admin/page.tsx`), User Directory table, Role Switcher (`ADMIN`, `TEACHER`, `STUDENT`), and User Creation modal (`components/admin/create-user-modal.tsx`).
- **Database Seed Script**: Built `prisma/seed.ts` for Admin account bootstrapping.

---

## Root UI Instant Rendering & ESLint Entity Fix Phase (2026-09-24 16:17:30 IST)

### AI Assistance Provided
- **Instant Hero Layout Rendering**: Refactored `app/page.tsx` so that the brand Header, Hero headline, feature cards, and tabbed Auth UI render immediately on `http://localhost:3000/` without blocking on Clerk `isLoaded` auth state.
- **ESLint Entity Fix**: Resolved unescaped apostrophe in `app/(dashboard)/teacher/page.tsx`.

---

## RBAC Protections & Admin Classroom/Student Assignments Phase (2026-09-24 16:30:30 IST)

### AI Assistance Provided
- **RBAC Utility Module**: Built `lib/auth/rbac.ts` (`verifyRoleAccess`, `getUserDashboardRedirect`) for server-side role validation and redirection logic.
- **Admin Classroom & Student Assignment Actions**: Expanded `lib/admin/index.ts` with `adminCreateClassroom()` (create a classroom for any teacher) and `adminAssignStudentToClassroom()` (enroll any student in any classroom with default ₹ starting balance).
- **Admin Modal Components**: Developed `components/admin/assign-student-modal.tsx` and `components/admin/admin-create-classroom-modal.tsx`.
- **Admin Dashboard Enhancement**: Updated `app/(dashboard)/admin/page.tsx` with action buttons for direct student assignment and teacher classroom creation.

### Verification Performed
- `npm run typecheck`: Passed (0 errors).
- `npm run lint`: Passed (0 warnings/errors).
- `npm run test`: Passed (7/7 Vitest tests passed).
- `npm run build`: Passed (All 9 pages & Middleware compiled cleanly).

---

## AMFI Ingestion Pipeline, Seed Accounts & Role-Based Sidebar Phase (2026-09-24 17:27:30 IST)

### AI Assistance Provided
- **AMFI Market Data Ingestion Engine**: Developed `lib/market-data/amfi-sync.ts` parsing live Indian Mutual Fund Net Asset Values (NAVs) from `https://portal.amfiindia.com/spages/NAVAll.txt` and populating `MutualFund` and `FundPriceHistory` tables with top 20 curated funds (Nifty 50, Flexi Cap, Small Cap, Bluechip, Technology).
- **Market Data Sync API**: Created `/api/market-data/sync` endpoint for triggering daily NAV synchronization.
- **Pre-configured Seed Accounts**: Created `prisma/seed.ts` script provisioning `jatinranasiwan113@gmail.com` (ADMIN), `jatinwork1000@gmail.com` (TEACHER), `jatinranaprep@gmail.com` (STUDENT) with bcrypt-hashed password (`Insim@123`).
- **Role-Based Sidebar Navigation**: Created reusable, responsive `Sidebar` component (`components/dashboard/sidebar.tsx`) supporting role-tailored menus, mobile drawer overlays, and role status badges.
- **Teacher Analytics & Visual Charts**: Built `TeacherAnalytics` component (`components/teacher/teacher-analytics.tsx`) featuring visual student enrollment distribution charts, classroom metrics, and join code actions.
- **Mutual Fund Explorer**: Built `app/(dashboard)/student/funds/page.tsx` for searching, filtering, and exploring live AMFI mutual fund NAVs in ₹ (INR).
- **Dashboard Integrations**: Updated Admin (`/admin`), Teacher (`/teacher`), and Student (`/student`) dashboard pages with the unified sidebar and role-tailored views.

---

## Collapsible Sidebar, Leaderboard Slide-Over Drawer & Layout Overlap Resolution Phase (2026-09-24 22:26:30 IST)

### AI Assistance Provided
- **Collapsible Sidebar with Icon Mode & Tooltips**: Refactored `Sidebar` (`components/dashboard/sidebar.tsx`) to support `isCollapsed` state (`w-[80px]` vs `w-[288px]`), CSS hover tooltips on icon tabs, role status tooltips, and collapse/expand toggle buttons.
- **Right Slide-Over Leaderboard Drawer**: Built `LeaderboardDrawer` (`components/teacher/leaderboard-drawer.tsx`) replacing bottom page clutter with a top action button ("View Classroom Leaderboard") that opens a right slide-over panel.
- **Space-Efficient Join Classroom Card**: Compacted `JoinClassroomCard` (`components/student/join-classroom-card.tsx`) into a horizontal action bar with inline code input and instant join button.
- **Layout Overlap Resolution**: Fixed content overlap under fixed sidebar by changing main layout left padding classes from non-standard `lg:pl-76` / `lg:pl-24` to exact arbitrary utilities `lg:pl-[288px]` (open) and `lg:pl-[80px]` (collapsed) in `app/(dashboard)/dashboard/page.tsx` and `app/(dashboard)/student/funds/page.tsx`.

### Verification Performed
- `npm run build`: Passed cleanly with 100% success across 13 routes and middleware.
- Zero custom CSS, 100% Tailwind utility classes.
- All financial calculations verified with Decimal precision.





