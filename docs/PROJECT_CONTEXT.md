# Project Context: Investment Simulator

## Product Purpose
The **Investment Simulator** is an educational classroom application designed to teach financial literacy and investment concepts to students through hands-on experience. Students manage virtual portfolios using real-world mutual fund market data and performance metrics in a risk-free environment.

## Target Users & Capabilities

### Teachers
- **Create Classrooms**: Set up educational groups/classes with unique join codes.
- **Starting Cash Allocation**: Assign equal virtual starting capital (e.g., $10,000) to every student in a classroom.
- **Monitoring & Analytics**: Track student participation, investment portfolios, trade histories, and overall performance over time.

### Students
- **Join Classroom**: Enter a classroom using a teacher-provided join code.
- **Receive Virtual Capital**: Obtain virtual money allocated for trading within that classroom context.
- **Browse Mutual Funds**: Search and inspect real mutual funds, historical NAVs, risk levels, and categories.
- **Execute Investments**: Buy and sell mutual fund units using virtual funds.
- **Portfolio Tracking**: Monitor virtual portfolio value, asset allocation, gain/loss performance, and transaction history.
- **Financial Learning**: Learn investment strategies, diversification, and market mechanics by making decisions with real data.

## Core Product Loop
```
[Teacher Creates Classroom] 
       │
       ▼
[Students Join with Code & Receive Virtual Cash]
       │
       ▼
[Students Analyze Real Mutual Fund Data]
       │
       ▼
[Students Submit Buy/Sell Virtual Orders]
       │
       ▼
[Server Validates & Executes Orders at Authoritative NAV]
       │
       ▼
[Live Portfolios Update based on Market NAV Changes]
       │
       ▼
[Teacher & Students Monitor Performance & Learning Outcomes]
```

## Core Product Principles
- **VIRTUAL MONEY + REAL MUTUAL FUND DATA/PERFORMANCE**: No real money is ever involved. The application is strictly an educational tool.
- **FINANCIAL RIGOR & DETERMINISM**: Transactions and portfolio valuation follow strict financial integrity rules regardless of being virtual.

## Technology Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript (Strict mode)
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Styling**: Tailwind CSS & shadcn/ui
- **Data Visualization**: Recharts
- **Validation**: Zod
- **Authentication**: Auth.js (NextAuth)
- **Testing**: Vitest (Unit/Integration) & Playwright (E2E)

## High-Level Architecture
- **Fullstack Next.js**: App Router handling server-side rendering, React Server Components for efficient data fetching, and Client Components for interactive UI.
- **Server-Side Financial Domain**: All transaction calculations, cash checks, holdings updates, and valuation logic execute exclusively on the server (`lib/portfolio`).
- **Decoupled Market-Data Ingestion**: A distinct ingestion layer (`lib/market-data`) fetches and persists authoritative Net Asset Value (NAV) data independently from user interactions.

## Financial Correctness Principles (Non-Negotiable)
1. **Never trust financial values supplied by the client**: Inputs from the frontend must only include request intents (e.g., fund ID, dollar amount or unit count).
2. **Server-side execution**: All financial calculations must execute on the server.
3. **Exact Decimal Arithmetic**: Use `Decimal` / database decimal types for money, NAV, unit quantities, and transaction amounts. Never use JavaScript floating-point numbers (`number`) for financial math.
4. **Atomic Transactions**: Buy and sell operations must run inside isolated database transactions (`prisma.$transaction`).
5. **Cash Validation**: Always validate available virtual cash before executing a buy order.
6. **Holding Validation**: Always validate available asset units before executing a sell order.
7. **Immutable Ledger**: Transactions must be stored in an append-only transaction table.
8. **Derived Portfolio Valuation**: Portfolio value must be derived programmatically as `cash_balance + sum(units × latest_authoritative_nav)`.
9. **Authoritative NAV**: The frontend cannot dictate or pass the NAV used for executing a trade. The server retrieves the latest authoritative NAV from the market data service.
10. **Market Data Isolation**: Real mutual fund data must be treated as external market data with clear separation between ingestion and core business logic.
11. **AI Safety**: AI components must never be treated as the source of financial truth or execution logic.

## Scope & Boundaries

### Planned MVP Scope
- Teacher registration & classroom management.
- Student registration & joining via code.
- Virtual cash distribution.
- Real mutual fund catalog & daily NAV history visualization.
- Atomic buy/sell trading simulation.
- Student portfolio dashboard (holdings, balance, returns chart).
- Teacher classroom leaderboard & student overview.

### Explicitly Out-of-Scope
- Real money payments, banking, or brokerage integration.
- Individual stock trading, options, futures, or cryptocurrency.
- Intraday high-frequency trading (mutual funds price daily via NAV).
- Margin trading or short selling.

## AI Usage Boundaries
AI tools may assist with code generation, boilerplate, tests, documentation, and UI components. AI MUST NOT:
- Calculate financial valuations dynamically at runtime.
- Generate or modify market NAV data without authoritative data source verification.
- Bypass database transactions or financial validation rules.
