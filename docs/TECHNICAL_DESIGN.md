# KidWell — Technical Design Document

**Status:** Hackathon MVP blueprint · **Version:** 1.0 · **Target build time:** 7 days · **Team:** 5 (2 engineers, 2 CS students, 1 PM/pitch)

This document is the single source of truth for building the KidWell MVP. It is written so a developer can start coding immediately.

---

## 1. MVP Selection

| | Decision | Why |
|--|--|--|
| **Primary user** | School counselor / designated support staff | They have the authority to act, they are overwhelmed, and they are the **payer's** proxy. A tool that saves *their* time is the easiest sell. |
| **Core problem** | Counselors find out a student is struggling *too late* — there is no early signal across a class of 200+ students. | Matches the "prevention over crisis" mandate; the gap is real and locally acute (counselors are scarce). |
| **Core solution** | Weekly student check-ins → AI summarizes behavioral patterns per student → surfaces a short "worth a check-in" list with supportive talking points. | One workflow, demoable, genuinely useful, and **human-in-the-loop** so it is safe. |

**Why this version is strongest:** It is the narrowest slice that still tells a complete, emotionally resonant story (student → AI → counselor acts). It avoids the privacy/diagnosis trap (no labels, human decides), avoids scope creep (one dashboard, one AI feature), and has a clean B2B payer. Everything else (nutrition, yoga, parent app, bullying detection) is deferred.

---

## 2. Product Requirements Document (PRD)

### Problem Statement
School counselors are responsible for hundreds of students but have no early, low-effort way to notice when a student's wellbeing is declining. By the time a problem surfaces, it is often a crisis. Existing tools are surveillance-heavy, Western, expensive, and assume a fully staffed counseling office.

### Target User
**Primary:** A counselor or designated trained staff member at a **private urban school in Addis Ababa** (200–800 students).
**Secondary (data provider):** Students aged ~12–18 who complete a weekly check-in.
**Tertiary (future):** Parents (positive summaries), school admins (aggregate trends).

### User Pain Points
- Cannot tell *which* of 200+ students needs attention this week.
- Reacts to crises instead of preventing them.
- No structured record of student wellbeing trends over time.
- Stretched thin; no time to manually review every student.

### Value Proposition
> KidWell gives counselors a weekly, prioritized "who needs a caring check-in" list — generated from students' own check-ins by an AI that describes patterns (never diagnoses) — so they can intervene early, supportively, and with full human judgment.

### Success Metrics
- **Product:** % of students completing weekly check-in (target ≥60%); # of AI prompts reviewed by counselor; time-to-first-contact after a flag.
- **Outcome (pilot):** counselor-reported "students reached I would have otherwise missed."
- **Business:** ≥1 school signs a pilot LOI during the hackathon week.
- **Demo:** a clear multi-week declining trend surfaced and acted on live.

---

## 3. User Stories (prioritized)

**P0 — must demo**
- As a **student**, I can complete a 30-second weekly check-in (mood, energy, sleep, optional note) so my counselor understands how I'm doing.
- As a **counselor**, I see a dashboard of my students with a prioritized "worth a check-in" list so I know who to talk to this week.
- As a **counselor**, I can open a student to read an AI **summary of behavioral patterns** + **suggested supportive talking points** (no diagnosis).
- As a **counselor**, I can mark a prompt **reviewed / actioned** so the workflow is tracked.

**P1 — nice to have**
- As a **student**, I can see my own mood trend over time.
- As a **counselor**, I get an email when a new high-priority prompt appears.
- As an **admin**, I see **aggregate, non-identifying** class/school wellbeing trends.

**P2 — future**
- As a **parent**, I receive a positive weekly summary of my child.
- As a **counselor**, I can escalate to an external teletherapy partner.

---

## 4. MVP Features

