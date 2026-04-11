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
- `https://api.openf1.org/v1/championship_drivers?session_key=latest` (tried first; OpenF1 may 404, then `src/services/openf1.js` resolves the latest completed Grand Prix via `sessions?year=` and calls `championship_drivers?session_key=<numeric>`)
- `https://api.openf1.org/v1/drivers?session_key=<resolved_session_key>`

## Features Implemented

- **Default route:** `/` → **`/dashboard`** (React Router `Navigate` in `App.jsx`)
- **Site-wide footer** (`SiteFooter.jsx`) + **Acknowledgements** page at `/acknowledgements` (OpenF1 credit, F1® disclaimer, “built with”)
- Multi-page React app with routing:
  - Dashboard (`/dashboard`)
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
  - Some `championship_drivers` session keys return 404; `session_key=latest` for that endpoint can also 404.
  - Fix: try `latest`, then resolve the latest completed Sunday race from `sessions?year=` and query `championship_drivers` + driver metadata with that numeric `session_key`.

- **Bundle size warning after adding charts**
  - Recharts increased bundle size and triggered a warning.
  - Application still builds successfully; future optimization can include lazy-loading chart routes/components.

## Run Locally

```bash
npm.cmd install
npm.cmd run dev
```

Then open `http://localhost:5173` (root redirects to `/dashboard`), or use the tab Vite opens — it targets **`/dashboard`** via `vite.config.js` `server.open`.

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
  - [x] `championship_drivers` (`session_key=latest` with `sessions?year=` fallback)
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

### UI/Animation Enhancements (Later)

- [x] Add skeleton loaders to all API-backed pages (`src/components/ApiLoadingSkeletons.jsx` + per-page usage)
- [x] Add podium styling (gold/silver/bronze) in `RaceResults`
- [x] Add countdown urgency states (green/amber/red + pulse near start)
- [x] Add animated active nav indicator
- [x] Add animated number count-up for dashboard metrics
- [x] Add dark/light theme toggle with persistence

### Planned

- [ ] **Dashboard news:** add a **News** section on the Dashboard; each item is clickable and opens a dedicated **article page** (route + lazy page) showing the related **article body** and **media** (e.g. images, video embeds, galleries—whatever the content model supports).

#### Feature architecture (News)

```text
Dashboard
   └── Latest F1 News (preview cards)

News Article Page
   └── Full article details
   └── image
   └── source link
   └── related articles
```

- **Dashboard** — surface **Latest F1 News** as **preview cards** (title, teaser, optional hero thumb, date); card click navigates to the article route.
- **News Article Page** — **full article** copy, a primary **image** (or hero media), an external **source link** (attribution / “read original”), and a **related articles** block (same feed, filtered or ranked).
