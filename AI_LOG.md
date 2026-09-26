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
- **Clerk-Managed Seed Accounts**: Updated `prisma/seed.ts` to provision `admin@jatinrana.online` (ADMIN), `teacher@jatinrana.online` (TEACHER), and `student@jatinrana.online` (STUDENT) through Clerk using the development test password `Insim@123456789`; Prisma stores the linked Clerk IDs without local password hashes.
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

---

## Portfolio Holdings Breakdown, Trade Log & Fixed Sidebar Geometry Phase (2026-09-25 12:24:30 IST)

### AI Assistance Provided
- **Portfolio Details & Holdings Modal**: Developed `PortfolioDetailsModal` (`components/student/portfolio-details-modal.tsx`) giving students complete visibility into their holdings: fund name, category, AMC, units owned, average buy price (cost NAV), current live AMFI NAV, total invested amount, current market value, unrealized P&L (₹ and %), and complete transaction log.
- **Membership Card Upgrade**: Redesigned `MembershipCard` (`components/student/membership-card.tsx`) with Net Worth, Holdings Value, Available Cash, P&L return badges, active fund counts, and direct modal trigger.
- **Data Engine Expansion**: Updated `getStudentMemberships()` in `lib/classroom/index.ts` to include `holdings` (with `fund`) and `transactions` (with `fund`), computing server-side cost averaging and current valuation.
- **Fixed Sidebar Tab Geometry**: Refactored `Sidebar` (`components/dashboard/sidebar.tsx`) with fixed container height (`h-11`), fixed layout padding (`px-3.5` / `justify-center px-0`), fixed icon wrapper (`h-5 w-5`), distinct section hashes (`#users`, `#roster`, `#enrolled`), and exact active route/hash matching to eliminate layout position shifts completely.

---

## Admin System Classrooms Dedicated Route & Analytics Phase (2026-09-25 13:58:30 IST)

### AI Assistance Provided
- **Dedicated Admin System Classrooms Page**: Built `app/(dashboard)/admin/classrooms/page.tsx` rendering a dedicated portal for system-wide classroom auditing.
- **Comprehensive Classroom Analytics**: Displays:
  - **Funds Allotted Per Student** (`startingBalance` in ₹)
  - **Teacher Details** (Name, email address, avatar)
  - **Enrolled Student Count**
  - **Total Allocated Capital & Funds Used** (Total capital allocated vs actual capital invested in mutual funds)
  - **Classroom Net Worth & P&L** (Classroom portfolio valuation, net gain/loss in ₹, and P&L % badge)
  - **Expandable Student Performance Roster**: Roster view showing each student's cash balance, funds used, net worth, and individual P&L.
- **Admin Server Actions**: Built `getAdminDetailedClassrooms()` in `lib/admin/index.ts` calculating server-side portfolio metrics across all classrooms and memberships.
- **Sidebar Navigation Integration**: Updated `components/dashboard/sidebar.tsx` so "System Classrooms" links directly to `/admin/classrooms`.

---

## Student Enrolled Classrooms Dedicated Route & Portfolios Phase (2026-09-25 16:32:30 IST)

### AI Assistance Provided
- **Dedicated Student Classrooms Page**: Built `app/(dashboard)/student/classrooms/page.tsx` rendering a dedicated portal for enrolled classrooms and active portfolio performance.
- **Key Features**:
  - **Join Classroom Card**: Compact inline join code entry bar.
  - **Aggregated Performance Metrics Banner**: Enrolled classrooms count, available virtual cash balance, combined net worth, and overall return P&L (in ₹ and %).
  - **Enrolled Classroom & Portfolio Cards**: Interactive `MembershipCard` grid showing classroom details, teacher info, join code, available cash, active holdings count, P&L badge, and direct trigger for `PortfolioDetailsModal`.
- **Sidebar Integration**: Updated `components/dashboard/sidebar.tsx` so Student's "Enrolled Classrooms" nav item links directly to `/student/classrooms`.

---

## Sidebar Role Consistency & Tab Stabilization Phase (2026-09-25 16:38:40 IST)

### AI Assistance Provided
- **Root Cause Resolution**: Fixed issue where opening `/student/funds` forced the sidebar to switch its role to `Role.STUDENT` regardless of whether an Admin, Teacher, or Student was signed in. Added dynamic server auth role resolution (`fetchUserRoleAndRedirectPath()`) in `app/(dashboard)/student/funds/page.tsx` so the sidebar always preserves the logged-in user's true role.
- **Fixed & Consistent Sidebar Nav Tabs**: Standardized fixed tab ordering across all 3 roles:
  - **ADMIN**: 1. `Dashboard Overview` (`/dashboard`), 2. `User Directory` (`/dashboard#users`), 3. `System Classrooms` (`/admin/classrooms`), 4. `AMFI Mutual Funds` (`/student/funds`).
  - **TEACHER**: 1. `Dashboard & Analytics` (`/dashboard`), 2. `Classroom Roster` (`/dashboard#roster`), 3. `Browse Mutual Funds` (`/student/funds`).
  - **STUDENT**: 1. `My Portfolios` (`/dashboard`), 2. `Enrolled Classrooms` (`/student/classrooms`), 3. `Browse Mutual Funds` (`/student/funds`).