### Must Have (build this week)
- Auth + roles (student, counselor).
- Weekly check-in form (mood 1–5, energy 1–5, sleep quality 1–5, optional note).
- Check-in history storage + simple wellness trend computation.
- AI insight generation per student (summary + signals + suggested prompt + needs_attention flag).
- Counselor dashboard: student list + prioritized prompts + insight detail + "mark reviewed".
- Consent flag enforced before a student can check in.

### Nice To Have
- Student self-view trend chart.
- Email notifications (Resend).
- Suggested mindfulness/breathing micro-activity (Tulsi-aligned sponsor thread).

### Future Features
- Parent dashboard / positive summaries.
- Bullying/anti-bullying class-climate pulse (anonymous, aggregate).
- Nutrition + physical activity tracking.
- External counselor/teletherapy referral integration.
- Amharic & Afaan Oromo localization, SMS/USSD check-ins, offline mode.
- Multi-school admin analytics.

---

## 5. System Architecture

```
                          ┌─────────────────────────────────┐
                          │            Browser              │
                          │  Next.js (App Router) + React   │
                          │  Tailwind + shadcn/ui           │
                          └───────────────┬─────────────────┘
                                          │ HTTPS
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
              ▼                           ▼                           ▼
   ┌──────────────────┐        ┌────────────────────┐      ┌────────────────────┐
   │  Supabase Auth   │        │  Next.js API Routes │      │  Supabase Postgres │
   │  (JWT, sessions) │◄──────►│  (serverless, on    │◄────►│  + Row-Level       │
   └──────────────────┘        │   Vercel)           │      │   Security (RLS)   │
                               │                    │      └────────────────────┘
                               │  - /api/checkins    │
                               │  - /api/ai/insights │──────► OpenAI gpt-4o-mini
                               │  - /api/dashboard    │        (server-side only,
                               │  - /api/wellness... │         anonymized input)
                               └─────────┬──────────┘
                                         │ (optional)
                                         ▼
                                 ┌───────────────┐
                                 │  Resend email │
                                 └───────────────┘
```

**Key architectural rules**
- The browser talks to Supabase directly **only** for auth + RLS-protected reads. All AI calls and any privileged writes go through **server-side API routes** so the OpenAI key and service-role key never reach the client.
- Student PII is **never** sent to the AI. The AI receives anonymized check-in series keyed by an internal `student_ref`.
- RLS guarantees a counselor can read only students at their own school; a student can read only their own data.

### Notification System
- MVP: in-app prompt list on the counselor dashboard (no external dependency).
- Nice-to-have: a daily digest email via Resend triggered by a Vercel Cron route (`/api/cron/digest`).

### Authentication
- Supabase Auth (email/password). JWT carries `role` and `school_id` as custom claims (set via a Postgres trigger or `auth.users` metadata mirrored into `users`).

---

## 6. Database Design

> Postgres (Supabase). All tables have RLS enabled. `uuid` PKs via `gen_random_uuid()`.

### `schools`
| Field | Type | Notes |
|--|--|--|
| id | uuid PK | |
| name | text | |
| type | text | enum: `private` \| `public` |
| city | text | |
| created_at | timestamptz | default now() |

### `users`
| Field | Type | Notes |
|--|--|--|
| id | uuid PK | matches `auth.users.id` |
| school_id | uuid FK → schools.id | |
| role | text | enum: `student` \| `counselor` \| `admin` \| `parent` |
| full_name | text | |
| email | text unique | |
| created_at | timestamptz | |

### `students`
| Field | Type | Notes |
|--|--|--|
| id | uuid PK | |
| user_id | uuid FK → users.id (nullable) | null if managed without login |
| school_id | uuid FK → schools.id | |
| student_ref | text | anonymized id sent to AI (e.g., `S-4821`) |
| grade | text | |
| counselor_id | uuid FK → users.id | assigned support staff |
| created_at | timestamptz | |

