# Investment Simulator Architecture

## 1. Purpose

Investment Simulator is a classroom financial-literacy application. It uses virtual INR, real AMFI mutual-fund NAV data, server-side portfolio calculations, and role-based access for administrators, teachers, and students.

No real money, brokerage account, bank account, or live order execution is involved.

## 2. System Overview

```text
Browser
  |
  | Clerk session JWT / Next.js navigation
  v
Next.js App Router
  |-- Client pages and interactive components
  |-- Server Actions
  |-- API routes
  |-- Clerk authentication and RBAC checks
  |
  v
Domain services in lib/
  |-- auth: Clerk user sync and role resolution
  |-- classroom: classrooms, memberships, summaries
  |-- portfolio: buy, sell, valuation, leaderboard
  |-- market-data: AMFI ingestion and fund reads
  |-- admin: user and system administration
  |-- validation: Zod input schemas
  |-- security: rate limiting
  |
  v
Prisma ORM
  |
  v
PostgreSQL / Neon
```

The browser is an untrusted client. It sends user intent only. Authorization, NAV selection, financial validation, Decimal calculations, and state changes happen on the server.

## 3. Technology Stack

- **Application**: Next.js 15 App Router
- **Language**: TypeScript strict mode
- **Authentication**: Clerk email/password and optional SSO
- **Sessions**: Clerk-managed session tokens/JWTs
- **Database**: PostgreSQL or Neon
- **ORM**: Prisma
- **Validation**: Zod
- **Financial math**: Prisma `Decimal` and `decimal.js`
- **UI**: React, Tailwind CSS, Lucide icons
- **Testing**: Vitest and TypeScript checks
- **Market data**: Official AMFI NAV text feed

## 4. Roles and Permissions

### ADMIN

Administrators can:

- View and manage the user directory.
- Create Clerk email/password users with `ADMIN`, `TEACHER`, or `STUDENT` roles.
- Delete both the Clerk identity and Prisma profile.
- Change user roles.
- Create classrooms for teachers.
- Assign students to classrooms and allocate starting virtual cash.
- View system-wide classrooms, teachers, students, holdings, net worth, and P&L.
- Trigger explicit AMFI synchronization through the admin action.
- Browse the read-only admin fund route at `/admin/funds`.

Administrators should not use student membership data to trade on behalf of students.

### TEACHER

Teachers can:

- Create classrooms and configure starting virtual balances.
- View classrooms they own.
- View roster counts, allocations, student performance, and classroom P&L.
- View classroom leaderboards for their classrooms.
- Browse mutual-fund data in read-only mode at `/teacher/funds`.

Teachers cannot:

- Access another teacher's classrooms.
- Join classrooms as students.
- Execute student trades.
- Manage users or trigger admin-only AMFI ingestion.

### STUDENT

Students can:

- Join active classrooms using a valid join code.
- View their own classroom memberships.
- View their own holdings, portfolio values, and latest transaction history.
- Buy and sell available mutual funds using virtual cash.
- Browse and trade funds at `/student/funds`.
- View portfolio details at `/student/classrooms/[membershipId]`.

Students cannot:

- View another student's membership by changing an ID.
- View classrooms they are not enrolled in.
- Create classrooms.
- Assign users or alter roles.
- Trigger AMFI ingestion.

## 5. Route Map

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Clerk sign-in/sign-up experience |
| `/dashboard` | Authenticated | Unified role-specific dashboard |
| `/admin/classrooms` | Admin | System classroom audit |
| `/admin/funds` | Admin | Read-only AMFI catalog and explicit sync action |
| `/teacher/classrooms` | Teacher | Classroom roster and class performance |
| `/teacher/funds` | Teacher | Read-only mutual-fund catalog |
| `/student/classrooms` | Student | Enrollment and classroom portfolio summaries |
| `/student/classrooms/[membershipId]` | Owning student | Full holdings and latest transaction details |
| `/student/funds` | Student | Fund catalog and buy/sell trading |
| `/api/market-data/funds` | Authenticated | Fast database-backed fund catalog read |
| `/api/market-data/history` | Authenticated | Latest NAV history for a scheme |
| `/api/market-data/sync` | Admin POST | Explicit AMFI ingestion; GET is compatibility-only and read-only |
| `/api/health` | Public | Health response |

