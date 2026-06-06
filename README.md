# KidWell — Hackathon Demo App

> AI-powered school wellbeing platform demo for the Wellness Hackathon 2026.

A minimal, pitch-ready web app with **three live AI features** — no auth, no database, no JWT. Built for a 5-minute demo.

## Features

| Tab | What it does |
|--|--|
| **Student Check-in** | Enter name, mood, energy, sleep, pain → AI returns wellbeing score (0–100) + encouraging summary |
| **Nutrition Plan** | Generates a 3-day Ethiopian meal plan from a sample student profile |
| **Counsellor Brief** | Generates a structured brief (summary, concerns, conversation starters) from sample check-in data |

## Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Add your OpenRouter API key
cp .env.example .env.local
# Edit .env.local and set OPENROUTER_KEY=sk-or-...

# 3. Run the demo
npm run dev
# Open http://localhost:3000
```

## Tech stack

- **Frontend:** Next.js 14 + React + Tailwind + shadcn/ui dashboard
- **Backend:** Next.js API routes (server-side only)
- **AI:** OpenRouter API (server-side)
- **Data:** In-memory mock store (`lib/store.ts`) — no Postgres required

## API routes

| Route | Method | Purpose |
|--|--|--|
| `/api/checkin` | POST | Compute wellbeing score from check-in form |
| `/api/nutrition` | POST | Generate 3-day meal plan |
| `/api/counsellor-brief` | POST | Generate counsellor brief from sample data |

## Project structure

```
kidwell-demo/
├─ app/
│  ├─ page.tsx              # Main UI (3 tabs)
│  ├─ layout.tsx
│  ├─ globals.css
│  └─ api/
│     ├─ checkin/route.ts
│     ├─ nutrition/route.ts
│     └─ counsellor-brief/route.ts
├─ lib/
│  └─ anthropic.ts          # Claude client (server-side)
├─ docs/
│  └─ TECHNICAL_DESIGN.md   # Full production blueprint
└─ README.md
```

## Environment variables

| Variable | Required | Purpose |
|--|--|--|
| `OPENROUTER_KEY` | Yes | OpenRouter API key (server-side only) |

## Demo accounts

| Role | Username | Password |
|--|--|--|
| Student | `sara` | `sara` |
| Parent | `parent` | `parent` |
| Counsellor | `counsellor` | `counsellor` |

Data is seeded in `lib/store.ts` with 5 days of Sara's check-in history.

## Demo script (5 min)

1. **Student Check-in** — Enter "Sara", mood 2, energy 2, sleep 5.5 → show AI score + summary.
2. **Nutrition Plan** — Click "Generate This Week's Plan" → show Ethiopian 3-day meals.
3. **Counsellor Brief** — Click "Generate Counsellor Brief" → show summary, concerns, starters.
4. **Close** — "KidWell helps schools catch wellbeing issues early. AI supports humans — never replaces them."

See **[`docs/TECHNICAL_DESIGN.md`](docs/TECHNICAL_DESIGN.md)** for the full production blueprint (auth, database, RLS, etc.).