### `consents`  *(privacy — required before check-ins)*
| Field | Type | Notes |
|--|--|--|
| id | uuid PK | |
| student_id | uuid FK → students.id | |
| parental_consent | boolean | default false |
| student_assent | boolean | default false |
| consented_by | text | guardian name/relation |
| consented_at | timestamptz | |

### `mood_checkins`
| Field | Type | Notes |
|--|--|--|
| id | uuid PK | |
| student_id | uuid FK → students.id | |
| mood | int | 1–5 |
| energy | int | 1–5 |
| sleep_quality | int | 1–5 |
| note | text (nullable) | optional free text |
| created_at | timestamptz | default now() |

### `wellness_scores`
| Field | Type | Notes |
|--|--|--|
| id | uuid PK | |
| student_id | uuid FK → students.id | |
| period_start | date | |
| period_end | date | |
| composite_score | numeric | 0–100, computed |
| trend | text | enum: `improving` \| `stable` \| `declining` |
| computed_at | timestamptz | |

### `ai_insights`
| Field | Type | Notes |
|--|--|--|
| id | uuid PK | |
| student_id | uuid FK → students.id | |
| summary | text | neutral pattern summary |
| signals | jsonb | e.g., `["mood down 3 wks","poor sleep"]` |
| suggested_prompt | text | supportive talking point |
| needs_attention | boolean | true only on persistent multi-signal decline |
| confidence | numeric | 0–1 (display as low/med/high) |
| status | text | enum: `new` \| `reviewed` \| `actioned` |
| reviewed_by | uuid FK → users.id (nullable) | |
| created_at | timestamptz | |

### Relationships
- `schools` 1—* `users`, `students`
- `users` (counselor) 1—* `students` (via `counselor_id`)
- `students` 1—1 `consents`, 1—* `mood_checkins`, 1—* `wellness_scores`, 1—* `ai_insights`

---

## 7. API Documentation

> Base path `/api`. Auth via Supabase JWT in `Authorization: Bearer <token>`. All responses JSON. Errors: `{ "error": { "code": string, "message": string } }`.

### POST `/api/checkins`
Submit a student check-in.
- **Auth:** `student` (own record) — server verifies `consents` exist.
- **Request**
```json
{ "mood": 2, "energy": 3, "sleep_quality": 2, "note": "tired this week" }
```
- **Response `201`**
```json
{ "id": "uuid", "student_id": "uuid", "created_at": "2026-06-08T09:00:00Z" }
```

### GET `/api/checkins/history?student_id=<uuid>&weeks=8`
- **Auth:** `student` (own) or `counselor` (assigned student).
- **Response `200`**
```json
{ "student_ref": "S-4821",
  "checkins": [ { "mood": 2, "energy": 3, "sleep_quality": 2, "created_at": "..." } ] }
```

### GET `/api/wellness-score?student_id=<uuid>`
- **Auth:** `student` (own) or `counselor`.
- **Response `200`**
```json
{ "composite_score": 48, "trend": "declining", "period_start": "...", "period_end": "..." }
```

### POST `/api/ai/insights`
Generate (or refresh) an AI insight for a student from recent check-ins.
- **Auth:** `counselor` or system cron. Runs server-side; sends **anonymized** series to OpenAI.
- **Request**
```json
{ "student_id": "uuid" }
```
- **Response `200`**
```json
{ "summary": "Mood and sleep have trended lower over the past 3 weeks with reports of tiredness.",
  "signals": ["mood declining 3 weeks", "low sleep quality"],
  "suggested_prompt": "Consider a brief, supportive check-in about sleep and workload.",
  "needs_attention": true,
  "confidence": 0.72,
  "status": "new" }
```

### GET `/api/dashboard`
Counselor home: students + prioritized prompts.
- **Auth:** `counselor`.
- **Response `200`**
```json
{ "summary": { "total_students": 210, "checkins_this_week": 138, "needs_attention": 6 },
  "priority": [ { "student_id": "uuid", "student_ref": "S-4821", "trend": "declining",
                  "insight_id": "uuid", "suggested_prompt": "...", "confidence": 0.72 } ] }
```

