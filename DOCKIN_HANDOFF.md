# DockIn — Handoff Context (paste into a new chat)

**Purpose:** bring a fresh agent fully up to speed on the Pulse→DockIn transformation WITHOUT re-reading the whole codebase. Paste this as the first message. Only open real files when changing something not described here.

Repo root: `/Users/sachinkumar/Desktop/Pulse` (bash sandbox: `/sessions/<session>/mnt/Pulse`).
User: Sachin, Bennett University. Communicates in Hinglish — reply in kind, be concise, minimal formatting/bullets in prose, don't over-explain finished work.

---

## What DockIn is now
"Pulse" (a Next.js 15 PWA college tracker) has been **rebranded to DockIn** and flipped into a **social-first campus app** for Bennett students — friends/snaps/chats/groups/confessions come first; academics/finance/health are secondary utilities behind the "Me" tab. Supabase (Postgres + RLS + Realtime + Storage) backend, TanStack Query, Zustand, Tailwind v3, framer-motion.

## Environment / how to work
- Edit via Read/Edit/Write on `/Users/sachinkumar/Desktop/Pulse/...` (real synced folder).
- **Verify after every change:** `cd` to the sandbox Pulse path, run `npx tsc --noEmit`. This has been kept clean throughout — keep it clean.
- `npm run build` FAILS in-sandbox only because it can't fetch Google Fonts (Poppins) — sandbox limitation, NOT a real bug. Rely on tsc.
- User can't reliably run localhost; he git-pushes and tests on phone. So build things fully, verify with tsc, don't gate on local testing.

---

## Clay design system (foundation — already in place)
- `app/globals.css`: theme-aware clay utilities — `.clay` (raised card), `.clay-soft`, `.clay-inset` (pressed well), `.clay-purple-btn` (DockIn violet gradient btn), `.clay-page` (soft page bg). Per-theme shadow vars (`--clay-shadow/-soft`, `--clay-inset`, `--clay-page`) defined for `html.light` (reference look), `:root/html.dark`, `html.amoled`. All 3 themes kept.
- `tailwind.config.ts`: clay palette `clay-{purple,pink,orange,green,yellow,blue,red,teal}` + each `-dim` (26% alpha), static hex (theme-invariant). Radii `clay` (28px), `clay-lg` (36px). Gradients `bg-clay-violet`, `bg-clay-violet-h`. Font `--font-poppins` first.
- Font: **Poppins** (was Inter), loaded in `app/layout.tsx` as `--font-poppins`.
- **Global primitives already clay** (huge leverage — reskinned whole app):
  - `components/ui/Card.tsx` → `.clay` (used ~30+ places → nearly all cards clay).
  - `components/ui/Button.tsx` → primary=`clay-purple-btn`, secondary=`clay-soft`.
  - `components/ui/Input.tsx` (Input+Textarea) → `clay-inset`, focus ring `clay-purple`.
  - `components/ui/Modal.tsx` → sheet surface `.clay`.
