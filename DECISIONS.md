# Decision Log (Architecture Decision Records)

This document tracks major architectural and product scope decisions for the **Investment Simulator** project.

---

## Decision: Next.js instead of separate React + Node/FastAPI application

### Context
We needed to choose an application architecture for a classroom investment simulator that includes server-rendered UI, secure server-side logic, database access, authentication, and API endpoints.

### Decision
We chose Next.js with the App Router as a fullstack framework, rather than building a decoupled client-server architecture (e.g. React SPA + Node/FastAPI backend).

### Reason
Next.js provides an integrated fullstack developer experience with unified TypeScript types, built-in API routing, React Server Components for direct DB reads, and simplified deployment without managing separate repositories or CORS configurations.

### Tradeoffs
Tighter coupling between frontend presentation and backend API endpoints, though mitigated by keeping business logic isolated in `lib/` modules.

---

## Decision: TypeScript

### Context
Financial simulation applications require high confidence in data structures, API contracts, and domain models to avoid runtime type errors.

### Decision
We chose TypeScript with strict mode enabled across the entire codebase.

### Reason
TypeScript catches type-related bugs at compile time, enables reliable refactoring, provides excellent IDE autocomplete support, and integrates seamlessly with Next.js, Prisma, Zod, and Vitest.

### Tradeoffs
Slightly higher initial boilerplate and build-time compilation overhead compared to plain JavaScript.

---

## Decision: PostgreSQL & Neon Serverless

### Context
The application requires a robust relational database capable of enforcing ACID transactions, foreign key constraints, decimal precision types, versioned migration files, and strict data consistency for financial ledgers and classroom structures.

### Decision
We chose Neon Serverless PostgreSQL as our database cloud infrastructure with Prisma migrations (`npx prisma migrate dev`).

### Reason
Neon provides fully serverless PostgreSQL with instant branching, connection pooling, native `DECIMAL` / `NUMERIC` support, and seamless integration with Prisma ORM.

### Tradeoffs
Requires active network connectivity to the Neon cloud endpoint during development.

---

## Decision: Prisma ORM & Versioned Database Migrations

### Context
We needed a type-safe database client and migration tool to interact with PostgreSQL from Next.js server components and API routes.

### Decision
We chose Prisma ORM with versioned migration SQL files (`prisma/migrations/`).
All database table and schema updates must be maintained through new versioned Prisma migrations and applied with the Prisma migration workflow; direct production schema edits are not the source of truth.

### Reason
Prisma generates fully typed TypeScript database clients directly from `schema.prisma`. Generating explicit migration files tracks schema history in version control, ensuring smooth environment deployments (`npx prisma migrate deploy`).

### Tradeoffs
Prisma abstracts raw SQL queries, which can occasionally require raw SQL escape hatches for highly specialized bulk queries.

---

## Decision: Virtual money only

### Context
Determining the monetary model for the classroom investment simulator application.

### Decision
We strictly enforce virtual money only. No real payment gateways, bank connections, or real money transfers will ever be supported.

### Reason
The primary goal of the application is risk-free financial education for students. Excluding real money eliminates regulatory compliance hurdles, payment processing risk, security liabilities, and financial risk for schools and students.

### Tradeoffs
Students do not experience actual financial risk or real-world monetary consequences, which is the intentional design of an educational simulator.

---

## Decision: Real mutual fund data/performance via Official AMFI Daily Feed

### Context
Selecting an authoritative, reliable, and up-to-date market-data ingestion source for Indian mutual fund Net Asset Values (NAVs).

### Decision
We chose the official AMFI (Association of Mutual Funds in India) daily data feed (`https://portal.amfiindia.com/spages/NAVAll.txt`).

### Reason
AMFI is the official regulatory industry body mandated by SEBI. Every asset management company in India is legally required to upload daily NAVs to this file every business night by 11:00 PM IST. Unlike third-party API mirrors which suffer from scrapers lagging days behind, AMFI provides 100% data freshness, zero cost, and zero rate limits.