### POST `/api/insights/{id}/review`
Mark a prompt reviewed/actioned (human-in-the-loop record).
- **Auth:** `counselor`.
- **Request** `{ "status": "actioned", "note": "spoke with student" }`
- **Response `200`** `{ "id": "uuid", "status": "actioned", "reviewed_by": "uuid" }`

### GET `/api/students`
List students for the counselor's school.
- **Auth:** `counselor` / `admin`. **Response:** array of student summaries (RLS-scoped).

---

## 8. AI Design

### Model
`gpt-4o-mini` (fast, cheap, JSON mode). Swappable with Claude 3.5 Haiku. Always **server-side**.

### Inputs (anonymized — no PII)
- `student_ref` (e.g., `S-4821`), grade band.
- Last 6–8 weekly check-ins: `mood`, `energy`, `sleep_quality`, optional `note`.
- Pre-computed `trend` from `wellness_scores`.

### Outputs (strict JSON)
```json
{ "summary": "string",
  "signals": ["string"],
  "suggested_prompt": "string",
  "needs_attention": false,
  "confidence": 0.0 }
```

### Prompt Design
**System prompt (verbatim starting point):**
```
You are a supportive assistant for a trained school counselor. You receive a student's
recent self-reported check-ins (mood, energy, sleep; 1=low, 5=high) and optional notes.

YOUR JOB:
- Describe OBSERVED PATTERNS in plain, non-clinical language.
- Suggest ONE gentle, supportive talking point the counselor could use in a human check-in.

HARD RULES:
- NEVER diagnose, name any mental-health condition, or imply one.
- NEVER produce a clinical risk score or use words like "disorder", "depression", "anxiety disorder".
- Describe behavior/trends only (e.g., "mood has trended lower for 3 weeks").
- Set "needs_attention": true ONLY when there is a PERSISTENT decline across MULTIPLE
  signals over at least 3 check-ins. A single low check-in is NOT enough.
- You are decision support for a human, not a decision maker.
- Output ONLY valid JSON matching the provided schema.
```
**User message:** the anonymized JSON series + trend.

### Safety Considerations
- **No diagnosis / no labels** enforced in the prompt and validated post-response (reject outputs containing a blocklist of clinical terms; fall back to a neutral template).
- **Multiple-signal threshold** for `needs_attention` reduces false positives.
- **Human-in-the-loop**: insight is a suggestion; counselor must review/action.
- **PII isolation**: only `student_ref` + numeric series leave the server; names never sent.
- **Auditability**: every insight stored with timestamp, confidence, and reviewer.
- **Display**: confidence shown as Low/Med/High, with a persistent "Not a diagnostic tool — for supportive human follow-up only" banner.

### How AI generates insights (flow)
1. Cron or counselor triggers `/api/ai/insights` for a student.
2. Server loads last 6–8 check-ins, computes trend, anonymizes.
3. Calls model in JSON mode with the system prompt.
4. Validates JSON + runs the clinical-term blocklist check.
5. Persists to `ai_insights`; surfaces on dashboard if `needs_attention` or declining.

---

## 9. Frontend Screens

### Login Screen
- Components: email + password fields, role-aware redirect, school logo.
- On success → student goes to check-in; counselor goes to dashboard.

### Student Check-In Screen (primary student surface)
- Components: 3 emoji/slider rows (Mood, Energy, Sleep — 1–5), optional note textarea, big "Submit" button, friendly copy, weekly cadence reminder.
- Confirmation state ("Thanks — your counselor is here for you").

### Student Dashboard (P1)
- Components: line/area chart of own mood trend (last 8 weeks), streak indicator, supportive tip card.

### Counselor Dashboard (the money screen)
- Components:
  - Top stats: total students, check-ins this week, # needs attention.
  - **Priority list**: cards for students needing a check-in, each with `student_ref`, trend chip (declining/stable/improving), confidence chip, suggested prompt, "Review" button.
  - Full student table with sortable trend column.
  - Persistent safety banner.

