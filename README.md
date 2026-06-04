# Mavuno Guard

**Farm risk intelligence for weather, trees, and field operations.**

| | |
|---|---|
| **Repository** | [github.com/nahorfelix/mavuno-guard](https://github.com/nahorfelix/mavuno-guard) |
| **Live demo** | [mavuno-guard.vercel.app](https://mavuno-guard.vercel.app) |

---

## Overview

Mavuno Guard is a Next.js app I built for the WeatherAI Developer Platform assessment. It consumes multiple WeatherAI endpoints through a server-side proxy, then turns that data into farm-facing screens: risk scores, operation windows, canopy analysis, plan-aware alerts, and an operations view for quota and health.

The goal is not to display a forecast widget. The goal is to help someone decide what to do in the field today.

---

## Problem solved

Farmers and ag officers rarely need another temperature chart. They need answers: Can we spray? Should we irrigate tonight? Is humidity high enough to worry about fungal pressure? Did canopy coverage change since last week?

Mavuno Guard connects WeatherAI readings to those decisions across dedicated modules instead of dumping raw API JSON into the UI.

---

## Key features

| Module | Route | What it does |
|--------|-------|----------------|
| Farm Command Center | `/dashboard` | Current weather, farm risk score, prioritized recommendations |
| Field Planner | `/planner` | Hourly and daily planning, spraying/irrigation windows, trends |
| Tree & Canopy Lab | `/trees` | Canopy upload, scan history, quota, forestry count |
| Alert Center | `/alerts` | Weather-risk rules with live previews and honest plan locks |
| Operations Dashboard | `/operations` | Usage, quotas, rate limits, integration and health status |
| Developer Notes | `/docs` | Architecture, security, API mapping, error handling |

Supporting behavior across the app:

- Demo mode when no valid API key is configured
- Normalized `payload` (live) and `data` (demo) response handling
- Mapped HTTP errors (400, 401, 403, 429, 500, 503)
- Loading, empty, and error states on data-heavy pages

---

## WeatherAI APIs used

| WeatherAI endpoint | Purpose |
|--------------------|---------|
| `GET /v1/current` | Live conditions |
| `GET /v1/weather` | Multi-day forecast |
| `GET /v1/daily` | Daily forecast |
| `GET /v1/hourly` | Hourly forecast |
| `GET /v1/weather-geo` | Geo weather lookup |
| `GET /v1/usage` | Plan, quota, usage |
| `POST /v1/trees/analyze` | Canopy image analysis |
| `GET /v1/trees/history` | Scan history |
| `GET /v1/trees/quota` | Tree scan quota |
| `POST /v1/forestry/count-trees` | Forestry batch count |

---

## Internal API route mapping

The browser only talks to Next.js. Each row below is the internal route I expose to the frontend.

| WeatherAI | Internal route |
|-----------|----------------|
| `GET /v1/current` | `/api/weather/current` |
| `GET /v1/weather` | `/api/weather/forecast` |
| `GET /v1/daily` | `/api/weather/daily` |
| `GET /v1/hourly` | `/api/weather/hourly` |
| `GET /v1/weather-geo` | `/api/weather/geo` |
| `GET /v1/usage` | `/api/usage` |
| `POST /v1/trees/analyze` | `/api/trees/analyze` |
| `GET /v1/trees/history` | `/api/trees/history` |
| `GET /v1/trees/quota` | `/api/trees/quota` |
| `POST /v1/forestry/count-trees` | `/api/forestry/count` |
| Health probe (usage ping) | `/api/health/weather-ai` |

---

## Architecture

```
React UI  →  fetch /api/*  →  Route handlers  →  lib/weather-ai-client  →  WeatherAI
```

- Client components never import the WeatherAI base URL or API key.
- Route handlers read `process.env.WATHER_AI_API_KEY` and call `weatherAIClient`.
- Normalizers in `lib/` flatten live and demo payloads so UI code stays stable.
- `lib/error-mapper.ts` standardizes upstream failures before they reach the UI.

---

## Security decisions

- API key lives in `.env.local` (local) or Vercel environment variables (production).
- Key is used only in server code (`app/api/*`, `lib/weather-ai-client.ts`).
- API responses never include the key.
- `.env.local` and `.env*.local` are gitignored.
- `.env.example` ships a placeholder only—no secrets.

---

## Demo mode behavior

If `WEATHER_AI_API_KEY` is missing, still set to `wai_your_api_key_here`, or fails format checks, routes return structured demo JSON:

```json
{ "demoMode": true, "message": "...", "data": { ... } }
```

That keeps the project reviewable without billing live WeatherAI calls. The UI labels demo state where relevant (dashboard banner, operations badges).

---

## Plan-aware feature handling

Usage data drives what the UI claims is available:

- **Free plan** — core weather, planner, in-app alert previews.
- **Webhooks** — shown as Pro-locked when `webhooks: false`; no fake webhook success.
- **SMS** — shown as Scale-locked when unavailable.
- **403 responses** — surfaced as plan limitation messages, not generic crashes.

Alert rules and operations cards read the same capability flags so locked features stay consistent across the app.

---

## Local setup

```bash
git clone https://github.com/nahorfelix/mavuno-guard.git
cd mavuno-guard
npm install
cp .env.example .env.local
```

Edit `.env.local` and set a real `wai_...` key, then:

```bash
npm run dev
```

Open the app at port 3000 (default for `next dev`).

Verify build quality before submitting:

```bash
npm run lint
npm run build
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WEATHER_AI_API_KEY` | Yes (for live data) | WeatherAI Developer Platform key (`wai_...`) |

Example (`.env.example`):

```env
WEATHER_AI_API_KEY=wai_your_api_key_here
```

---

## Testing checklist

| URL | Check |
|-----|--------|
| `/` | Landing page and navigation |
| `/dashboard` | Weather, risk, recommendations |
| `/planner` | Hourly rows, daily cards, charts |
| `/trees` | Upload flow, quota, history |
| `/alerts` | Rules, previews, locked channels |
| `/operations` | Health, usage, quotas, integrations |
| `/docs` | Developer documentation |
| `/api/health/weather-ai` | JSON health, no key in body |

---

## Known limitations

- Webhooks and SMS depend on WeatherAI plan tier.
- Tree analysis and forestry count depend on quota and API availability.
- Alert rules are held in React state (not persisted to a database).
- Extended forecast and some AI-heavy features may require plan upgrades.
- Demo mode uses static/sample payloads when no valid key is configured.

---

## Future improvements

- User accounts and farm profiles
- Persistent alert rules and notification history
- Webhook and SMS delivery when the plan supports them
- Seasonal analytics and historical comparisons
- Offline-friendly views for low-connectivity fields

---

## Tech stack

Next.js 15 (App Router), TypeScript, Tailwind CSS, WeatherAI API, Recharts, Lucide icons, Vercel hosting.