### Tradeoffs
Requires parsing a semicolon-delimited text format in Node.js instead of receiving JSON.

---

## Decision: Indian Rupee (₹ / INR) Currency Denomination

### Context
Determining the financial currency denomination for virtual cash, starting balances, NAV values, and trade orders.

### Decision
We strictly use Indian Rupee (₹ / INR) as the baseline currency across the entire application.

### Reason
All mutual fund NAV data ingested from AMFI is priced in INR (₹). Standardizing on ₹ ensures consistency between student virtual cash, fund unit pricing, and portfolio valuations.

### Tradeoffs
The application is tailored primarily for INR financial denomination.

---

## Decision: Clerk Authentication with Role-Based Access Control (RBAC)

### Context
Choosing an authentication framework to manage user signups, logins, sessions, and multi-tier user authorization roles.

### Decision
We chose Clerk (`@clerk/nextjs`) supporting Email + Password authentication, mapped to database `User.email` (required).

### Reason
Clerk provides pre-built, production-ready UI components (`<SignIn />`, `<SignUp />`, `<UserButton />`), middleware route protection (`clerkMiddleware()`), and webhook syncing to our Neon database `User` table. It eliminates password hashing boilerplate while cleanly supporting multi-tier RBAC (`ADMIN`, `TEACHER`, `STUDENT`).

### Tradeoffs
Introduces a third-party managed identity service dependency.

---

## Decision: Development Password-Only Test Authentication

### Context
External reviewers and assignment testers need to access the development application using supplied email/password credentials without being blocked by MFA or new-device verification during testing.

### Decision
Clerk remains the sole authentication provider for both email/password and SSO. MFA and mandatory new-device verification may be disabled only in the isolated Clerk development/testing instance. Test users may use controlled mock addresses such as `student.test@example.com` or verified email aliases; production authentication must retain appropriate verification and MFA policies.

Admin user provisioning and deletion must update both identity systems: Clerk user records and the Prisma `User` profile. Admin-created accounts receive their password in Clerk, while Prisma stores only the real Clerk user ID and role metadata.

### Reason
This keeps authentication, sessions, password storage, and SSO under Clerk while allowing assignment testing to proceed with predictable password-only test accounts. Synchronizing Clerk and Prisma prevents deleted identities from being recreated and prevents database-only accounts from lacking a valid login identity.

### Tradeoffs
Disabling MFA reduces security and is strictly limited to development/testing. Mock addresses must not be used for production users, and testers may still encounter Clerk security checks if the instance enforces them.

---

## Decision: Root Route Auth Consolidation (`/`) & Admin User Provisioning

### Context
Streamlining authentication UX by consolidating sign-in and sign-up interactions directly onto the root route (`/`) and providing direct user provisioning capabilities for Admins (`/admin`).

### Decision
We consolidated all sign-in and sign-up flows directly onto the homepage (`/`) and added Admin management capabilities (`createUserByAdmin`) allowing Admins to directly create Teacher and Student accounts.

### Reason
Consolidating authentication on `/` eliminates unnecessary page redirects and provides a seamless onboarding landing page. Enabling Admin account provisioning allows school/system administrators to bulk create Teacher and Student profiles directly.

### Tradeoffs
Homepage renders a dual-mode Auth card when signed out.

---

## Decision: Server-side financial calculations

### Context
Deciding where financial calculations (buy/sell totals, portfolio values, available cash validations, unit allocations) take place.

### Decision
All financial calculations must execute strictly on the server. The client is treated as an untrusted presentation layer.

### Reason
Client-side financial logic is vulnerable to manipulation via browser developer tools or modified API requests. Running all math on the server ensures integrity, security, and absolute consistency of virtual cash and portfolios.

### Tradeoffs
Slightly increased server computation load per request, which is negligible for our scale.

