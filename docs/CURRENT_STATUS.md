# Current Project Status

## Project Overview
- **Project Name**: Investment Simulator
- **Current Development Phase**: Phase 2 & Auth UI Redesign (COMPLETED)
- **Last Updated Date**: 2026-09-24 16:53:00 IST

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

## Completed Work (Update: 2026-09-24 18:02:30 IST)
- Resolved Prisma `Unique constraint failed on the fields: (email)` error in `lib/auth/user-sync.ts`.
- Refactored `syncCurrentUser()` to perform an `OR` lookup on `clerkUserId` or `email` before linking Clerk session IDs with pre-seeded or admin-created user accounts.

## Current Task
- User Sync Email Constraint Fix Complete. Ready for testing & Phase 4 Virtual Trading Engine.


## Next Task
- **Phase 4**: Virtual Trading Engine (`lib/portfolio/buy.ts`, `lib/portfolio/sell.ts` using `prisma.$transaction` and Decimal arithmetic).



## Known Issues
- None.

## Important Files
- `lib/market-data/amfi-sync.ts` - AMFI live text parser and Mutual Fund DB synchronizer.
- `app/api/market-data/sync/route.ts` - AMFI NAV sync trigger endpoint.
- `prisma/seed.ts` - Database seed script for 3 pre-configured seed accounts & mutual funds.
- `components/dashboard/sidebar.tsx` - Reusable role-tailored Sidebar navigation.
- `components/teacher/teacher-analytics.tsx` - Teacher reporting & student distribution chart component.
- `app/(dashboard)/student/funds/page.tsx` - Mutual fund explorer with live AMFI NAVs.

## Tests & Status
- **Prisma Client (`npx prisma generate`)**: PASSED
- **Database Schema Sync (`prisma/schema.prisma`)**: UP-TO-DATE
- **AMFI Ingestion Pipeline (`lib/market-data/amfi-sync.ts`)**: TESTED & READY

