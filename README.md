# EventPulse Web

Organizer & admin dashboard for the EventPulse event-management platform. React +
TypeScript + Vite SPA backed by the `eventpulse-backend` API.

## Prerequisites
- Node.js 20+ and npm
- A running `eventpulse-backend` (default `http://localhost:8000`)

## Setup
```bash
git clone <repo-url>
cd eventpulse-web
cp .env.example .env        # set VITE_API_BASE_URL if not localhost:8000
npm install
npm run dev                 # http://localhost:5173
```

## Generating API types
With the backend running, regenerate TypeScript types from its OpenAPI spec:
```bash
npm run generate-types      # writes src/types/api.ts
```

## Scripts
| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest suite |
| `npm run lint` | Lint with oxlint |
| `npm run format` | Format with Prettier |
| `npm run typecheck` | Type-check without emitting |

## Tech stack
React 18 · TypeScript · Vite · React Router · Zustand · Tailwind CSS · Axios ·
Vitest + Testing Library.

## Production
`Dockerfile` builds the static bundle and serves it via nginx with SPA fallback:
```bash
docker build -t eventpulse-web .
docker run -p 8080:80 eventpulse-web
```