### AI Insights Screen (student detail)
- Components: anonymized header, 8-week mini chart, **AI summary** card, **signals** chips, **suggested talking point** card, confidence chip, action buttons: "Mark reviewed" / "Mark actioned" + note.

UI kit: **shadcn/ui** (Card, Badge, Button, Table, Dialog, Chart via Recharts).

---

## 10. Tech Stack

| Layer | Choice | Why (hackathon speed) |
|--|--|--|
| Frontend framework | **Next.js (App Router) + TypeScript** | One framework for UI + API; deploy to Vercel in minutes; scaffold UI with v0. |
| UI | **Tailwind + shadcn/ui + Recharts** | Beautiful defaults, fast, charts out of the box. |
| Backend | **Next.js API routes** | No separate server to deploy; co-located with frontend. |
| Database | **Supabase Postgres + RLS** | Managed DB + auth + row-level security (critical for child data) with almost no backend code. |
| Auth | **Supabase Auth** | Email/password + JWT + roles in minutes. |
| AI | **OpenAI `gpt-4o-mini` (JSON mode)** | Cheap, fast, reliable structured output; server-side. |
| Hosting | **Vercel + Supabase** | Zero-config deploy; free tiers cover a hackathon. |
| Email (optional) | **Resend** | One-call transactional email. |

---

## 11. Revenue Model

| | Detail |
|--|--|
| **Customer** | Private urban schools (Addis), 200–800 students, with budget + devices + designated staff. |
| **Pricing** | **Per-student annual subscription**, e.g. **~120–200 birr / student / year** (tiered). A 500-student school ≈ 60,000–100,000 birr/year. Pilot term discounted. |
| **Monetization strategy** | Land one private school as a paid pilot → expand across private-school networks → NGO/donor-funded deployments into public schools → district/government long-term. |
| **Why they pay** | Saves counselor time, demonstrates duty-of-care to parents (a marketing asset for the school), and enables early intervention. |
| **Secondary (future)** | Premium parent summaries; aggregate (anonymized) wellbeing analytics for school leadership. |

**Pitch line:** *"Schools pay per student per year; we make counselors more effective and give the school a duty-of-care story for parents. We validated pricing with [School] this week."*

---

## 12. Development Roadmap (7 days, 5 people)

**Roles:** E1, E2 = engineers · C1, C2 = CS students · PM = product/pitch/validation.

**Day 1 — Foundations**
- E1: Next.js + Tailwind + shadcn scaffold; Supabase project; auth wired.
- E2: DB schema migration (Section 6) + RLS policies + seed data.
- C1: Login + role-based routing.
- C2: Check-in form UI (static).
- PM: finalize PRD, line up 3 school contacts to interview, draft pitch outline.

**Day 2 — Core data flow**
- E1: `POST /api/checkins`, `GET /api/checkins/history` + consent gate.
- E2: wellness-score computation + `GET /api/wellness-score`.
- C1: connect check-in form to API; confirmation state.
- C2: student trend chart (Recharts).
- PM: conduct first 1–2 counselor interviews; capture pricing reactions.

**Day 3 — The AI feature**
- E1 + E2: `POST /api/ai/insights` — anonymization, OpenAI JSON call, blocklist validation, persistence.
- C1: counselor dashboard layout + stats.
- C2: seed realistic anonymized demo data with a clear declining trend.
- PM: secure a pilot LOI / written interest from one school.

**Day 4 — Counselor workflow**
- E1: `GET /api/dashboard` priority list.
- E2: `POST /api/insights/{id}/review` + status tracking.
- C1: priority cards + AI insight detail screen.
- C2: safety banner, confidence chips, polish.
- PM: build pitch deck; write demo script (Section 13).

