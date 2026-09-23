# AI Developer Rules for Investment Simulator

Future AI coding sessions and agents working on this repository MUST strictly follow these rules:

1. **Read `docs/PROJECT_CONTEXT.md`** before making any architectural changes or feature implementations.
2. **Read `docs/CURRENT_STATUS.md`** before starting work on any task to understand current state and priorities.
3. **Read `DECISIONS.md`** when making decisions related to system architecture, technology choices, or product scope.
4. **Inspect existing code** thoroughly before modifying or adding to it.
5. **Prefer the smallest change** that solves the current problem efficiently and cleanly.
6. **Do not rewrite working code** without a clear, explicit engineering reason.
7. **Do not introduce dependencies** without clear technical justification.
8. **Preserve existing architectural decisions** unless there is a compelling, documented reason to change them.
9. **Run relevant tests** (unit, integration, linting, typechecking) after implementation.
10. **Update `docs/CURRENT_STATUS.md`** after meaningful development work is completed.
11. **Update `DECISIONS.md`** whenever a meaningful architectural or product decision is made.
12. **Update `AI_LOG.md`** with accurate records of AI assistance, mistakes, corrections, and verification.
13. **Never invent** completed work, tests, decisions, or AI contributions that have not occurred.
14. **Enforce Financial Correctness**: For any financial or trading logic, strictly abide by all 11 financial correctness principles outlined in `docs/PROJECT_CONTEXT.md` (e.g. server-side math, `Decimal` types, atomic DB transactions, cash/holding validation).
15. **Never put financial truth in client-controlled state**: Frontends send intent only (e.g. fund ID, quantity/amount); server calculates NAV, totals, cash checks, and transaction records.
