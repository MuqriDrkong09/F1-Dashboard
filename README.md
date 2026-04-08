# F1 Dashboard

A modern Formula 1 dashboard built with React, Vite, MUI, Recharts, and OpenF1 data.

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
| `meetings` | List race meetings for a year (circuit, country, dates, keys) | `https://api.openf1.org/v1/meetings?year=2025` |
| `meeting` | Details for one race meeting by `meeting_key` | `https://api.openf1.org/v1/meeting?meeting_key=1219` |

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
- `https://api.openf1.org/v1/championship_drivers?session_key=latest`
- `https://api.openf1.org/v1/drivers?session_key=<resolved_session_key>`

## Features Implemented

- Multi-page React app with routing:
  - Dashboard
  - Drivers
  - Constructors
  - Races
- MUI-based responsive UI and components
- Driver standings fetched from live API data
- Recharts line chart for driver points progression
- Enhanced UX states:
  - Skeleton loading placeholders
  - Error state with retry button
  - Last-updated timestamp
- Polished interactions:
  - Hover animations
  - Sticky navigation
  - Improved spacing and visual hierarchy

## Challenges Solved

- **PowerShell execution policy issue for npm scripts**
  - `npm.ps1` was blocked by execution policy.
  - Workaround: used `npm.cmd` / `npx.cmd` commands.

- **OpenF1 session endpoint availability**
  - Some `championship_drivers` session keys return 404.
  - Fix: query standings via `session_key=latest`, then fetch matching driver metadata with the resolved `session_key`.

- **Bundle size warning after adding charts**
  - Recharts increased bundle size and triggered a warning.
  - Application still builds successfully; future optimization can include lazy-loading chart routes/components.

## Run Locally

```bash
npm.cmd install
npm.cmd run dev
```

Then open `http://localhost:5173`.

Run tests with coverage (enforces thresholds from `jest.config.cjs`):

```bash
npm.cmd run test:coverage
```

## Progress Checklist

### Done

- [x] Vite + React project setup completed
- [x] UI migrated to MUI
- [x] Core pages implemented (`Dashboard`, `Drivers`, `Constructors`, `Races`)
- [x] Extra pages implemented (`CountdownTimer`, `DriverProfiles`, `RaceResults`, `HeadToHeadComparison`)
- [x] OpenF1 service layer added in `src/services/openf1.js`
- [x] Endpoints integrated:
  - [x] `meetings?year=`
  - [x] `meeting?meeting_key=`
  - [x] `sessions?meeting_key=`
  - [x] `drivers?session_key=`
  - [x] `championship_drivers?session_key=latest`
  - [x] `championship_teams?session_key=...`
  - [x] `session_result?session_key=...`
- [x] Hardcoded data removed from key pages and replaced by API-driven content
- [x] Loading and error states added on API-backed pages
- [x] Jest testing setup completed and test suites passing
- [x] Tests for newer pages (`CountdownTimer`, `DriverProfiles`, `RaceResults`, `HeadToHeadComparison`)
- [x] Coverage report and threshold enforcement (`npm.cmd run test:coverage`)

### Not Done Yet

- [ ] Session list per race UI (`meetings -> sessions`)
- [ ] Team-driver mapping view (`drivers?session_key=` + `championship_teams`)
- [ ] Driver points progression across multiple races/sessions
- [ ] Constructor points progression graph across sessions
- [ ] Lap/position charts for race analysis
- [ ] Circuit info panel with richer track metadata
- [ ] Global filters (season / driver / team / circuit)
- [ ] Search functionality for drivers/teams
- [ ] Tooltips/popups with richer driver/team details
- [ ] Bundle optimization via lazy loading/code splitting

### UI/Animation Enhancements (Later)

- [ ] Add route transitions (fade/slide) between pages
- [ ] Add stronger card hover depth and subtle scale effects
- [ ] Add skeleton loaders to all API-backed pages
- [ ] Add sticky table headers for standings/results tables
- [ ] Add podium styling (gold/silver/bronze) in `RaceResults`
- [ ] Add countdown urgency states (green/amber/red + pulse near start)
- [ ] Add animated active nav indicator
- [ ] Add animated number count-up for dashboard metrics
- [ ] Add dark/light theme toggle with persistence
