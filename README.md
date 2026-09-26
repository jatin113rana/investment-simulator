# Investment Simulator

Investment Simulator is an educational classroom application where students practice mutual-fund investing with virtual INR and real AMFI NAV data. Teachers create classrooms and track performance; administrators manage users, classrooms, and market-data ingestion.

## Current Features

- Clerk email/password authentication and optional SSO
- Role-based access for `ADMIN`, `TEACHER`, and `STUDENT`
- Teacher classroom creation, student enrollment, roster analytics, and P&L
- Student portfolios, holdings, transaction history, and virtual buy/sell trades
- Real AMFI mutual-fund NAV ingestion with database-backed catalog reads
- Serializable ACID transactions for trades and virtual-cash allocation
- Rate limiting for expensive APIs and financial mutations
- Separate market routes: `/student/funds`, `/teacher/funds`, and `/admin/funds`

## Technology

- Next.js 15 App Router and TypeScript
- Clerk for authentication, passwords, SSO, and session JWTs
- PostgreSQL with Prisma ORM
- Tailwind CSS and Lucide icons
- Zod validation
- Vitest tests
- AMFI daily NAV feed

## Prerequisites

- Node.js 18 or later
- npm 9 or later
- PostgreSQL or Neon database
- Clerk development instance

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment variables:

   ```bash
   Copy-Item .env.example .env
   ```

   On macOS/Linux:

   ```bash
   cp .env.example .env
   ```

3. Configure `.env`:

   ```env
   DATABASE_URL="postgresql://user:password@host:5432/investment_simulator?schema=public"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_key"
   CLERK_SECRET_KEY="sk_test_your_key"
   NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
   NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
   NODE_ENV="development"
   ```

4. Generate Prisma Client and apply migrations:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

   For local schema experimentation only, use `npx prisma db push`. For committed database changes, create and apply a versioned migration under `prisma/migrations/`.

5. Seed the Clerk development accounts and curated AMFI funds:

   ```bash
   npm run db:seed
   ```

   The seed requires a valid `CLERK_SECRET_KEY`. It creates or updates the Clerk users and links their real Clerk IDs in Prisma.

6. Start the application:

   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000).

## Test Login Accounts

These are development/test credentials only. Configure the Clerk development instance for password-only testing if new-device MFA verification is not desired. Never use these credentials in production.

| Role | Email | Password | Main Areas |
| --- | --- | --- | --- |
| Admin | `admin@jatinrana.online` | `Insim@123456789` | User management, system classrooms, AMFI ingestion |
| Teacher | `teacher@jatinrana.online` | `Insim@123456789` | Classroom analytics, roster, mutual-fund browsing |
| Student | `student@jatinrana.online` | `Insim@123456789` | Portfolios, classrooms, trading |

If email verification or MFA is enabled in Clerk, testers may still be asked to verify a new device. This is controlled by Clerk, not the application navbar.

## Important Routes

- `/` - Sign in and sign up
- `/dashboard` - Role-specific dashboard
- `/admin/classrooms` - Admin system classroom audit
- `/admin/funds` - Admin AMFI catalog view
- `/teacher/classrooms` - Teacher classroom roster
- `/teacher/funds` - Teacher read-only fund explorer
- `/student/classrooms` - Student classroom enrollment and portfolios
- `/student/classrooms/[membershipId]` - Full portfolio holdings and trade history
- `/student/funds` - Student fund explorer and trading

## Database and Migrations

Prisma migrations are the source of truth for table and schema changes:

```bash
npx prisma migrate dev --name describe_change
npx prisma migrate deploy
npx prisma generate
```

Do not edit production tables directly. Review generated SQL before applying migrations. Financial values use Prisma `Decimal` and server-side calculations.

## Market Data

Normal fund-page loads read the active catalog from PostgreSQL through `/api/market-data/funds`. They do not trigger AMFI ingestion.

AMFI synchronization is an explicit admin-only operation:

```text
POST /api/market-data/sync
```

The sync downloads the official AMFI NAV feed, updates curated fund records, and records price history. The catalog and history endpoints use short-lived caching.

## Development Commands

```bash
npm run dev         # Start development server
npm run typecheck   # TypeScript validation
npm run lint        # Lint project files
npm run test        # Run Vitest tests
npm run build       # Create production build
npm run db:generate # Generate Prisma Client
npm run db:seed     # Seed Clerk test users and AMFI funds
```

## Security Notes

- Clerk owns passwords and authentication sessions; passwords are not stored in Prisma.
- Admin create/delete operations update both Clerk and Prisma.
- Buy and sell operations use PostgreSQL Serializable transactions with retry handling.
- API and financial mutation rate limits are currently process-local. Use Redis or another shared store for multi-instance production deployments.
- All financial calculations and authoritative NAV checks run on the server.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/CURRENT_STATUS.md](docs/CURRENT_STATUS.md), and [DECISIONS.md](DECISIONS.md) for deeper project records.

Role	    Email	    Password

Admin:	admin@jatinrana.online	    Insim@123456789

Teacher:	teacher@jatinrana.online	    Insim@123456789

Student:	student@jatinrana.online	    Insim@123456789