### Verification Performed
- `npm run build`: Passed cleanly with 100% success across all 15 static/dynamic routes and middleware.
- Zero custom CSS, 100% Tailwind utility classes.

## Dashboard Portfolio Consolidation & Route-Based Holdings Phase (2026-09-25 17:00:00 IST)

### AI Assistance Provided
- **Teacher Analytics Consolidation**: Expanded `getTeacherClassrooms()` to calculate server-side allocated capital, invested capital, market value, net worth, and P&L per teacher-owned classroom. Moved classroom cards to `/teacher/classrooms` and replaced the teacher dashboard roster section with aggregate performance analytics.
- **Student Portfolio Dashboard Metrics**: Removed the join-classroom widget from the unified student portfolio dashboard and added enrolled classroom count, available cash, total net worth, and combined return P&L with percentage.
- **Premium Holdings Experience**: Redesigned `components/student/portfolio-details-modal.tsx` with portfolio summary metrics, best-performing fund, responsive holding cards, per-fund P&L emphasis, and allocation bars.
- **Dedicated Portfolio Details Route**: Replaced the modal interaction with `/student/classrooms/[membershipId]`, including student-role verification, membership-scoped loading, not-found handling, sidebar integration, trade log tabs, and preserved buy/sell actions. The existing `PortfolioDetailsModal` export now serves as a navigation link for backward-compatible card usage, while `PortfolioDetailsView` renders the full route page.

### Verification Performed
- Editor diagnostics: clean for the new dynamic route, portfolio view, and membership card.
- Full command-line checks remain pending after the route refactor.

## Role-Segregated Mutual Fund Routes Phase (2026-09-25 17:20:00 IST)

### AI Assistance Provided
- **Dedicated Fund Routes**: Added `/student/funds`, `/teacher/funds`, and `/admin/funds` as separate role entry points. Teacher and admin routes use read-only fund catalog views; student route retains trading behavior.
- **Shared Explorer Component**: Extracted the reusable market catalog UI into `components/student/fund-explorer.tsx`, accepting an expected role and enforcing role verification before rendering.
- **Sidebar Segregation**: Updated `components/dashboard/sidebar.tsx` so teacher Browse Mutual Funds links to `/teacher/funds` and admin AMFI Ingestion Data links to `/admin/funds`, preventing cross-role sidebar changes caused by the previous `/student/funds` redirect path.

### Verification Performed
- Editor diagnostics: clean for the shared explorer, role-specific pages, sidebar, and existing student fund route.

## Market Data Read/Sync Performance Phase (2026-09-25 17:40:00 IST)

### AI Assistance Provided
- **Fast Catalog Read Path**: Added `/api/market-data/funds` backed by `getMutualFunds()` in `lib/market-data/index.ts`, selecting only active fund fields from PostgreSQL and converting Decimal NAV values at the boundary.
- **Removed Sync-on-Read**: Updated student, teacher, and admin fund explorers to read the database catalog on page load instead of downloading and parsing the AMFI feed.
- **Explicit Ingestion Boundary**: Removed the sync route GET handler, restricted the POST handler to admins, and kept AMFI ingestion behind the admin sync action.
- **Response Caching**: Added private short-lived caching for fund catalog and NAV history API responses.

### Verification Performed
- `npm run typecheck`: Passed with 0 errors.

## History, Query Size & Rate Limiting Hardening Phase (2026-09-25 19:00:00 IST)

### AI Assistance Provided
- **Latest History Fix**: Changed NAV history reads to fetch the newest 14 records and reverse them for chronological chart display.
- **Portfolio Query Reduction**: Updated classroom lists and fund browsing to use lightweight portfolio summaries. The detail route now requests one membership and limits transaction history to the latest 50 records.
- **Rate Limiting**: Added `lib/security/rate-limit.ts` and applied limits to fund catalog/history APIs, AMFI sync, buy/sell actions, classroom joining, and admin student assignment.
- **API Feedback**: Rate-limited API responses include `Retry-After` headers.

### Verification Performed
- `npm run typecheck`: Passed with 0 errors.

## Clerk Identity Deletion Consistency Phase (2026-09-26 10:00:00 IST)

### AI Assistance Provided
- **Root Cause Fix**: Admin deletion previously removed only the Prisma profile. The remaining Clerk identity could sign in and `syncCurrentUser()` would recreate a new local profile.
- **Identity Cleanup**: Updated `deleteUserByAdmin()` to resolve the matching Clerk user by email, delete the Clerk identity first, and then delete the Prisma user record.
- **Failure Safety**: If Clerk deletion fails, the local Prisma record is left intact so the account is not partially deleted.

### Verification Performed
- `npm run typecheck`: Passed with 0 errors.

