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

## Decision: Pre-configured Seed Accounts with Bcrypt Hashing

### Context
Ensuring instant availability of test accounts for all 3 system roles (`ADMIN`, `TEACHER`, `STUDENT`) with fixed email addresses and password `Insim@123`.

### Decision
We established a database seed script (`prisma/seed.ts`) that provisions:
- Admin: `jatinranasiwan113@gmail.com`
- Teacher: `jatinwork1000@gmail.com`
- Student: `jatinranaprep@gmail.com`
with bcrypt-hashed password hashes stored in `User.passwordHash`.

### Reason
Allows seamless authentication testing and immediate access to role-tailored dashboards across environments without manual registration steps.

---

---

## Decision: Single Unified `/dashboard` Route Architecture

### Context
Transitioning from separate `/admin`, `/teacher`, and `/student` URL routes to a single unified `/dashboard` route.

### Decision
We established a single unified dashboard route at `/dashboard` (`app/(dashboard)/dashboard/page.tsx`). Upon sign-in, all authenticated users land on `/dashboard`, where the app inspects their role (`ADMIN`, `TEACHER`, or `STUDENT`) and automatically presents their role-tailored view and sidebar.

### Reason
Eliminates URL fragmentation, prevents confusion on login, provides a clean single dashboard URL structure, and dynamically renders the exact UI/UX and functionalities required for each role.