**Day 5 — Integration + polish + safety pass**
- All: end-to-end test student → AI → counselor → action.
- E1/E2: edge cases, RLS verification (counselor can't see other schools), error states.
- C1/C2: visual polish, mobile responsiveness, empty/loading states.
- PM: rehearse pitch v1.

**Day 6 — Hardening + demo dry-run**
- Deploy to Vercel; production seed data; lock demo accounts.
- Nice-to-have: email digest if time allows.
- Full demo dry-run x3; record a backup demo video (in case live fails).
- PM: integrate validation quote into pitch.

**Day 7 — Final rehearsal + buffer**
- Freeze code. Only bug fixes.
- Rehearse 3-minute demo + Q&A (privacy, who-pays, scale, false positives).
- Prepare answers to the judge questions in Section 14.

---

## 13. Hackathon Demo Script (3 minutes)

**0:00–0:25 — Hook (PM)**
> "A school counselor in Addis is responsible for 600 students. By the time they learn a student is struggling, it's often a crisis. KidWell changes *when* they find out — without ever diagnosing a child."

**0:25–0:55 — Student experience (C1 drives)**
- Log in as a student. Complete the 30-second check-in (mood/energy/sleep + note). Submit.
> "Thirty seconds, once a week. That's all we ask of students."

**0:55–1:55 — The AI + counselor payoff (E1/PM)**
- Switch to counselor dashboard. Show stats + the **priority list**.
- Open the flagged student (`S-4821`) → show the 8-week declining chart → the **AI summary**, **signals**, and **suggested supportive talking point**.
> "The AI never diagnoses or labels. It describes patterns — three weeks of lower mood and poor sleep — and suggests a gentle, human conversation. The counselor always decides."
- Click **"Mark actioned"** with a note.

**1:55–2:30 — Safety + trust (PM)**
> "Privacy-by-design: parental consent and student assent, data private to the counselor, never used for discipline, and a flag only appears after multiple signals over time — never one bad day."

**2:30–3:00 — Business + close (PM)**
> "Private schools pay per student per year — about 120–200 birr. We spoke with [School] this week and they want to pilot it. We start with private urban schools, expand across networks, then bring it to public schools with NGO funding. KidWell helps counselors reach the students they'd otherwise miss — before it becomes a crisis."

**Backup:** play the recorded demo video if the live environment fails.

---

## 14. Developer Documentation (standards & onboarding)

### Branching & workflow
- `main` = always deployable. Feature branches `feat/<scope>`, PRs reviewed by the other engineer.
- Commit style: Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Keep PRs small; demo-critical paths protected.

### Environment setup
See `README.md` → Quickstart + Environment variables.

### Coding standards
- TypeScript strict mode on. ESLint + Prettier enforced on commit.
- API handlers: validate input (zod), check auth + role, scope by `school_id`, return typed JSON.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` or `OPENAI_API_KEY` to the client.
- All AI output passes the clinical-term blocklist before persistence.

### Definition of Done (per feature)
- Works end-to-end locally with seed data.
- RLS verified (a counselor cannot read another school's data).
- Loading + empty + error states handled.
- No secrets in client bundle.

### Test data
- `supabase/seed.sql` creates 1 school, 1 counselor, ~30 students, and one student (`S-4821`) with a scripted 8-week declining trend for the demo.

### Judge Q&A prep (rehearse answers)
- *"Does the AI diagnose?"* → No. It describes patterns; a trained human decides. Blocklist + human-in-the-loop enforce this.
- *"How do you prevent false positives harming a child?"* → Multi-signal-over-time threshold, non-punitive by policy, flags private to the support person.
- *"Who pays and will they?"* → Private urban schools, per-student/year; validated with [School] this week.
- *"How does it scale?"* → Private school networks → NGO-funded public schools → district.
- *"Privacy/consent?"* → Parental consent + student assent required before any check-in; data minimization; PII never sent to the AI.

---

*End of Technical Design Document.*
