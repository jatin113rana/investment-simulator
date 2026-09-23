# AI Assistance & Verification Log

This file records the usage of AI tools (specifically Google Antigravity / Gemini) during the development of the **Investment Simulator** project. It serves as an open, honest log of AI assistance, architectural contributions, code generation, verification, and human oversight.

---

## Initial Project Setup & Architecture Phase (2026-09-23)

### AI Assistance Provided
- **Architecture Brainstorming & Planning**: Assisted in structuring the fullstack architecture (Next.js App Router, Prisma ORM, Neon PostgreSQL, Zod validation, Clerk).
- **Documentation & Memory System**: Authored the initial project documentation suite (`docs/PROJECT_CONTEXT.md`, `docs/ARCHITECTURE.md`, `CURRENT_STATUS.md`, `DECISIONS.md`, `.agents/rules/project-rules.md`, and `README.md`).
- **Financial Correctness Principles**: Formulated non-negotiable architectural rules regarding server-side math, `Decimal` types (`@db.Decimal(18, 4)`), atomic database transactions, and client untidiness.
- **Directory Structure & Setup**: Established initial project folder conventions (`app/`, `components/`, `lib/`, `prisma/`, `tests/`) and baseline files (`schema.prisma`, health route, package configurations).

---

## Database Schema, Phone Auth & Neon Migration Phase (2026-09-23)

### AI Assistance Provided
- **Full Database Schema Design**: Designed the complete Prisma database schema in `prisma/schema.prisma` covering Users (supporting optional `email` and unique `phoneNumber` for Clerk SMS OTP authentication), RBAC (`ADMIN`, `TEACHER`, `STUDENT`), Classrooms, Student Memberships (Rupee Currency ₹), Mutual Funds, Daily Fund Price History, Holdings, and Immutable Transaction Ledgers.
- **Neon PostgreSQL Migrations**: Created versioned SQL migration files (`prisma/migrations/20260923175018_init/` & `prisma/migrations/20260923180500_add_phone_number/`) and executed `npx prisma migrate deploy` to sync schema changes to Neon Serverless PostgreSQL.
- **Decision Log Updates**: Documented decisions in `DECISIONS.md`:
  - **Official AMFI Daily Feed**: Selected `https://portal.amfiindia.com/spages/NAVAll.txt` as the authoritative market-data source.
  - **Clerk Authentication**: Selected Clerk (`@clerk/nextjs`) with dual Email & Phone SMS OTP authentication and 3-Role RBAC (`ADMIN`, `TEACHER`, `STUDENT`).
  - **Rupee Currency (₹)**: Standardized starting balance (₹10,000) and all monetary fields in INR.

### Human Verification
- Verified non-interactive deployment strategy via `npx prisma migrate deploy`.
- Verified TypeScript compilation: `npm run typecheck` (Passed - 0 errors).
