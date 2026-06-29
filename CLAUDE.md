# EventPulse Web

## Project
Organizer- and admin-facing web dashboard for EventPulse. Talks to the
`eventpulse-backend` REST API; it does not share source with the backend.

Tech: React 18 + TypeScript + Vite, React Router (v7), Zustand state, Tailwind CSS,
Axios, Vitest + Testing Library, oxlint + Prettier.

## Architecture
- `src/components/ui/` — design-system primitives (Button, Input, Card, Badge,
  Spinner, Modal, Select, Textarea). Presentational only, no data fetching.
- `src/components/layout/` — Navbar, PageWrapper, AuthLayout, DashboardLayout,
  ProtectedRoute.
- `src/components/forms/` — form building blocks (FormField, ...).
- `src/pages/<feature>/` — route screens, one folder per domain (auth, dashboard,
  events, orders, organizations, profile, admin, notifications).
- `src/services/` — API layer. `api.ts` is the shared Axios instance (auth header,
  401 auto-refresh, error normalization). One `<feature>Service.ts` per domain;
  components/pages call services, never axios directly.
- `src/store/` — Zustand stores (authStore is persisted to localStorage).
- `src/types/api.ts` — generated from the backend OpenAPI spec (`npm run generate-types`).
- `src/lib/` — framework-agnostic helpers (cn, env, stripe).

## Conventions
- TypeScript everywhere; no `any` without justification. `verbatimModuleSyntax` is on,
  so use `import type` for type-only imports.
- Path alias `@/` → `src/`.
- Tailwind utility classes for styling; shared tokens live in `tailwind.config.ts`.
  Use the `cn()` helper to compose conditional classes.
- Every feature ships with tests (`*.test.tsx` colocated). Cover render, key
  interactions, and error/loading states.
- Functional components + hooks only.

## Commands
- `npm run dev` — Vite dev server (proxies to `VITE_API_BASE_URL`).
- `npm test` / `npm run test:watch` — Vitest.
- `npm run lint` — oxlint. `npm run format` — Prettier.
- `npm run typecheck` — `tsc -b`.
- `npm run build` — typecheck + production build.
- `npm run generate-types` — regenerate `src/types/api.ts` from the running backend.

## Quality bar (must pass before commit)
- `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm test` all green.

## Git
- One feature per branch (`feature/<name>`); never commit directly to `main`.
- Commit format: `type(scope): description` (feat, fix, chore, refactor, test, docs).
- All PRs: tests pass, lint clean, code review.
