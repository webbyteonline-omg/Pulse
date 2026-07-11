# Pulse ⚡

A college life dashboard for Indian students — attendance tracking with a bunk calculator, academic calendar with AI-powered PDF import, and expense tracking with UPI SMS / screenshot parsing. Installable PWA, works offline, sends push + email reminders.

## Stack

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS · Framer Motion · Supabase (Postgres + Auth) · TanStack Query · Zustand · Zod · Recharts · Gemini Flash (calendar parsing) · Tesseract.js (screenshot OCR) · web-push · Resend · Vercel Cron.

## Setup

### 1. Install

```bash
npm install
```

> If `node_modules` already exists from a different OS, run `rm -rf node_modules && npm install` first.

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Open the SQL editor and run `supabase/migrations/0001_init.sql`.
3. Copy the project URL + anon key + service-role key into `.env.local`.
4. (Recommended) Auth → Providers → Email: keep "Confirm email" on.

### 3. Environment

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Where to get it |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page (keep secret — used by cron & account deletion) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — used server-side only |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) (free tier) |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | `npx web-push generate-vapid-keys` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Same as `VAPID_PUBLIC_KEY` |
| `VAPID_EMAIL` | `mailto:you@example.com` |
| `CRON_SECRET` | Any random string (`openssl rand -hex 32`) |

### 4. Run

```bash
npm run dev
```

## Deploy (Vercel)

1. Push to GitHub, import into Vercel.
2. Add every env var from `.env.local` in Vercel → Project → Settings → Environment Variables.
3. `vercel.json` already schedules the notification cron at **2:30 UTC (8:00 AM IST)** daily. Vercel automatically sends `Authorization: Bearer $CRON_SECRET` when `CRON_SECRET` is set.
4. On the deployed HTTPS domain, install via "Add to Home Screen" (Android/Chrome shows an install prompt; on iOS use Share → Add to Home Screen).

## Features

- **Dashboard** — greeting, urgent alert banners (exam tomorrow, low attendance, holiday), today-at-a-glance grid, next-7-days event rail, attendance overview, spending chart, pull-to-refresh on mobile.
- **Attendance** — per-subject cards with one-tap Present/Absent (optimistic + offline-queued), animated detail view, bunk calculator ("safely miss X", "attend next X to reach 75/80%", recovery mode), monthly history calendar.
- **Academic** — pinned exam/holiday countdowns, drag-and-drop academic-calendar PDF → PDF.js text extraction → Gemini Flash parses every event → preview → bulk import; manual events; upcoming/past/all tabs with type filters.
- **Finance** — month selector, budget progress, category donut, recent transactions; add expenses manually, by pasting a UPI SMS (GPay/PhonePe/Paytm/bank regexes + merchant keyword auto-categorization), or from a payment screenshot (on-device Tesseract OCR); per-category monthly budgets; CSV export.
- **Notifications** — web push (VAPID) + Resend email digest via daily Vercel cron: events 3 days / 1 day out, subjects below 76%, budgets at 80%+.
- **PWA** — manifest + icons, custom service worker: static cache-first, API network-first with offline fallback, offline page, IndexedDB outbox with Background Sync replay for mutations made offline.

## Architecture notes

- The service worker (`public/sw.js`) is hand-written and registered in `components/providers.tsx` — no build plugin needed, full control over caching and background sync.
- Row Level Security on every table; the browser only ever uses the anon key. The service-role key is used exclusively in `/api/cron/notifications` and `/api/account`.
- Gemini is called from the server route `/api/parse-calendar` so the API key never ships to the client.
- All dates are stored as `date` columns and computed/displayed in IST (`Asia/Kolkata`).
