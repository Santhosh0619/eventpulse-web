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
- **Analytics dashboard — COMPLETE** (PR #9).
- **Admin panel — COMPLETE** (this PR): adminService (dashboard/users/orgs/events/audit-logs),
  usePaginated hook + Pagination component, AdminLayout (tab nav), AdminDashboard, AdminUsers
  (role/active), AdminOrganizations (verify), AdminEvents (feature), AdminAuditLogs; routes
  gated by ProtectedRoute roles=['admin']; Admin nav link for admins.
- **WEB APP FEATURE-COMPLETE.** Next: mobile repo (eventpulse-mobile, React Native Expo).

## Deployment phase (21 ideas)

- **Idea 16 — AI Review Moderation (Gemini) — COMPLETE**: reviewService.listForManagement +
  approve; Reviews-on-EventDetail now loads the management list for org members (incl. hidden/
  flagged reviews), shows a "⚠ Flagged by AI" badge, and an Approve button. Backend endpoints
  GET /events/{id}/reviews/management + POST /reviews/{id}/approve. 126 tests (was 122).
- **Idea 15 — AI Event Descriptions (Gemini) — COMPLETE**: eventService.generateDescription,
  AiDescriptionAssist component (keywords input + "✨ Generate with AI" button), added a full
  "Description" field to the EventCreate wizard that the button auto-fills. Backend endpoint
  POST /events/generate-description. 122 tests (was 117).
- **Idea 14 — AI Recommendations (Gemini) — COMPLETE** (PR #13): recommendationService
  (getForMe, getSimilar), RecommendationSection component (loads AI recs, shows per-pick
  reason + ✨AI badge, hides on empty/error), "Recommended for You" on EventList (authed
  only), "Similar events" on EventDetail (public). Backend endpoints:
  GET /recommendations/for-me, GET /events/{id}/similar. 117 tests (was 111).

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
