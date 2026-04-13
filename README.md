# F1 Dashboard

A modern Formula 1 dashboard built with React, Vite, MUI, Recharts, and OpenF1 data.

**Entry point:** Visiting `/` redirects to **`/dashboard`** (the Dashboard page). Local dev (`npm run dev`) opens **`/dashboard`** directly when the browser is launched from Vite.

## Why I Chose F1

Formula 1 is a great fit for a data-driven frontend project because it has:
- Clear ranking-based datasets (drivers, constructors, rounds)
- Frequently updated season stats that work well with charts and tables
- A familiar domain for demonstrating routing, API integration, and UI states

The goal was to build something that is both visually engaging and practical for showcasing frontend skills.

## OpenF1 API Reference

### 1) Races / Meetings

Use these endpoints to build race calendars, upcoming races, countdowns, and circuit details.

| Endpoint | Description | Example URL |
| --- | --- | --- |
| `meetings` | List race meetings for a year; optional **`country_name`** filter | `https://api.openf1.org/v1/meetings?year=2025` · `https://api.openf1.org/v1/meetings?year=2026&country_name=Singapore` |
| `meeting` | Details for one race meeting by `meeting_key` (may 404 for some keys; app falls back to `meetings?year=`) | `https://api.openf1.org/v1/meeting?meeting_key=1219` |

### 2) Drivers

Use these endpoints to build driver profiles, standings views, and headshot cards.

| Endpoint | Description | Example URL |
| --- | --- | --- |
| `drivers` | List all drivers for a session (`session_key` required) | `https://api.openf1.org/v1/drivers?session_key=11436` |
| `driver` | Details for one driver by number and session | `https://api.openf1.org/v1/driver?driver_number=1&session_key=11436` |

Returned fields include full name, team name, driver number, headshot URL, and team color.

### 3) Session Results

Use this endpoint to build race result pages and session classification tables.

| Endpoint | Description | Example URL |
| --- | --- | --- |
| `session_result` | Finishing positions for a specific session | `https://api.openf1.org/v1/session_result?session_key=11436` |

Returned fields include position, driver, laps, session time/gap values, and result metadata.

### 4) Championship Standings

Use these endpoints for cumulative points, rankings, and standings charts/tables.

| Endpoint | Description | Example URL |
| --- | --- | --- |
| `championship_drivers` | Driver championship standings for a session | `https://api.openf1.org/v1/championship_drivers?session_key=11436` |
| `championship_teams` | Constructor/team standings for a session | `https://api.openf1.org/v1/championship_teams?session_key=11436` |

Returned fields include points and championship positions per driver/team.

Current integration uses:
- `src/hooks/useDriverStandings.js`
- `championship_drivers?session_key=<numeric>` — `session_key` is resolved in `src/services/openf1.js` via `sessions?year=` (latest completed Sunday GP). The API returns **404** for `session_key=latest`, so the app does not call that variant.
- `https://api.openf1.org/v1/drivers?session_key=<resolved_session_key>`

## Features Implemented

- **Default route:** `/` → **`/dashboard`** (React Router `Navigate` in `App.jsx`)
- **Site-wide footer** (`SiteFooter.jsx`) + **Acknowledgements** page at `/acknowledgements` (OpenF1 credit, F1® disclaimer, “built with”)
- Multi-page React app with routing:
  - Dashboard (`/dashboard`) including **Latest F1 News** preview cards (GNews)
  - **News** listing (`/news`) and **article** view (`/news/article/:key`, in-app body + “Read original” + related items)
  - Drivers standings (`/drivers`) and **per-driver profile** (`/drivers/:driverNumber`, OpenF1 `driver` + championship row)
  - Constructors (`/constructors`) and **per-team detail** (`/constructors/team/:teamSlug`, roster + points)
  - Races (calendar + per-meeting **sessions** at `/races/:meetingKey`)
  - Line-ups (`/team-drivers`: teams + drivers for latest session)
