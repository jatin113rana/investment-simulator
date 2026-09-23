# Architecture Specification: Investment Simulator

## Overview
The Investment Simulator is built as a unified Next.js App Router application using TypeScript, PostgreSQL, and Prisma ORM. The architecture enforces strict boundaries between market-data ingestion, server-calculated financial portfolio logic, and frontend presentation components.

```
                  ┌─────────────────────────────────────┐
                  │          Browser / Client           │
                  │  (React Server & Client Components) │
                  └──────────────────┬──────────────────┘
                                     │ HTTPS
                                     ▼
                  ┌─────────────────────────────────────┐
                  │       Next.js App Router (Server)   │
                  │   API Routes / Server Actions       │
                  │   Validation (Zod) + Auth (Auth.js) │
                  └──────────┬──────────────────┬───────┘
                             │                  │
                             ▼                  ▼
┌──────────────────────────────────────┐  ┌───────────────────────────────────┐
│     Portfolio & Trading Service      │  │     Market-Data Ingestion       │
│  - Financial Math (Decimal)          │  │  - External Mutual Fund API Sync  │
│  - Cash & Holding Validation         │  │  - NAV Price History Ingestion    │
│  - Atomic Buy/Sell DB Transactions   │  │  - Authoritative NAV Provider     │
└──────────────────┬───────────────────┘  └─────────────────┬─────────────────┘
                   │                                        │
                   └──────────────────┬─────────────────────┘
                                      ▼
                  ┌─────────────────────────────────────┐
                  │         PostgreSQL Database         │
                  │             (Prisma ORM)            │
                  └─────────────────────────────────────┘
```

## 1. Frontend Architecture
- **Framework**: Next.js (App Router).
- **Server Components (RSC)**: Used by default for page layouts, data fetching, portfolio summaries, and classroom listings to ensure minimal client bundle sizes and secure direct database reads.
- **Client Components**: Isolated to interactive UI elements, such as trade execution forms, filter controls, modal dialogs, and interactive charts.
- **Styling & UI**: Tailwind CSS for responsive styling, combined with `shadcn/ui` primitive components for accessible dialogs, forms, and tables.
- **Data Visualization**: Recharts for rendering fund NAV trend lines and student portfolio performance over time.

## 2. Backend / Server Architecture
- **Layered Service Structure**: Located within `lib/`:
  - `lib/auth/`: Session management, role verification (TEACHER vs STUDENT), and route protection.
  - `lib/db/`: Prisma client instance (`db.ts`) with decimal formatting configuration.
  - `lib/market-data/`: Market data ingestion adapters and NAV retrieval services.
  - `lib/portfolio/`: Domain service for cash balance checks, holding calculations, transaction creation, and portfolio valuation.
  - `lib/validation/`: Zod schemas for all API inputs and server action parameters.
- **API Boundaries**: Next.js API Routes / Server Actions parse requests, validate payloads via Zod, verify authentication context, and delegate to domain services.

## 3. Database Architecture (Prisma & PostgreSQL)
Planned entity relationship schema:
- **User**: Base account (id, email, passwordHash/OAuth, role: TEACHER | STUDENT, createdAt).
- **Classroom**: Created by teachers (id, code, name, startingBalance, teacherId, createdAt).
- **ClassroomMembership**: Student enrollment (id, studentId, classroomId, cashBalance: Decimal, joinedAt).
- **MutualFund**: Fund master catalog (id, symbol, name, category, riskLevel, currentNav: Decimal, updatedAt).
- **FundPriceHistory**: Daily NAV records (id, fundId, nav: Decimal, date: DateTime).
- **Transaction**: Append-only order ledger (id, membershipId, fundId, type: BUY | SELL, units: Decimal, nav: Decimal, totalAmount: Decimal, createdAt).
- **Holding**: Aggregated portfolio position per fund (id, membershipId, fundId, units: Decimal, totalInvested: Decimal, updatedAt).

## 4. Authentication Approach
- **Auth.js (NextAuth.v5)**: Configured with Credentials and/or OAuth providers.
- **Role-Based Access Control (RBAC)**:
  - `TEACHER`: Can create/manage classrooms, inspect all student portfolios within owned classrooms.
  - `STUDENT`: Can join classrooms, view fund market data, execute trades, and view personal portfolios within enrolled classrooms.

## 5. Market-Data Architecture
- **Isolation**: Market-data ingestion (`lib/market-data`) operates independently of core user trading logic.
- **Update Frequency**: Mutual fund Net Asset Values (NAVs) update on a daily cycle.
- **Authoritative Source**: `FundPriceHistory` stores historical daily prices. `MutualFund.currentNav` stores the active authoritative price for trade execution.

## 6. Portfolio & Trading Simulation Architecture
- **Decimal Math**: All financial math uses `decimal.js` / Prisma `Decimal` type to eliminate IEEE-754 floating point rounding errors.
- **Atomic Execution (`prisma.$transaction`)**:
  - For **BUY**:
    1. Lock membership row / verify `cashBalance >= totalAmount`.
    2. Retrieve latest authoritative NAV from `MutualFund`.
    3. Calculate exact units = `totalAmount / nav`.
    4. Deduct `totalAmount` from `cashBalance`.
    5. Create immutable `Transaction` record.
    6. Upsert `Holding` record incrementing `units`.
  - For **SELL**:
    1. Lock holding row / verify `holding.units >= targetUnits`.
    2. Retrieve latest authoritative NAV from `MutualFund`.
    3. Calculate total proceeds = `targetUnits * nav`.
    4. Add proceeds to `cashBalance`.
    5. Create immutable `Transaction` record.
    6. Update or remove `Holding` decrementing `units`.

## 7. Security & Trust Boundaries
- **Untrusted Client**: The client supplies ONLY user intention (e.g. "Buy $500 of Fund X" or "Sell 10 units of Fund Y").
- **Server Enforcement**: NAV, cash sufficiency, asset ownership, and role authorizations are verified on the server.
- **Input Sanitization**: All inputs are validated via Zod schemas before hitting business logic.

## 8. Testing Strategy
- **Unit & Integration Tests (Vitest)**:
  - Financial decimal calculations.
  - Buy/sell validation logic (insufficient funds, insufficient holdings).
  - Portfolio valuation math.
  - API endpoint input validation schemas.
- **End-to-End Tests (Playwright)**:
  - Teacher creates classroom -> Student joins with code -> Student executes buy trade -> Portfolio updates.
