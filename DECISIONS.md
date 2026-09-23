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

## Decision: PostgreSQL

### Context
The application requires a robust relational database capable of enforcing ACID transactions, foreign key constraints, decimal precision types, and strict data consistency for financial ledgers and classroom structures.

### Decision
We chose PostgreSQL as the primary relational database.

### Reason
PostgreSQL is an industry-standard open-source relational database with native support for `DECIMAL` / `NUMERIC` types, reliable ACID transactions, strong indexing capabilities, and seamless compatibility with Prisma ORM.

### Tradeoffs
Requires running a local PostgreSQL instance or managed container/service during local development compared to SQLite.

---

## Decision: Prisma ORM

### Context
We needed a type-safe database client and migration tool to interact with PostgreSQL from Next.js server components and API routes.

### Decision
We chose Prisma ORM.

### Reason
Prisma generates fully typed TypeScript database clients directly from the `schema.prisma` schema definition. It provides intuitive declarative migrations, handles complex relational queries cleanly, and natively maps PostgreSQL `DECIMAL` types to `Decimal` objects.

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

## Decision: Real mutual fund data/performance

### Context
Choosing between simulated random market prices versus real-world mutual fund market data.

### Decision
We chose to ingest and display real mutual fund market data and daily Net Asset Values (NAVs).

### Reason
Using real fund performance exposes students to authentic market conditions, real asset allocation dynamics, and genuine historical performance trends, significantly enhancing the educational value compared to synthetic random-walk data.

### Tradeoffs
Requires setting up external market data ingestion adapters, handling missing market holiday data, and managing external API dependency constraints.

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
All money amounts, NAV prices, fund units, and transaction values must use `Decimal` objects (via `decimal.js` and Prisma `Decimal`) in code and `DECIMAL` / `NUMERIC` types in PostgreSQL.

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