- Design rule: NEVER write bare `var(--x)`; use Tailwind theme classes (`bg-card`,`text-ink`,`text-ink-dim`,`border-line`,`bg-bg`) or `rgb(var(--x))` inline. Semantic hex colors (primary #6C63FF, accent, success, warning, danger, sky) unchanged.

## Branding rename (Pulse → DockIn)
- All UI text, metadata, `manifest.json`, splash, logo → **DockIn**. Logo = `DockInLogo` in `components/auth/AuthCard.tsx` (gradient "D"); `PulseLogo` kept as an alias export so old imports don't break.
- **KEPT ON PURPOSE (do NOT rename — deliberate CTO call, user was warned & agreed to defer):** the metric name **"Pulse Score"** (prototype keeps it too — DockIn = app, Pulse Score = wellness metric), and all **DB identifiers**: column `pulse_score`, table `pulse_scores`, localStorage key `pulse-settings`. Renaming these is risky (RLS/sync/stored data) for zero user value. If user insists, do it LAST as a dedicated migration.

---

## Auth / first-run funnel (all clay, working)
Flow: `/welcome` → `/signup` → `/avatar-setup` → `/onboarding` → `/dashboard`. Returning logged-in users skip straight to dashboard (session persists; middleware handles it). Logged-out `/` → `/welcome`.
- `app/welcome/page.tsx` — NEW pre-auth 3-slide clay carousel (hero images + feature cards). Public route (added to middleware PUBLIC_PATHS).
- `app/(auth)/layout.tsx` — now a full-bleed `clay-page` (no centered card/ambient glow).
- `app/(auth)/signup/page.tsx` — exact clay match to user's mockup: Full Name, Bennett Email (auto-appends `@bennett.edu.in` if no `@`), Create/Confirm Password, Google OAuth, → `/avatar-setup`.
- `app/(auth)/login/page.tsx` — clay + lock hero + password auth + Google.
- `app/avatar-setup/page.tsx` — NEW bare authenticated route (outside `(app)`, full-screen). Choose avatar (saves `user_profiles.avatar_url`), mood (saves `daily_checkins.mood`, 1–5), outfit (cosmetic → user metadata). → `/onboarding`.
- Shared: `components/auth/ClayInput.tsx` (icon + suffix + rightSlot), `components/auth/GoogleButton.tsx` (Supabase `signInWithOAuth google`).
- `components/onboarding/OnboardingFlow.tsx` — existing 5-step setup, reskinned clay, "Welcome to DockIn".

## Social-first navigation & shell
- `components/layout/BottomNav.tsx` — **5-item floating clay pill**: `Home | Friends | [center camera FAB] | Groups | Me`. FAB = elevated `clay-purple-btn` circle → opens `SnapCameraSheet` (capture-first snap). Academics/Expense/Map REMOVED from nav (now under Me). Nav auto-hides on chat threads (`/^\/chats\/[^/]+/`). Active = clay-purple. "Me" match paths include /profile,/settings,/health,/academic,/attendance,/finance,/map,/timetable,/privacy.
- `app/(app)/layout.tsx` — root wrapped in `clay-page`.
- `components/layout/MoreMenuSheet.tsx` + `components/ui/MenuIcon.tsx` — **now UNUSED** (old "More" tab removed). Harmless, still present.

## Dashboard = social feed (`app/(app)/dashboard/page.tsx`)
Order: ① `StoriesRow` → ② `WhosFreeBar` → ③ `FriendActivity` → ④ `GroupActivity` → ⑤ small `QuickStats` + `AlertBanners` + ⑥ `TodayClasses` (only if academic data exists). Removed from home: PulseScoreCard, LeaderboardCard, QuickTiles, UpcomingEvents, AttendanceSummary (moved to Me/other tabs).
- NEW `components/dashboard/StoriesRow.tsx` (your story + friends' snaps → SnapViewer), `WhosFreeBar.tsx` (real online count → /friends), `GroupActivity.tsx` (my groups strip).

## Me tab (`app/(app)/profile/page.tsx`)
Added prominent **Quick Access** 4-up row: Academics · Finance · Health · Settings. Added Chats to MORE_LINKS. Invite card uses `bg-clay-violet`.

## Splash (`components/SplashScreen.tsx`, mounted in `components/providers.tsx`)
Redesigned to **social**: full-screen `clay-page`, big clay avatar (user's) + today's mood emoji + live hints ("X online", "Y new snaps") + **swipe-up (or tap) to enter** (framer drag). Falls back to minimal logo splash when no user (auth screens). Shows once per browser session (sessionStorage `pulse-splash-shown`).

## Friends tab (`app/(app)/friends/page.tsx`)
Added prominent full-width **Add Friends** clay-violet CTA card (with pending-request count). Online status / groups strip / campus-map link already existed.

## Groups tab (`app/(app)/groups/page.tsx`)
Sub-tabs **My Groups | Confessions**. My Groups: Active Polls bar (→/polls), search, `GroupCardWithRank` list, create **FAB**. Confessions tab: `ConfessionFeed`.

---

## NEW working features (full backend) — MIGRATIONS MUST BE RUN
Types added to `lib/supabase/types.ts`: `Snap`, `DirectMessage`, `Confession` (+ their `*Insert` + Database `Tables` entries `snaps`,`direct_messages`,`confessions`). The browser client is typed with `Database`, so any new table needs a types entry.

1. **Snaps** — ephemeral view-once photos.
   - `hooks/useSnaps.ts` (useInboxSnaps, useSendSnap, useMarkSnapViewed, useSnapRealtime).
   - `components/snaps/SnapViewer.tsx` (8s view-once, marks viewed on open), `SendSnapSheet.tsx` (per-friend), `SnapCameraSheet.tsx` (capture-first, multi-friend — used by nav FAB).
   - `app/(app)/snaps/page.tsx` (inbox + send grid).
   - Migration **`supabase/migrations/0010_snaps.sql`** (table + RLS + realtime + public storage bucket `snaps` + storage policies).
2. **Chats / DMs** — 1:1 realtime.
   - `hooks/useChats.ts` (useConversations, useThread, useSendMessage, useMarkThreadRead, useChatRealtime).
   - `app/(app)/chats/page.tsx` (list + quick-start row, in `(app)`), `app/chats/[friendId]/page.tsx` (thread — **BARE full-screen route OUTSIDE `(app)`** so no bottom nav; uses `useParams`). This grouped-list + ungrouped-detail split is intentional and Next-valid.
   - Migration **`supabase/migrations/0011_direct_messages.sql`**.
3. **Confessions** — anonymous campus feed.
   - `hooks/useConfessions.ts` (useConfessions, usePostConfession, useConfessionRealtime).
   - `components/groups/ConfessionFeed.tsx` (post box + live feed; author stored for moderation, NEVER shown; random animal-mask emoji per id).
   - Migration **`supabase/migrations/0012_confessions.sql`**.

## >>> ACTION REQUIRED FROM USER (Supabase SQL editor) <<<
Run these 4 migrations or the features 500/break:
- `0009_fix_group_members_rls_recursion.sql` (pending since the ORIGINAL pre-DockIn session — Friends/Groups RLS recursion fix)
- `0010_snaps.sql`, `0011_direct_messages.sql`, `0012_confessions.sql`
Optional: enable **Google** provider (Supabase → Auth → Providers) for Google login. If email-confirmation is ON, new signups see "check inbox" and land in onboarding after confirm (avatar-setup reachable at `/avatar-setup` while logged in) — could be tightened in QA.

## Assets
Copied from `ui-prototype-creation` into `public/`: `dockin/`, `avatars/`, `badges/`, `illustrations/`. Hero images placed: `public/dockin/signup-hero.png`, `login-hero.png`, `finance-hero.png` (from user's `Desktop/Images`). All `next/image` heroes use `quality={90}` + `sizes` for crisp-but-light loads.

---

## CURRENT OPEN TASK (why this handoff exists)
User made a NEW Desktop folder **"claude code"** containing a **new UI generated in Claude Design** (file `DockIn UI.dc.html`). He wants it **implemented into the DockIn app**, but **IGNORE the hybrid screens that mix clay + glass + skew**.
- Blocker: that "claude code" folder is **NOT mounted** yet. Currently mounted folders only: `Pulse`, `ui-prototype-creation`, `Images`, `outputs` (check `/sessions/<session>/mnt/`). The `claude_design` MCP is not connected here, and the connected Chrome's claude.ai account lacks Claude Design access — so the design can't be fetched remotely.
- **First step in the new chat:** get access to the "claude code" folder — use the folder-access request tool (`mcp__cowork__request_cowork_directory`) so the user can connect it. Then read the new UI HTML, and implement the screens into the real Next.js DockIn app using the existing clay system, **skipping any clay/glass/skew hybrid layouts**. Verify `tsc --noEmit` after each screen.

## Standing decisions
- All redesign uses the existing clay design system (light theme must stay crisp). Keep all 3 themes working.
- Keep all existing Supabase hooks; don't break anything. Mobile-first (~390px). framer-motion for transitions.
- Group leaderboards rank by `user_profiles.pulse_score` (RLS blocks cross-user live compute). Health page mood tracker is the ONE mood system — don't duplicate.
