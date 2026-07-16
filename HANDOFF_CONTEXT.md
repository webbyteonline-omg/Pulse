# Pulse — Handoff Context (paste this whole file into a new chat)

> Purpose: give a fresh agent everything needed to continue work on this repo
> WITHOUT re-reading the whole codebase. Paste this doc as the first message.
> Only read actual files when you need to change something not described here.

## What Pulse is

Next.js 15 App Router PWA for Bennett University students — attendance,
academics (assignments/quizzes/exams), finance/expenses, friends, groups,
campus map, health. Supabase (Postgres + RLS + Realtime + Storage) backend.
Repo root: `/Users/sachinkumar/Desktop/Pulse` (in bash sandbox:
`/sessions/<session>/mnt/Pulse`).

## Architecture cheat-sheet (so you don't have to grep for these)

- Route groups: `app/(app)/...` = authenticated shell (Sidebar + BottomNav +
  middleware auth), `app/(auth)/...` = login/signup, bare `app/...` = public
  (e.g. `app/privacy`). Parenthesized segments don't affect the URL.
- Theming: RGB-triple CSS vars in `app/globals.css` — `--bg`, `--card`,
  `--card-hover`, `--line`, `--input`, `--ink`, `--ink-dim`, `--ink-faint`,
  `--chart-bar`. Defined separately per `html.dark` / `html.light` /
  `html.amoled`. Consumed via Tailwind classes (`bg-card`, `text-ink`,
  `text-ink-dim`, `border-line`, `bg-bg`) — tailwind.config.ts maps them as
  `rgb(var(--x) / <alpha-value>)`. NEVER write bare `var(--x)` — either use
  the Tailwind class, or `rgb(var(--x))` inline (e.g. for gradients).
  Semantic/brand colors are static hex in tailwind.config, intentionally
  theme-invariant: `primary` #6C63FF, `accent` #FF6584, `success` #43D98C,
  `warning` #FFB347, `danger` #FF5C5C, `sky` #4FACFE (each has a `-dim`
  variant = same hex + `26` alpha). Gold/silver/bronze rank medals
  (#FFD700/#C0C0C0/#CD7F32) are also intentionally hardcoded everywhere
  (leaderboards) — not a theme bug if you see them.
- Supabase client: `getSupabaseBrowser()` from `lib/supabase/client.ts` (NOT
  `createClient`). Auth state: Zustand `useAuthStore` from
  `store/authStore.ts` (`{ user, initialized, setUser, displayName() }`) —
  there is NO `useAuth` hook, don't invent one.
- `user_profiles` table: PK is `id` (references `auth.users`, NOT
  `user_id`), `display_name` (NOT `full_name`), `pulse_score` (integer,
  already exists), `current_streak` does NOT exist on this table — streak
  lives on `user_stats.streak`. Column list constant:
  `lib/supabase/columns.ts` → `PROFILE_COLUMNS`.
- Pulse Score: `lib/pulseScore.ts` has `computePulseScore()` (attendance 30
  + finance 25 + consistency 25 + mood 20 = 100), consumed live by
  `useLivePulseScore()` in `hooks/useProfile.ts`. `useStatsSync()` (in
  `hooks/useProfile.ts`, mounted once via `components/layout/AppShellExtras.tsx`)
  runs on every app-open and writes the computed score back to both
  `user_stats.pulse_score` and `user_profiles.pulse_score` — this keeps the
  stored column in sync automatically, no manual trigger needed.
  `lib/groupScore.ts` has a SEPARATE, differently-weighted formula
  (`calculateGroupScore`) used only for Group leaderboards — don't confuse
  the two.
- Real leaderboard hook: `hooks/useLeaderboard.ts` → `useLeaderboard(category)`
  where category is `"steps"|"attendance"|"budget"|"pulse"|"mood"`. Returns
  friends + self, ranked, privacy-flag-respecting (reads `friendships` +
  `user_profiles` + `user_stats`). `components/dashboard/LeaderboardCard.tsx`
  already uses `useLeaderboard("pulse")` — NO mock data exists anywhere in
  the repo anymore (verified via repo-wide grep, task done).
- Groups feature is fully built: `hooks/useGroups.ts` (useMyGroups,
  useGroupById, useCreateGroup, useUpdateGroup, useDeleteGroup,
  useGroupByInviteCode, useJoinGroupByInviteCode), `hooks/useGroupMembers.ts`,
  `hooks/useGroupLeaderboard.ts` (ranks by `user_profiles.pulse_score` —
  chosen deliberately since RLS blocks cross-user live computation),
  `components/groups/*` (GroupAvatar, GroupCard, GroupCardWithRank,
  GroupSearchBar, CreateGroupForm, GroupLeaderboard, MemberCard, MembersList,
  InviteSheet, AddMembersSheet, MemberActionsSheet), pages under
  `app/(app)/groups/**` (list, create, `[groupId]` detail, `[groupId]/members`
  admin mgmt, `join/[inviteCode]`). Uses `qrcode.react` for invite QR codes.
- Reusable bottom-sheet: `components/ui/Modal.tsx` — props
  `{ open, onClose, title?, titleAction?, children, variant?: "sheet"|"center", className? }`.
  Handles backdrop, Escape key, body-scroll-lock, and Android back-button
  (pushes a dummy history state on open, popstate closes it). **Important
  bug class fixed this session (see below): never pass an inline
  `onClose={() => ...}` from a component that re-renders often (e.g. on
  scroll) without wrapping it in `useCallback` — Modal itself now also
  guards against this internally via a ref, but stay consistent.**
- `hooks/useToast.ts` — shared toast hook: `const { toast, showToast } = useToast()`,
  auto-dismisses after 1.8s via internal `useEffect`/`setTimeout`. Use this
  for any new toast instead of hand-rolling one.
- Bottom nav: `components/layout/BottomNav.tsx` — 6 tabs total: Home,
  Academics, Map, Expense, Friends (all real `Link`s), plus a 6th **"More"**
  button (not a Link) that opens `components/layout/MoreMenuSheet.tsx` — a
  Modal-based sheet listing Groups / Campus Map / Health / Profile /
  Settings / Privacy Policy / About Pulse. `components/ui/MenuIcon.tsx` is
  the staggered-lines hamburger glyph used for the More tab.
- Routes that already exist (don't recreate): `/dashboard`, `/attendance`,
  `/map`, `/finance` (+`/finance/add`, `/finance/borrow`, `/finance/budget`),
  `/friends`, `/groups` (+ subroutes above), `/health`, `/profile`,
  `/settings`, `/privacy`, `/academic`, `/timetable`, `/leaderboard`, `/polls`,
  `/onboarding`.
- Health/mood tracking already exists and is fully built —
  `app/(app)/health/page.tsx` has a wellness score hero, 2x2 quick-log grid
  (steps/water/calories/sleep), a 5-emoji "Mind & Mood" row wired to
  `daily_checkins.mood` via `useTodayCheckin()`/`useSaveCheckin()` in
  `hooks/useProfile.ts`, quick-action timers, and an encrypted journal. Do
  NOT build a second/parallel mood system (a `mood_logs` table) — this was
  explicitly rejected this session; the existing one already covers it.
- CSV export exists in TWO places: `lib/utils.ts`'s `downloadCSV()` util,
  used by `app/(app)/settings/page.tsx` (still present, intentionally kept)
  — the Finance page's OWN inline CSV export button was removed this
  session per user request. Don't re-add it to Finance.

## What changed THIS session (most recent work, in order)

1. **Removed all mock leaderboard data.** `components/dashboard/LeaderboardCard.tsx`
   no longer has `MOCK_PEERS`/hardcoded names — rewritten to consume
   `useLeaderboard("pulse")` directly (loading skeleton + empty state +
   real ranked list, props-free now — no more `yourName`/`yourScore` props).
   `app/(app)/dashboard/page.tsx` updated to call `<LeaderboardCard />` with
   no props; removed now-unused `useMyProfile` import/`profileQuery`.
   Confirmed (via `useStatsSync`) that `pulse_score` is already kept live —
   no new sync code was needed.

2. **Built a hamburger "More" menu** (previously Groups had zero
   discoverability if you had 0 groups — the Friends-page "Your Groups" row
   only renders when `groupsQuery.data.length > 0`). New files:
   `components/ui/MenuIcon.tsx`, `components/layout/MoreMenuSheet.tsx`.
   Edited `components/layout/BottomNav.tsx` to add a 6th "More" tab
   (button, not Link) that opens the sheet. Sheet links to Groups, Campus
   Map, Health, Profile, Settings, Privacy Policy, and an "About Pulse"
   toast ("Built by Sachin, BU 2025–29").

3. **Finance page cleanup** (`app/(app)/finance/page.tsx`):
   removed the fixed/floating bottom "Add Expense / Lent-Borrow" bar and
   the desktop FAB entirely; added inline grid buttons (Add Expense / Lent
   & Borrow) directly above the "Recent" card instead; removed the
   "Export CSV" button + its `downloadCSV` call from the Overview tab
   (Settings page's separate export was left alone); compacted the Total
   Spent hero card, donut chart card, and category-breakdown rows
   (smaller padding/fonts). Also compacted `components/finance/ExpenseItem.tsx`
   row height/avatar/fonts.

4. **Found and fixed a real backend bug — Postgres RLS infinite recursion.**
   User hit `GET .../group_members?select=group_id&user_id=eq.<uid> 500`
   whenever opening the Friends page. Root cause: two policies in
   `supabase/migrations/0008_friend_groups.sql` — `"Members can view group
   members"` and `"Admins can manage members"` on `public.group_members` —
   each ran a subquery `select 1 from public.group_members gm2 where ...`
   INSIDE their own USING clause on the SAME table, causing Postgres to
   recurse RLS evaluation infinitely, which errors out and surfaces as a
   PostgREST 500. **Fix written but NOT YET APPLIED to the live Supabase
   project** — new migration file `supabase/migrations/0009_fix_group_members_rls_recursion.sql`
   creates two `SECURITY DEFINER` helper functions (`public.is_group_member`,
   `public.is_group_admin`) that bypass RLS internally when called from
   inside a policy (breaks the recursion — standard Supabase pattern), and
   replaces the recursive policies (plus, for consistency, the
   `friend_groups` policies and the storage upload policy) to call these
   functions instead of querying `group_members` directly.
   **>>> ACTION REQUIRED FROM USER: they must run this migration's SQL in
   the Supabase SQL editor manually — I cannot execute it from here. Until
   they do, the Friends page's Groups query will keep 500ing. If they say
   the error is still happening, first ask "did you run migration 0009 in
   Supabase yet?" before debugging further. <<<**

5. **Found and fixed a real frontend bug — hamburger menu totally
   unclickable.** Root cause: `components/layout/BottomNav.tsx` has a
   `scrolled` state updated on every `window` scroll event. It was passing
   `MoreMenuSheet` an inline `onClose={() => setMoreOpen(false)}` prop — a
   brand-new function identity on every BottomNav re-render. Scrolling
   INSIDE the open sheet (7 menu items in a 65dvh sheet — plausible) bubbles
   to that same window scroll listener → `scrolled` toggles → BottomNav
   re-renders → new `onClose` identity → `Modal.tsx`'s
   `useEffect([open, onClose])` (the Android-back-button history-push
   effect) re-fires mid-open → pushes a new history entry AND its cleanup
   immediately calls `history.back()` (because the previous dummy state was
   still flagged) → the page was churning through browser history navigation
   on every scroll tick while the sheet was open, swallowing all taps.
   **Fixed two ways** (belt and suspenders): (a) `BottomNav.tsx` now wraps
   both `openMore`/`closeMore` in `useCallback(..., [])` for stable
   identity; (b) `components/ui/Modal.tsx` itself was hardened to store
   `onClose` in a `useRef` and only depend on `[open]` in its effects, so
   this bug class can't recur in ANY Modal usage in the app regardless of
   caller discipline. This fix could NOT be verified live (no browser
   available in this environment) — user should hard-refresh (clear PWA
   cache/service worker) and confirm menu items are now tappable. If
   still broken after a real hard refresh, the next thing to check is
   whether `router.push()` itself is silently failing (e.g. middleware
   redirect loop) rather than the click handler.

6. **Compacted Academics/Attendance page.** `components/attendance/OverallCard.tsx`
   (the "Overall Attendance" donut card): donut shrunk 128px→96px, radius
   52→40, stroke 12→10, padding p-5→p-4, stat-row padding/fonts reduced.
   `components/attendance/SubjectCard.tsx`: padding p-4→p-3, dot/fonts/button
   heights reduced (buttons h-9→h-8). `components/academic/AttendanceSection.tsx`:
   gaps `mt-6 mb-3`→`mt-4 mb-2.5`, subject list `space-y-3`→`space-y-2`.
   `app/(app)/attendance/page.tsx`: tab row `mb-6`→`mb-4`.

7. **Removed the Friends-page inline map entirely, replaced with a small
   button** per explicit user request ("chota sa button, bhot bda mt
   banana"). `app/(app)/friends/page.tsx`: deleted the whole "Friends on
   campus" section (share-location toggle, permission-denied warning,
   320px `<FriendsMap />` embed, privacy note paragraph) and its
   `useLocationSharing` hook usage / dynamic `FriendsMap` import. Replaced
   with one compact `Link` row: pin icon + "Find your friends on campus" +
   "Open →", linking to `/map`. Also tightened the tabs-row gap
   `mb-6`→`mb-4`. **Note:** `hooks/useLocationSharing.ts` and
   `components/friends/FriendsMap.tsx` still exist as files and still work
   (untouched) — they're just no longer rendered on the Friends page. The
   `/map` page itself (`components/map/MapView.tsx` etc.) is unrelated and
   unaffected — it still has its own satellite/campus/city tabs.

All of the above passed `npx tsc --noEmit` clean (verified after every
step). A `next build` was attempted but fails in this sandbox ONLY because
of a network restriction (can't fetch Google Fonts "Inter") — that's a
sandbox limitation, not a real bug; don't chase it.

## Post-handoff note

- `components/dashboard/LeaderboardCard.tsx` was edited again after this
  doc was first written — its loading-state wrapper now uses a `clay`
  utility class (`className="clay rounded-[20px] p-4 mb-5"`) instead of the
  plain `bg-card` div this session originally wrote. This looks like a
  design-system class (likely a claymorphism/soft-shadow utility defined
  somewhere in globals.css or tailwind.config.ts) applied by the user or a
  linter/formatter — treat it as intentional, don't revert it, and check
  whether other cards in the app use the same `clay` class before assuming
  it's a one-off.

## Known outstanding item (not yet done, not requested yet either)

- Migration `0009_fix_group_members_rls_recursion.sql` exists in the repo
  but has NOT been run against the live Supabase project. This is the very
  first thing to check if the user reports ANY Groups-related 500 error or
  says Friends page is still broken.
- No other pending tasks from this session — all 94 tracked tasks are
  marked completed as of this handoff.

## How to work in this repo (environment notes)

- File edits: use Read/Edit/Write tools on paths like
  `/Users/sachinkumar/Desktop/Pulse/...` (this is the user's real synced
  folder — a "connected folder", changes are immediately visible to them).
- Shell/typecheck: use the bash tool, cd to
  `/sessions/<session>/mnt/Pulse` (path differs per session — check the
  system prompt's Shell Access section for the exact current mapping), then
  `npx tsc --noEmit`. This is the standard verification step after any
  edit — always run it before declaring a task done.
- `npm run build` will fail in-sandbox on the Google Fonts fetch — this is
  expected and NOT a signal of a real bug; rely on `tsc --noEmit` instead.
- The user (Sachin) communicates in Hinglish/Hindi casually — respond in
  kind when he does. He explicitly wants concise, direct answers, minimal
  formatting/bullets in prose, and dislikes over-explaining finished work.
- User previously answered several architecture-fork questions (recorded
  in prior summaries) — the two most relevant standing decisions: (a) group
  leaderboards rank by the existing `user_profiles.pulse_score`, not a new
  per-period recomputation (blocked by RLS anyway); (b) the Health page's
  existing mood tracker is the ONE mood system — never build a duplicate.