- MUI-based responsive UI and components
- Driver standings fetched from live API data
- Recharts line chart for driver points progression
- Enhanced UX states:
  - **Skeleton loaders** on every API-backed page (layout-aware placeholders via `ApiLoadingSkeletons.jsx`)
  - Error state with retry button (Drivers page)
  - Last-updated timestamp (Drivers)
- Polished interactions:
  - Hover animations
  - Sticky navigation
  - Improved spacing and visual hierarchy
- **Theme:** light/dark toggle (toolbar + drawer) with **`localStorage`** persistence (`f1-dashboard-color-mode`)
- **Navigation:** animated underline on active desktop items; mobile drawer uses an animated **left border** on the active route
- **Dashboard:** numeric metrics (**points**, **driver #**, **countdown days**, **current round**) **count up** on load (easing); respects **`prefers-reduced-motion`**

## Challenges Solved

- **PowerShell execution policy issue for npm scripts**
  - `npm.ps1` was blocked by execution policy.
  - Workaround: used `npm.cmd` / `npx.cmd` commands.

- **OpenF1 session endpoint availability**
  - Some `championship_drivers` / `session_result` keys return **404** (wrong or unsupported `session_key`). `/meeting?meeting_key=` can **404** even for valid meetings; the app falls back to `meetings?year=`.
  - Standings: resolve completed Sunday GPs from `sessions?year=` (newest first), call `championship_drivers?session_key=<numeric>`, and **skip 404s** (OpenF1 often has no championship row yet for the latest race, e.g. while data is ingested) until an older session returns data.
- **OpenF1 rate limiting (429)**
  - The API returns **429** with *“Max 3 requests/second”* for `api.openf1.org`. Burst traffic (parallel `Promise.all`, several tabs, or **React Strict Mode** doubling effects in dev) can exceed that easily.
  - `openf1.js` now **queues every OpenF1 HTTP call** globally and enforces **~360ms minimum spacing** between request starts (under 3/sec), on top of **429 retries** (exponential backoff, optional `Retry-After`, jitter).

- **Bundle size warning after adding charts**
  - Recharts increased bundle size and triggered a warning.
  - Application still builds successfully; future optimization can include lazy-loading chart routes/components.

## Run Locally

```bash
npm.cmd install
npm.cmd run dev
```

Then open `http://localhost:5173` (root redirects to `/dashboard`), or use the tab Vite opens — it targets **`/dashboard`** via `vite.config.js` `server.open`.

**Formula 1 news (GNews):** copy `.env.example` to `.env` and set `VITE_GNEWS_API_KEY` to your key from [gnews.io](https://gnews.io/). Restart Vite after changing env vars. The app calls GNews API v4 search (`q=Formula%201`, `lang=en`) using the **`apikey`** query parameter (per [GNews docs](https://gnews.io/docs/v4)); older examples sometimes show `token=` — use **`apikey`** with the same key value. **`src/services/gnews.js`** queues requests (~1 request/second spacing) and **retries HTTP 429** with backoff, because GNews blocks bursts (“too many requests in a short period”).

Run tests with coverage (enforces thresholds from `jest.config.cjs`):

```bash
npm.cmd run test:coverage
```

**Test layout:** specs live under `src/__tests__/`, mirroring `src/` — e.g. `src/pages/Dashboard.jsx` → `src/__tests__/pages/Dashboard.test.jsx`, `src/App.jsx` → `src/__tests__/App.test.jsx`. Shared Jest setup remains in `src/test/setupTests.js`.

## Progress Checklist

### Done

- [x] Default landing: `/` redirects to **Dashboard** at `/dashboard` (`App.jsx`); dev server opens `/dashboard` when launching the browser (`vite.config.js` `server.open`)
- [x] Vite + React project setup completed
- [x] UI migrated to MUI
- [x] Core pages implemented (`Dashboard`, `Drivers`, `Constructors`, `Races`)
- [x] Extra pages implemented (`CountdownTimer`, `DriverProfiles`, `RaceResults`, `HeadToHeadComparison`, `Acknowledgements`)
- [x] OpenF1 service layer added in `src/services/openf1.js`
- [x] Endpoints integrated:
  - [x] `meetings?year=`
  - [x] `meeting?meeting_key=`
  - [x] `sessions?meeting_key=`
  - [x] `sessions?year=` (standings fallback: latest completed Grand Prix)
  - [x] `drivers?session_key=`
  - [x] `championship_drivers` (numeric `session_key` from `sessions?year=`; no `latest` call)
  - [x] `championship_teams?session_key=...`
  - [x] `session_result?session_key=...`
- [x] Hardcoded data removed from key pages and replaced by API-driven content
- [x] Loading and error states added on API-backed pages
- [x] Jest testing setup completed and test suites passing
- [x] Tests for newer pages (`CountdownTimer`, `DriverProfiles`, `RaceResults`, `HeadToHeadComparison`)
- [x] Coverage report and threshold enforcement (`npm.cmd run test:coverage`)
- [x] Route transitions (fade + slide) between pages (`App.jsx` + `prefers-reduced-motion`)
- [x] Stronger card hover (lift, subtle scale, deeper shadow) via `theme.js` `MuiCard` overrides
- [x] Session list per race UI: `RaceMeetingSessions` at `/races/:meetingKey` (from calendar **View sessions**)
- [x] Team–driver line-ups: `TeamDriverMapping` at `/team-drivers` (`championship_teams` + `drivers?session_key=`)
- [x] Tooltips/popups with richer driver/team details (`DriverRichSummary` / `TeamRichSummary` on standings, race results, constructors, line-ups, head-to-head, profiles)
- [x] Bundle optimization via lazy loading/code splitting (`React.lazy` per route in `App.jsx`, `Suspense` + `PageRouteFallback`)
- [x] Site-wide **footer** + **Acknowledgements** at `/acknowledgements` (`SiteFooter.jsx`, `Acknowledgements.jsx`, link in mobile drawer)
- [x] **F1 news** via GNews (`src/services/gnews.js`): main nav **News** → `/news`, Dashboard previews (`max=5`), article route with related articles; env `VITE_GNEWS_API_KEY` (see `.env.example`)

### UI/Animation Enhancements (Later)

- [x] Add skeleton loaders to all API-backed pages (`src/components/ApiLoadingSkeletons.jsx` + per-page usage)
- [x] Add podium styling (gold/silver/bronze) in `RaceResults`
- [x] Add countdown urgency states (green/amber/red + pulse near start)
- [x] Add animated active nav indicator
- [x] Add animated number count-up for dashboard metrics
- [x] Add dark/light theme toggle with persistence

### Planned

- [x] **Dashboard news** — **Latest F1 News** on the Dashboard (`max=5`); cards open `/news/article/:key` (lazy `NewsArticle.jsx`).
- [x] **News in the main nav** — **News** in toolbar + drawer → `/news` (lazy `News.jsx`), same GNews feed as previews with `max=20`.

#### Feature architecture (News)

```text
Site navigation
   └── News → F1 news listing (full feed)

Dashboard
   └── Latest F1 News (preview cards; subset of same feed)

News listing page
   └── Card grid → article route

News Article Page
   └── Plain-text body (from HTML content / description)
   └── Hero image when provided
   └── Read original (publisher URL)
   └── Related articles (other items from the same search)
```

- **Navigation** — **News** link; active on `/news` and `/news/article/...`.
- **News listing page** — GNews search `Formula 1`, English; cards link to the article route.
- **Dashboard** — preview strip + **View all** → `/news`.
- **News Article Page** — resolves the article by URL (base64url key); refetches search (`max=100`) for **related** cards; shows a **GNews summary** plus an **embedded iframe** of the publisher URL so the full story can be read in-app when the site allows framing (otherwise use **Open in new tab**).