---

## Decision: Decimal financial values

### Context
JavaScript numbers (`number`) use IEEE-754 double-precision floating-point format, which introduces floating-point precision errors (e.g. `0.1 + 0.2 === 0.30000000000000004`).

### Decision
All money amounts, NAV prices, fund units, and transaction values must use `Decimal` objects (via `decimal.js` and Prisma `Decimal`) in code and `@db.Decimal(18, 4)` types in PostgreSQL.

### Reason
Financial calculations must be mathematically exact to avoid penny-rounding discrepancies, accounting drift, and invalid balance comparisons.

### Tradeoffs
Slightly more verbose syntax when performing mathematical operations (`a.add(b)` instead of `a + b`).

---

## Decision: Atomic buy/sell transactions

### Context
Trading operations involve multiple database mutations (validating balance/holdings, deducting/adding cash, appending to the transaction log, and updating position holdings).

### Decision
Every buy or sell trade must be executed inside a single, atomic database transaction (`prisma.$transaction`).

### Reason
Atomic transactions guarantee that either all database updates succeed together or none do. This prevents partial state corruption (such as cash being deducted without a corresponding transaction log or holding update) if a failure occurs mid-trade.

### Tradeoffs
Slightly longer transaction lock duration on impacted rows during execution.

---

---

## Decision: Atomic Virtual Trading Engine & Decimal Ledger

### Context
Virtual trades (buying and selling Indian mutual funds) require strict mathematical precision, cash sufficiency validation, unit holdings calculation, and immutable audit ledgers.

### Decision
We built `executeBuyOrder` (`lib/portfolio/buy.ts`) and `executeSellOrder` (`lib/portfolio/sell.ts`) running inside atomic `prisma.$transaction` blocks. All amounts, units, NAVs, and total investments use `Decimal.js` and `@db.Decimal(18, 4)`.

### Reason
Guarantees that no partial trade state can occur, prevents penny rounding drift, and ensures absolute financial accuracy for all virtual portfolios.

---

## Decision: Serializable ACID Financial State Transitions

### Context
Buy and sell operations update multiple related records: classroom cash, holdings, and the immutable transaction ledger. Classroom enrollment and admin assignment also allocate starting virtual cash while creating a membership.

### Decision
All buy, sell, student enrollment, and admin assignment operations use a single PostgreSQL `Serializable` transaction through `runSerializableTransaction()`. Serialization conflicts (`P2034`) are retried up to three times. Financial reads, authorization checks, balance/holding validation, mutations, and ledger writes occur inside the transaction boundary.

### Reason
Serializable isolation prevents concurrent trades from validating stale cash or units and prevents duplicate enrollment races from allocating starting cash twice. Atomic commit guarantees that related state changes either all succeed or all roll back.

### Tradeoffs
Serializable transactions can retry or fail under contention, adding small latency during concurrent activity. The retry helper handles expected serialization conflicts while preserving correctness over throughput.

---

---

## Decision: Strict Role Hierarchy (Student Default, Admin-Only Teacher Provisioning, Teacher/Admin Classroom Creation)

### Context
Enforcing clear authorization boundaries for user registration and classroom creation.

### Decision
1. **Default Signup Role**: All new self-service accounts created via public signup default strictly to `STUDENT` in `syncCurrentUser()`.
2. **Teacher Account Provisioning**: `TEACHER` accounts can ONLY be created or assigned by an `ADMIN` via `createUserByAdmin()` or `updateUserRole()` in `lib/admin/index.ts`.
3. **Classroom Creation Guard**: `createClassroom()` in `lib/classroom/index.ts` strictly rejects any creation requests from `STUDENT` accounts. Only `TEACHER` and `ADMIN` roles can generate and share classroom join codes.

### Reason
Prevents unauthorized classroom creation, maintains administrative control over teacher accounts, and ensures students can only participate in classrooms via valid join codes.