Middleware requires authentication for all non-public routes. Domain services perform the role and ownership checks that middleware cannot express.

## 6. Database Schema

The canonical schema is [prisma/schema.prisma](../prisma/schema.prisma). All table and schema changes are maintained as versioned migrations under `prisma/migrations/`.

### User

Stores the application profile linked to Clerk.

- `id`: Internal UUID
- `clerkUserId`: Clerk identity ID, unique
- `email`: Primary email, unique
- `firstName`, `lastName`, `imageUrl`
- `role`: `ADMIN`, `TEACHER`, or `STUDENT`
- `passwordHash`: Legacy nullable field; Clerk owns passwords
- `createdAt`, `updatedAt`

### Classroom

Represents a teacher-owned virtual classroom.

- `id`: Internal UUID
- `name`
- `code`: Unique six-character join code
- `startingBalance`: Decimal virtual INR allocated to each student
- `status`: `ACTIVE` or `ARCHIVED`
- `teacherId`: User relation
- `createdAt`, `updatedAt`

### ClassroomMembership

Connects one student to one classroom and stores available virtual cash.

- `id`
- `studentId`
- `classroomId`
- `cashBalance`: Decimal available virtual INR
- `joinedAt`, `updatedAt`
- Unique constraint: `(studentId, classroomId)`

### MutualFund

Stores the curated fund catalog and current authoritative NAV.

- `id`
- `schemeCode`: Unique AMFI scheme code
- `name`
- `category`
- `fundHouse`
- `currentNav`: Decimal
- `isActive`
- `createdAt`, `updatedAt`

### FundPriceHistory

Stores dated NAV records.

- `id`
- `fundId`
- `schemeCode`
- `date`
- `nav`: Decimal
- Unique constraint: `(schemeCode, date)`

### Holding

Stores a student's current aggregated position in one fund within one classroom.

- `id`
- `membershipId`
- `fundId`
- `units`: Decimal
- `averageCostNav`: Decimal
- `totalInvested`: Decimal
- Unique constraint: `(membershipId, fundId)`

### Transaction

Append-only trade ledger.

- `id`
- `membershipId`
- `fundId`
- `type`: `BUY` or `SELL`
- `units`: Decimal
- `executionNav`: Decimal
- `totalAmount`: Decimal
- `createdAt`

## 7. Authentication and Identity Lifecycle

Clerk is the only authentication provider.

### Sign-in

1. Clerk authenticates email/password or SSO.
2. Clerk creates the authenticated session/JWT.
3. `fetchUserRoleAndRedirectPath()` resolves the local role.
4. `getCurrentUserWithRole()` performs a read-only lookup by `clerkUserId` for normal navigation.
5. `syncCurrentUser()` is used only when a Clerk identity must be synchronized or initially linked.
6. The user is redirected to `/dashboard`, where UI is selected by role.

### Admin create

1. Admin submits email, password, name, and role.
2. Server verifies admin authorization.
3. Clerk creates the identity.
4. Prisma creates the linked `User` using the real Clerk ID.
5. If Prisma creation fails, the newly created Clerk identity is deleted.
6. Password is never stored in Prisma.

### Admin delete

1. Admin authorization is verified.
2. The matching Clerk identity is resolved by email.
3. Clerk identity is deleted first.
4. Prisma profile is deleted second.
5. This prevents `syncCurrentUser()` from recreating the deleted profile.

Development/test accounts may use password-only Clerk settings and controlled mock/alias emails. Production should retain appropriate verification and MFA policies.

## 8. Financial Transaction Architecture

