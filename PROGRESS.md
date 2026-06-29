# EventPulse Web — Progress Tracker

## Current Status
- **Foundation — COMPLETE** (initial commit). **Auth pages — COMPLETE** (PR #1):
  Login, Register, ForgotPassword, ResetPassword, VerifyEmail.
- **Events (discovery) — COMPLETE** (PR #2): EventList, EventDetail, EventCard, eventService
  (read), useDebounce, format helpers.
- **Event management — COMPLETE** (PR #3): eventService write, EventCreate wizard, EventEdit,
  organizer actions gated by org membership.
- **Organizations — COMPLETE** (PR #4).
- **Checkout & orders — COMPLETE** (PR #5).
- **Payment (Stripe) — COMPLETE** (PR #6).
- **Reviews — COMPLETE** (PR #7).
- **Notifications — COMPLETE** (PR #8).
- **Analytics dashboard — COMPLETE** (this PR): analyticsService (event sales/attendance,
  org overview, platform), EventAnalytics page (metric cards + Recharts revenue line / tier
  bar / check-in donut), lazy-loaded route (Recharts code-split ~396kB chunk), Analytics link
  on EventDetail. ResizeObserver stub in test setup for Recharts.
- Next: admin panel (role-gated). Then mobile repo.

## Foundation (done)
- Vite + React 18 + TypeScript; path alias `@/` → `src/`.
- Tailwind CSS with brand design tokens (`tailwind.config.ts`); `index.css` directives.
- React Router v7 (`createBrowserRouter`) with AuthLayout / DashboardLayout /
  ProtectedRoute; routes in `src/routes.tsx`.
- Axios client (`src/services/api.ts`): attaches bearer token, single-flight 401
  auto-refresh, normalized `ApiError`. `authService.ts` wired to backend auth/users.
- Zustand stores: `authStore` (persisted to localStorage), `eventStore`, `notificationStore`.
- UI primitives: Button, Input, Textarea, Select, Card, Badge, Spinner, Modal.
- Layout: Navbar, PageWrapper, AuthLayout, DashboardLayout, ProtectedRoute. Forms: FormField.
- Pages: Login + Register (functional), Dashboard placeholder, 404, 403.
- Tooling: oxlint, Prettier, Vitest + Testing Library (setup in `src/test/setup.ts`),
  `generate-types` (openapi-typescript), GitHub Actions CI, multi-stage Dockerfile + nginx.
- 6 tests passing (Button, authStore). Build green.

## Conventions
- See CLAUDE.md. One feature per branch, PR per feature, quality gate must pass
  (typecheck + lint + format:check + test).

## Deviations from plan (flagged)
- React Router **v7** instead of v6 (template default; v6's successor, compatible API).
- **oxlint** instead of ESLint (Vite template default; faster Rust linter) + Prettier.
- TypeScript pinned to ~5.8 (template shipped TS 6, incompatible with the tooling ecosystem).
