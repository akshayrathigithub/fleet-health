# Fleet Health

A frontend dashboard for IT operations to monitor enrolled devices, triage health issues, acknowledge alerts, and flag machines for replacement.

This repository is the source code for the application.

## Setup instructions

### Requirements

- Node.js 20+ (Node 22 or 24 recommended)
- npm (this repo uses `package-lock.json`)

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

There is no real backend. MSW starts with the app and answers `/api/*` requests from a service worker using seed data in `src/mocks/data/devices.json`.

### Useful scripts

| Command           | Purpose                                      |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite development server            |
| `npm run build`   | Typecheck and create a production build      |
| `npm run preview` | Serve the production build locally           |
| `npm run typecheck` | Run TypeScript only                        |
| `npm run lint`    | Run ESLint                                   |
| `npm run format`  | Format the repo with Prettier                |

### Demo mock scenarios

Append a `mock` query param to exercise edge cases:

| URL                        | Behavior                                              |
| -------------------------- | ----------------------------------------------------- |
| `/?mock=error`             | Device list request fails                             |
| `/?mock=empty`             | Fleet has no devices                                  |
| `/?mock=slow`              | Device list takes ~3 seconds                          |
| `/?mock=action-error`      | Acknowledge / flag-for-replacement requests fail      |

Example: `http://localhost:5173/devices?mock=slow`

## Problem

IT teams manage large fleets of laptops and desktops. Health signals (CPU, memory, disk, battery), offline check-ins, and alerts are scattered across tools, so operators spend time finding what needs attention instead of acting on it.

Fleet Health solves that by putting fleet status, filtering, device detail, and follow-up actions in one workspace:

- See how many devices are critical, warning, healthy, or offline at a glance
- Search and filter by status, team, and sort order
- Open a device for metrics trends, alerts, and hardware facts
- Acknowledge alerts and flag devices for replacement without leaving the page

## Intended user

Primary user: an **IT operations / endpoint admin** responsible for a company fleet.

They typically:

- Start the day by scanning which devices need action
- Filter to a team or status when investigating an incident
- Open a device, review trends and alerts, then acknowledge or escalate
- Need the UI to work well with keyboard and screen readers, because triage is repetitive

They are not developers. Copy, density, and clear status language matter more than technical jargon.

## Architecture

```text
Browser
  └── React app (Vite)
        ├── providers/          Error boundary, React Query, toasts, router
        ├── routes/ + layout/   Route table and page chrome
        ├── devices/            Domain UI, models, hooks, navigation
        ├── query/              TanStack Query keys, queries, mutations
        ├── services/           HTTP client + device API functions
        ├── components/         Reusable UI primitives
        ├── constants.ts        Shared static config (routes, paths, metadata)
        └── mocks/              MSW handlers + in-memory DB (stand-in backend)
```

### Layering

1. **UI** (`devices/`, `components/`, `layout/`) renders state and collects user intent.
2. **Query layer** (`query/`) owns cache keys and React Query hooks. Components do not call `fetch` directly.
3. **Services** (`services/`) map domain operations to HTTP endpoints.
4. **Domain models** (`devices/models/`) hold health rules, filtering/sorting, and alert helpers that stay free of React.
5. **Mocks** (`mocks/`) implement the same HTTP contract the UI expects, so swapping in a real API later does not require rewriting screens.

### Data flow

- Server state (device list / detail) lives in React Query.
- View state (search, status, team, sort, selected device) lives in the URL.
- Derived values (status counts, visible rows, teams) are computed during render from those two sources so they cannot drift.

Mutations follow the risk of the action:

- **Acknowledge alert** — optimistic update with rollback on failure
- **Flag for replacement** — wait for the server, then update list and detail caches together

### Folder map

| Path              | Responsibility                                      |
| ----------------- | --------------------------------------------------- |
| `src/providers`   | App composition root                                |
| `src/routes`      | Route definitions                                   |
| `src/layout`      | Shared header / shell                               |
| `src/devices`     | Devices page, components, models, navigation        |
| `src/query`       | React Query client, keys, queries, mutations        |
| `src/services`    | `request` helper and `deviceApi`                    |
| `src/components`  | Shared UI (Button, Select, Toast, …)                |
| `src/constants.ts`| Routes, API paths, health/filter metadata, timings  |
| `src/mocks`       | MSW worker, handlers, seed DB                       |
| `src/styles`      | Global SCSS tokens and mixins                       |