## Admin Clerk User Provisioning Phase (2026-09-26 10:20:00 IST)

### AI Assistance Provided
- **Real Clerk Provisioning**: Replaced placeholder local Clerk IDs in `createUserByAdmin()` with Clerk `createUser()` using the admin-provided email, password, and profile fields.
- **Password Handling**: Added an 8-character minimum password field to the admin modal; passwords are sent to Clerk and are never persisted in Prisma.
- **Cross-System Rollback**: If Prisma profile creation fails after Clerk creation, the newly created Clerk identity is deleted to avoid orphan accounts.

### Verification Performed
- `npm run typecheck`: Passed with 0 errors.

## Current Architecture Documentation Phase (2026-09-26 10:45:00 IST)

### AI Assistance Provided
- Replaced the outdated `docs/ARCHITECTURE.md` with a current architecture reference covering the implemented Clerk authentication, role access matrix, route map, Prisma schema, ACID transaction flows, AMFI data paths, performance controls, rate limits, security boundaries, migrations, and operational verification commands.

## Development Test Authentication & Identity Synchronization Decision (2026-09-26 10:40:00 IST)

### AI Assistance Provided
- **Password-Only Assignment Testing**: Documented the development policy to keep Clerk as the only authentication provider while disabling MFA/mandatory new-device verification only in the isolated Clerk development/testing instance.
- **Controlled Test Accounts**: Documented use of controlled mock or email-alias addresses for development testers, with production verification and MFA policies kept separate.
- **Clerk/Prisma Consistency**: Recorded that admin user creation provisions the Clerk email/password identity and linked Prisma profile, while admin deletion removes the Clerk identity before the Prisma record so deleted accounts cannot be recreated by `syncCurrentUser()`.

### Verification Performed
- The policy and identity synchronization behavior are reflected in `DECISIONS.md` and the current admin implementation.

## Enrolled Classrooms Duplicate Request Fix Phase (2026-09-25 18:25:00 IST)

### AI Assistance Provided
- **Membership Request Deduplication**: Added a five-second module-level request/result cache to `app/(dashboard)/student/classrooms/page.tsx` so Strict Mode remounts and rapid navigation reuse one membership load.
- **Initial Effect Guard**: Prevented duplicate initial classroom loads during development remounts.
- **Targeted Refreshes**: Classroom joins and portfolio trades bypass the cache to show fresh membership data.
- **Read-Only Detail Loading**: Updated `getStudentMemberships()` to use the read-only current-user lookup instead of updating the user record on navigation.

### Verification Performed
- Focused editor diagnostics: passed.
- Final command-line typecheck rerun was skipped by the environment.

## ACID Financial Transactions Phase (2026-09-25 18:40:00 IST)

### AI Assistance Provided
- **Serializable Transaction Helper**: Added `lib/db/serializable-transaction.ts` using PostgreSQL Serializable isolation with retry handling for Prisma `P2034` serialization conflicts.
- **Atomic Buy/Sell**: Moved financial reads, ownership checks, NAV validation, cash/holding checks, balance mutations, holding updates, and immutable transaction creation into one serializable transaction for both buy and sell.
- **Atomic Enrollment Allocation**: Applied the same transaction boundary to student classroom joining and admin student assignment so membership creation and starting cash allocation are race-safe.
- **Stale Read Removal**: Buy/sell operations use read-only role lookup and no longer validate against records read outside the transaction.

### Verification Performed
- `npm run typecheck`: Passed with 0 errors.

## Dashboard Navigation Duplicate Request Fix Phase (2026-09-25 18:15:00 IST)

### AI Assistance Provided
- **Sidebar Prefetch Control**: Set `prefetch={false}` on role navigation links so `/dashboard` is not fetched speculatively before a student or teacher/admin clicks the destination.
- **Shared Dashboard Request Cache**: Added a short five-second module-level request/result cache around the unified dashboard loader to collapse Strict Mode remounts and simultaneous navigation requests.
- **Mutation Invalidation**: Explicitly bypasses the cache after classroom creation, user changes, student assignment, and portfolio trades so displayed data remains fresh.

### Verification Performed
- `npm run typecheck`: Passed with 0 errors.

## Dashboard Request Deduplication & Summary Loading Phase (2026-09-25 18:00:00 IST)

### AI Assistance Provided
- **Read-Only Role Resolution**: Updated `getCurrentUserWithRole()` and normal admin/teacher reads to query by Clerk user ID without updating the database user row on every dashboard visit.
- **Student Summary Query**: Added `getStudentPortfolioSummaries()` to calculate dashboard cash, invested value, market value, net worth, and P&L without loading transaction history.
- **Strict Mode Duplicate Guard**: Added an initial-load ref guard to the unified dashboard so React development remounts do not repeat the dashboard request sequence.
- **Targeted Dashboard Loading**: Updated My Portfolios to use the lightweight summary query while retaining full holdings and transaction loading for dedicated classroom and portfolio detail routes.

### Verification Performed
- `npm run typecheck`: Passed with 0 errors.





