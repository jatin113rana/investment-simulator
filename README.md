# Investment Simulator

> An educational classroom simulator enabling students to learn investing using virtual money and real-world mutual fund market data.

---

## 📌 Problem
Financial literacy education often lacks practical, hands-on experience. Theoretical lessons fail to convey the emotional and practical dynamics of asset allocation, market fluctuations, and portfolio management. However, introducing real money into classroom environments carries high risks, regulatory hurdles, and financial inequality among students.

## 💡 Proposed Solution
**Investment Simulator** bridges theoretical education and real market mechanics by providing a risk-free virtual trading environment driven by real mutual fund market performance:
- Teachers create virtual classrooms and allocate equal virtual starting capital (e.g. $10,000) to students.
- Students research real mutual funds, analyze Net Asset Value (NAV) trends, and execute buy/sell orders.
- Portfolios dynamically revalue based on actual daily mutual fund NAV movements.
- Teachers monitor student portfolio performance, trade activity, and learning progress.

---

## 🎯 Planned MVP Features
- [ ] **Teacher Management**: Create classrooms, configure starting balances, view student leaderboards and portfolios.
- [ ] **Student Onboarding**: Join classrooms with invite codes, receive virtual funds.
- [ ] **Real Mutual Fund Ingestion**: Ingest and browse real mutual fund catalog and daily NAV histories.
- [ ] **Atomic Virtual Trading Engine**: Execute buy and sell trades at authoritative NAVs using exact Decimal math.
- [ ] **Portfolio Analytics**: Track holding balances, cash balances, historical returns, and asset allocations.

---

## 🛠️ Technology Stack
- **Framework**: Next.js (App Router, TypeScript)
- **Database & ORM**: PostgreSQL + Prisma ORM
- **Styling & UI**: Tailwind CSS, shadcn/ui components
- **Data Visualization**: Recharts
- **Validation**: Zod
- **Authentication**: Auth.js (NextAuth)
- **Testing**: Vitest (Unit/Integration) & Playwright (E2E)

---

## 🏗️ High-Level Architecture
```
[Client (React Server/Client Components)]
                    │
                    ▼
[Next.js App Router (Zod Validation + Auth.js)]
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
[Portfolio Service]   [Market Data Ingestion]
(Decimal Math &       (Authoritative NAV
 Atomic DB Trades)     Ingestion)
         │                     │
         └──────────┬──────────┘
                    ▼
          [PostgreSQL Database]
```
For detailed architecture, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18.x or later)
- npm (v9.x or later)
- PostgreSQL database instance

### Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd investment-simulator
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure database connection parameters:
   ```bash
   cp .env.example .env
   ```

4. **Initialize Database Schema**:
   ```bash
   npx prisma db push
   # or
   npx prisma migrate dev
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables
Defined in `.env.example`:
```env
# Database connection
DATABASE_URL="postgresql://user:password@localhost:5432/investment_simulator?schema=public"

# Auth.js secret
AUTH_SECRET="your-super-secret-auth-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Node environment
NODE_ENV="development"
```

---

## 🧪 Testing Strategy
- **Unit & Integration Tests**: Run with Vitest:
  ```bash
  npm run test
  ```
- **Type Checking**:
  ```bash
  npm run typecheck
  ```
- **Linting**:
  ```bash
  npm run lint
  ```
- **End-to-End Tests**: Run with Playwright (Planned):
  ```bash
  npm run test:e2e
  ```

---

## 📊 Current Implementation Status

### ✅ Currently Implemented (Phase 0 Foundation)
- Permanent documentation & project memory system (`PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `CURRENT_STATUS.md`, `DECISIONS.md`, `AI_LOG.md`).
- Developer rules for AI sessions (`.agents/rules/project-rules.md`).
- Project directory structure & initial Next.js + Prisma configuration.
- Health check API endpoint (`/api/health`).

### 🚧 Deliberately Not Implemented Yet (Planned TODOs)
- ❌ User authentication & role management (Teacher / Student logins).
- ❌ Classroom creation & join code mechanics.
- ❌ Mutual fund API integration and NAV ingestion pipeline.
- ❌ Buy/Sell trade execution engine.
- ❌ Portfolio valuation & Recharts visualization.
- ❌ Teacher analytics dashboard & leaderboard.