All financial calculations use Decimal values. Buy and sell operations use `runSerializableTransaction()` with PostgreSQL Serializable isolation and retry handling for Prisma `P2034` conflicts.

### Buy flow

1. Authenticate the caller.
2. Validate input with Zod.
3. Start a Serializable transaction.
4. Read the membership and verify student ownership or admin access.
5. Read the active fund and current authoritative NAV.
6. Calculate units as `amount / current NAV` using Decimal.
7. Conditionally decrement cash only if sufficient balance exists.
8. Update or create the holding and weighted average cost.
9. Append the immutable BUY transaction.
10. Commit all changes together.

### Sell flow

1. Authenticate the caller.
2. Validate input with Zod.
3. Start a Serializable transaction.
4. Read the membership, fund, and holding inside the transaction.
5. Verify ownership and available units.
6. Calculate proceeds using the current authoritative NAV.
7. Increment cash.
8. Update or delete the holding.
9. Append the immutable SELL transaction.
10. Commit all changes together.

### Enrollment and cash allocation

Student joining and admin assignment use Serializable transactions so the duplicate-membership check and starting-cash allocation cannot race. The unique `(studentId, classroomId)` constraint remains the final database safeguard.

## 9. Market Data Architecture

AMFI ingestion and fund reads are separate paths.

### Normal catalog read

```text
Fund page -> GET /api/market-data/funds -> MutualFund.findMany()
```

Only active funds and required display fields are selected. The response has short-lived private caching.

### Explicit ingestion

```text
Admin sync action -> POST /api/market-data/sync
  -> Download official AMFI NAVAll.txt
  -> Parse feed
  -> Upsert curated MutualFund rows
  -> Upsert FundPriceHistory rows
```

Normal page visits do not trigger AMFI network calls or database writes.

## 10. Performance Architecture

- Sidebar links disable speculative prefetching to avoid duplicate dashboard requests.
- Dashboard and classroom pages deduplicate short-lived requests and reuse a five-second cache.
- Student dashboard and list pages use portfolio summaries instead of full transaction histories.
- Portfolio detail loads one membership and the latest 50 transactions.
- Fund catalog responses are cached for 30 seconds.
- NAV history responses are cached for 60 seconds.
- Database projections select only required fields on summary and catalog paths.
- Rate limits protect expensive APIs and financial mutations.
- Production multi-instance deployments should move the current process-local rate limiter to Redis or another shared store.

## 11. Rate Limits

Current process-local limits include:

- Fund catalog: 60 requests/minute per client
- NAV history: 120 requests/minute per client
- AMFI sync: 3 requests/hour per admin
- Buy: 30 requests/minute per user
- Sell: 30 requests/minute per user
- Classroom joining: 10 requests/minute per user
- Admin student assignment: 30 requests/minute per admin

API rate-limit responses return HTTP `429` and `Retry-After` where applicable.

## 12. Security Boundaries

- Clerk owns credentials and sessions.
- Middleware protects authenticated routes.
- Server actions enforce role and ownership checks.
- The client cannot choose the authoritative execution NAV.
- Zod validates user-controlled inputs.
- PostgreSQL constraints enforce unique identities, memberships, and holdings.
- Financial state mutations use Serializable ACID transactions.
- Error responses should remain generic; detailed diagnostics belong in server logs.
- Admin operations are separately authorized and rate-limited.

## 13. Migrations and Operations

Prisma migrations are the database source of truth.

```bash
npx prisma generate
npx prisma migrate dev --name describe_change
npx prisma migrate deploy
npm run db:seed
```

Use `prisma db push` only for local experimentation. Do not directly edit production tables or treat generated database state as a replacement for committed migrations.

## 14. Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Important future test coverage should include authorization/IDOR cases, concurrent buy/sell operations, duplicate enrollment races, rate-limit behavior, Clerk/Prisma lifecycle failures, and end-to-end role workflows.