## Key technical decisions

- **URL as filter source of truth** — filtered views are shareable and survive refresh; Back does not step through every keystroke because updates use `replace`.
- **One route for list + optional detail** (`/devices/:deviceId?`) — keeps the list mounted so scroll position is preserved when opening a device.
- **Health thresholds centralized** — metric labels and warning/critical cutoffs live in one place so table, badges, and detail cannot disagree.
- **Custom Select** — OS-native `<select>` styling varies by machine; a custom combobox keeps look and keyboard behavior consistent.
- **SCSS modules + shared mixins** — component styles stay colocated; tokens/mixins live under `src/styles` for reuse (surface, fields, breakpoints, red tag).
- **Accessibility first** — skip link, live regions for toasts, focus restoration between list and detail, table semantics preserved on the phone card layout.
- **Mock API behind the real HTTP boundary** — the app always talks to `/api/...`; MSW intercepts in the browser so UI code matches a future backend.

## Libraries and technologies

| Choice                         | Why                                                                 |
| ------------------------------ | ------------------------------------------------------------------- |
| **React 19 + TypeScript**      | Component model the team already knows; strict typing for domain data |
| **Vite**                       | Fast local feedback and simple production builds                    |
| **React Router 8**             | Nested routes, optional params, and URL-driven navigation           |
| **TanStack Query**             | Caching, retries, stale time, optimistic mutations without custom store boilerplate |
| **MSW**                        | Realistic `fetch`-level mocking without a fake in-app client        |
| **Sass (SCSS modules)**        | Colocated styles with reusable mixins/tokens                        |
| **ESLint + jsx-a11y + Prettier** | Catch a11y and style issues early                                 |

Deliberately **not** used: a heavy UI kit (Ant Design, MUI), Redux, or a CSS-in-JS runtime. The UI surface is small enough that a focused design system of primitives keeps bundle size and behavior under control.

## Assumptions and tradeoffs

### Assumptions

- A single fleet / tenant; no multi-org auth yet
- Device IDs (asset tags) are unique and safe to show as primary labels
- Metric payloads from the API match the TypeScript types (no runtime schema validation yet)
- “Offline” means no metrics / no recent reporting, derived in the client from API data
- Flagging for replacement notifies the owner on the server; the UI should not pretend it succeeded early

### Tradeoffs

- **MSW always on** — fine for this demo; a production build would gate mocks to development or remove them
- **Client-side filtering** — simple and fast for the seed fleet size; a large fleet would need server-side search/filter/pagination
- **Global `constants.ts`** — makes shared contracts easy to find; can grow noisy if every local UI value is dumped there
- **No automated test suite in this pass** — architecture is structured so domain helpers and query cache behavior are testable, but tests were deferred
- **Detail siblings share one SCSS module** — reduces duplication for a tightly coupled panel; ownership is less obvious than one module per file

## What I would improve or build next

With more time:

1. **Server-backed filtering and pagination** — move search/status/team/sort to query params the API understands
2. **Auth and roles** — who can flag vs who can only view
3. **Realtime or polling for check-ins** — reduce stale offline status without manual refresh
4. **Richer device actions** — unflag replacement, assign ticket, bulk acknowledge
5. **Observability** — wire the error boundary and failed mutations to an error tracker
6. **Design-system polish** — formalize spacing/type scales and document the component API
7. **Split constants by domain** if `constants.ts` keeps growing (routes, API, health, UI)

## Source layout (quick reference)

```text
src/
├── components/       # reusable UI
├── constants.ts      # shared static values
├── context/          # React contexts (toast)
├── devices/          # devices domain
├── errorBoundary/
├── hooks/
├── layout/
├── mocks/            # MSW mock API
├── providers/
├── query/            # TanStack Query
├── routes/
├── services/         # HTTP + device API
├── styles/
├── utils/
└── main.tsx
```
