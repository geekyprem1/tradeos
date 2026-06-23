# TradingOS — Engineering Breakdown Document
**Version:** 1.0 | **Date:** June 2026  
**Based on:** PRD v1.0 · TAD v1.1  
**Prepared by:** Staff Engineer  
**Sprint Duration:** 4 Weeks (30 Calendar Days)  
**Velocity Target:** ~4.5 productive hours/day

---

## Sprint Overview

| Sprint | Week | Focus | Est. Hours | Tasks |
|---|---|---|---|---|
| Sprint 1 | Days 1–7 | Foundation (Setup + DB + Auth + Playbooks) | 34h | 16 tasks |
| Sprint 2 | Days 8–14 | Discipline Loop Part 1 (Check-in + Contract + Notifications) | 32h | 14 tasks |
| Sprint 3 | Days 15–21 | Discipline Loop Part 2 (Intent Engine + Journal) | 32h | 12 tasks |
| Sprint 4 | Days 22–30 | Intelligence & Delivery (Score + Dashboard + Deploy) | 33h | 9 tasks |
| **Total** | | | **131h** | **51 tasks** |

---

## Task ID Convention

```
S-##   Setup
D-##   Database
A-##   Auth
PB-##  Playbook
MC-##  Morning Check-in
CC-##  Commitment Contract
TI-##  Trade Intent Engine
J-##   Journal
DS-##  Discipline Score
N-##   Notifications
DH-##  Dashboard
DEP-## Deployment
```

---

## Sprint 1 — Foundation (Days 1–7)

### 1. Setup

---

#### S-01 · Scaffold Next.js 15 Project
**Depends on:** Nothing  
**Estimate:** 2h

**Description:**  
Initialize Next.js 15 with App Router. Configure TypeScript, Tailwind CSS v3, ESLint, and Prettier. Set up `lib/`, `components/`, `app/` directory structure per TAD.

**Acceptance Criteria:**
- [ ] `npx create-next-app@latest` with TypeScript + App Router + Tailwind
- [ ] `/app`, `/components`, `/lib` directories match TAD structure exactly
- [ ] `tailwind.config.ts` includes design tokens (colors, font, spacing) from TAD
- [ ] Inter font loaded via `next/font/google`
- [ ] `globals.css` defines dark theme CSS variables
- [ ] `npm run dev` starts without errors on port 3000

**Testing Checklist:**
- [ ] `npm run build` completes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] Dark background (`#0f172a`) visible on `localhost:3000`

---

#### S-02 · Configure Supabase Project & Local Dev
**Depends on:** S-01  
**Estimate:** 2h

**Description:**  
Create Supabase project. Install `@supabase/supabase-js` and `@supabase/ssr`. Set up `lib/supabase/client.ts` (browser) and `lib/supabase/server.ts` (service role). Configure all environment variables in `.env.local` and `.env.example`.

**Acceptance Criteria:**
- [ ] Supabase project created on supabase.com
- [ ] `lib/supabase/client.ts` uses `createBrowserClient` (anon key)
- [ ] `lib/supabase/server.ts` uses `createServerClient` (service role key)
- [ ] `.env.local` contains all required vars from TAD env section
- [ ] `.env.example` committed to git with placeholder values (no real secrets)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is marked server-only — never in `NEXT_PUBLIC_`

**Testing Checklist:**
- [ ] `supabase status` shows connected project
- [ ] Browser client can reach Supabase (simple health check log in console)
- [ ] Server client import does NOT appear in any `"use client"` file

---

#### S-03 · Set Up Middleware & Route Protection
**Depends on:** S-02  
**Estimate:** 2h

**Description:**  
Implement `middleware.ts` using Supabase SSR to validate session on every request. Protect all routes except `/auth/*`. Implement onboarding guard: if `profiles.onboarding_completed = false`, redirect to `/onboarding/profile`.

**Acceptance Criteria:**
- [ ] Unauthenticated visit to `/` redirects to `/auth/login`
- [ ] Unauthenticated visit to `/dashboard` redirects to `/auth/login`
- [ ] Authenticated user with `onboarding_completed = false` redirects to `/onboarding/profile`
- [ ] `/auth/login` and `/auth/signup` are publicly accessible
- [ ] Middleware does NOT run on `/_next/static/*` or `/favicon.ico`

**Testing Checklist:**
- [ ] Open incognito → visit `/` → land on `/auth/login`
- [ ] Sign in → onboarding incomplete → land on `/onboarding/profile`
- [ ] Sign in → onboarding complete → land on `/`

---

#### S-04 · Install Core Dependencies & Configure Zod + React Hook Form
**Depends on:** S-01  
**Estimate:** 1h

**Description:**  
Install: `zod`, `react-hook-form`, `@hookform/resolvers`, `recharts`, `zustand`, `date-fns`. Configure shared Zod base schemas in `lib/types.ts`.

**Acceptance Criteria:**
- [ ] All packages install without peer dependency conflicts
- [ ] `lib/types.ts` contains TypeScript types mirroring all DB tables from TAD
- [ ] Zod schemas defined for: `ProfileSchema`, `PlaybookSetupSchema`, `TradeJournalSchema`, `IntentRequestSchema`

**Testing Checklist:**
- [ ] `npm run build` still passes after installs
- [ ] Import of `z` from `zod` works in a test component

---

#### S-05 · Set Up GitHub Repository & Branch Strategy
**Depends on:** S-01  
**Estimate:** 1h

**Description:**  
Initialize git repository. Set up branch protection on `main`. Create `develop` branch. Define commit message convention. Add `.gitignore` for `.env.local` and Supabase local files.

**Acceptance Criteria:**
- [ ] GitHub repo created (private)
- [ ] `main` branch requires PR review (can be self-review for solo)
- [ ] `.gitignore` blocks `.env.local`, `.supabase/`, `node_modules/`
- [ ] Initial commit pushed with working scaffold

**Testing Checklist:**
- [ ] Clone fresh → `npm install` → `npm run dev` works
- [ ] `.env.local` NOT committed (confirmed via `git log --all`)

---

### 2. Database

---

#### D-01 · Create Core Schema — `profiles` + Auth Trigger
**Depends on:** S-02  
**Estimate:** 2h

**Description:**  
Write Supabase migration for `profiles` table. Implement `handle_new_user()` trigger to auto-create profile on auth.users insert. Enable RLS. Write the two profile RLS policies (SELECT + UPDATE).

**Acceptance Criteria:**
- [ ] `profiles` table matches TAD schema exactly (all columns, types, defaults)
- [ ] `handle_new_user` trigger fires on `auth.users` INSERT
- [ ] RLS enabled on `profiles`
- [ ] `Users view own profile` policy: `SELECT USING (auth.uid() = id)`
- [ ] `Users update own profile` policy: `UPDATE USING (auth.uid() = id)`
- [ ] Migration file saved as `supabase/migrations/001_profiles.sql`

**Testing Checklist:**
- [ ] Register new user → `profiles` row auto-created
- [ ] Signed-in user can SELECT own profile
- [ ] Signed-in user CANNOT SELECT another user's profile (test with service role to insert second user, then switch to anon key)

---

#### D-02 · Create `playbook_setups` Table + RLS
**Depends on:** D-01  
**Estimate:** 1.5h

**Description:**  
Write migration for `playbook_setups`. Add RLS policy. Add index on `(user_id)`. Add `archived_at` soft-delete column.

**Acceptance Criteria:**
- [ ] Table matches TAD schema (id, user_id, name, entry_conditions, timeframe, min_rr_ratio, filters, notes, total_trades, winning_trades, is_active, archived_at)
- [ ] `FOR ALL` RLS policy: `USING (auth.uid() = user_id)`
- [ ] `saved as `002_playbook_setups.sql`

**Testing Checklist:**
- [ ] INSERT a setup as User A → User B CANNOT SELECT it
- [ ] Soft delete: set `archived_at = NOW()` → row still exists in DB
- [ ] `is_active = false` does NOT physically delete

---

#### D-03 · Create `daily_sessions` Table + RLS
**Depends on:** D-01  
**Estimate:** 2h

**Description:**  
Write migration for `daily_sessions`. Include all check-in columns, contract columns, trade aggregate columns, and the Event-Sourced score READ MODEL columns (`score_total`, `score_algorithm_version`, `score_derived_at` — NOT `score_calculated_at`). Add UNIQUE constraint on `(user_id, session_date)`. Add primary index.

**Acceptance Criteria:**
- [ ] All score columns present: `score_total`, `score_checkin_pillar`, `score_journal_pillar`, `score_playbook_pillar`, `score_no_revenge_pillar`, `score_evening_pillar`, `score_algorithm_version`, `score_derived_at`
- [ ] UNIQUE constraint on `(user_id, session_date)` enforced
- [ ] `FOR ALL` RLS policy on `daily_sessions`
- [ ] `idx_daily_sessions_user_date` index created
- [ ] `idx_daily_sessions_pending_checkin` partial index created
- [ ] Saved as `003_daily_sessions.sql`

**Testing Checklist:**
- [ ] INSERT two rows with same (user_id, session_date) → second INSERT fails with constraint error
- [ ] User A cannot SELECT User B's sessions

---

#### D-04 · Create `trade_intents` + `trade_journal` Tables + Immutability Trigger
**Depends on:** D-03  
**Estimate:** 3h

**Description:**  
Write migrations for both tables. Implement `prevent_journal_update()` trigger on `trade_journal` that raises exception if `locked_at IS NOT NULL`. Add RLS for both tables (journal: SELECT + INSERT + conditional UPDATE). Add `idx_trade_journal_user_setup` index.

**Acceptance Criteria:**
- [ ] `trade_intents` schema matches TAD (no `updated_at` — append-only)
- [ ] `trade_journal` schema matches TAD with `locked_at` column
- [ ] `prevent_journal_update` trigger fires BEFORE UPDATE — raises exception if `locked_at IS NOT NULL`
- [ ] `trade_journal` RLS: SELECT (own), INSERT (own), UPDATE only if `locked_at IS NULL`
- [ ] `trade_intents` RLS: `FOR ALL` own data
- [ ] Saved as `004_trades.sql`

**Testing Checklist:**
- [ ] INSERT journal entry → UPDATE succeeds
- [ ] Set `locked_at = NOW()` → attempt UPDATE → exception raised
- [ ] User A cannot SELECT User B's journal entries
- [ ] `pnl_inr` auto-calculated check: entry=100, exit=105, qty=10 → pnl=50 (verify formula in app, NOT DB)

---

#### D-05 · Create `behavioral_events` Table + Event Type Documentation
**Depends on:** D-03  
**Estimate:** 2h

**Description:**  
Write migration for `behavioral_events` (append-only). No UPDATE or DELETE policies — service role only for writes. Add two indexes from TAD: `idx_behavioral_events_user_session_type` and `idx_behavioral_events_user_time`. Add inline SQL comments documenting every event type per TAD's Event Type Registry.

**Acceptance Criteria:**
- [ ] Table matches TAD schema (id, user_id, session_id, event_type, metadata JSONB, occurred_at)
- [ ] NO `updated_at` column
- [ ] RLS: SELECT policy `(auth.uid() = user_id)` only — no client INSERT/UPDATE/DELETE policy
- [ ] Both indexes created
- [ ] All event types from TAD registry documented as SQL comments in migration file
- [ ] Saved as `005_behavioral_events.sql`

**Testing Checklist:**
- [ ] Client (anon key) CANNOT INSERT to `behavioral_events` — permission denied
- [ ] Service role key CAN INSERT to `behavioral_events`
- [ ] Client CAN SELECT own events
- [ ] Query by `(user_id, session_id, event_type)` uses index (EXPLAIN ANALYZE shows index scan)

---

#### D-06 · Create `push_subscriptions` Table + Seed Script
**Depends on:** D-01  
**Estimate:** 1.5h

**Description:**  
Write migration for `push_subscriptions`. Add RLS. Write a seed script that creates 1 test user with a complete profile for local development use.

**Acceptance Criteria:**
- [ ] Table matches TAD schema (endpoint, p256dh_key, auth_key, is_active)
- [ ] `endpoint` has UNIQUE constraint
- [ ] `FOR ALL` RLS policy
- [ ] Seed script creates: 1 profile with `onboarding_completed = true`, 2 playbook setups, 1 daily session for today
- [ ] Saved as `006_push_subscriptions.sql` + `supabase/seed.sql`

**Testing Checklist:**
- [ ] `supabase db reset` runs migrations + seed without errors
- [ ] Seed user can sign in and see dashboard
- [ ] Duplicate endpoint INSERT fails

---

### 3. Auth

---

#### A-01 · Build Login Page (`/auth/login`)
**Depends on:** S-03, D-01  
**Estimate:** 2h

**Description:**  
Build login page with email/password form and "Continue with Google" OAuth button. Use `Supabase.auth.signInWithPassword()` and `signInWithOAuth({ provider: 'google' })`. Dark theme, branded with TradingOS identity.

**Acceptance Criteria:**
- [ ] Email + password fields with Zod validation (email format, password min 8 chars)
- [ ] "Continue with Google" button triggers OAuth flow
- [ ] Error states displayed inline (invalid credentials, unconfirmed email)
- [ ] Successful login redirects to `/` (middleware handles onboarding redirect)
- [ ] "Don't have an account? Sign up" link to `/auth/signup`
- [ ] Page is NOT accessible when already signed in (middleware redirects to `/`)

**Testing Checklist:**
- [ ] Valid credentials → redirect to dashboard
- [ ] Invalid password → error message displayed, no redirect
- [ ] Google OAuth → redirects to `/auth/callback` → then to dashboard
- [ ] Already signed in → visit `/auth/login` → redirect to `/`

---

#### A-02 · Build Signup Page + Email Confirmation (`/auth/signup`)
**Depends on:** A-01  
**Estimate:** 2h

**Description:**  
Build signup page. On submit: `supabase.auth.signUp()`. Show "Check your email" confirmation screen. Handle the email callback route `/auth/callback` that exchanges code for session and redirects to `/onboarding/profile`.

**Acceptance Criteria:**
- [ ] Fields: Full Name, Email, Password, Confirm Password
- [ ] Password match validation client-side
- [ ] Successful signup → "Check your email" screen (not auto-logged in)
- [ ] `/auth/callback` route handles `?code=` param, exchanges for session
- [ ] Post-confirmation redirect → `/onboarding/profile`
- [ ] `profiles` row exists after confirmation (trigger fired)

**Testing Checklist:**
- [ ] Complete signup → confirmation email received
- [ ] Click confirmation link → redirected to `/onboarding/profile`
- [ ] Signing up with existing email → error displayed
- [ ] Password < 8 chars → inline error, no submit

---

#### A-03 · Build Onboarding Flow (`/onboarding/profile` + `/onboarding/playbook`)
**Depends on:** A-02, D-02  
**Estimate:** 4h

**Description:**  
Two-step onboarding: Step 1 captures trading profile (capital, market type, trading style, risk per trade, daily loss limit, max trades). Step 2 creates the first playbook setup. Progress indicator shown. On completion, set `profiles.onboarding_completed = true` and redirect to `/`.

**Acceptance Criteria:**
- [ ] Step 1 form: capital_base, market_type (select), trading_style (select), default_risk_per_trade, default_daily_loss_limit, default_max_trades
- [ ] Step 2 form: setup name, entry_conditions (textarea), timeframe (select), min_rr_ratio — saves as first `playbook_setups` row
- [ ] Progress indicator: "Step 1 of 2" / "Step 2 of 2"
- [ ] On Step 2 complete: UPDATE `profiles.onboarding_completed = true`
- [ ] Redirect to `/` after completion
- [ ] Cannot skip Step 1 to access Step 2 directly
- [ ] Cannot access `/` until `onboarding_completed = true`

**Testing Checklist:**
- [ ] Complete both steps → land on dashboard
- [ ] Refresh mid-onboarding → resume at current step
- [ ] Direct URL to `/onboarding/playbook` without completing Step 1 → redirect back to Step 1
- [ ] All fields validated before advancing

---

#### A-04 · Settings Page — Profile Update + Logout
**Depends on:** A-03  
**Estimate:** 2h

**Description:**  
Settings page at `/settings` with two sections: (1) Update risk profile (same fields as onboarding Step 1), (2) Sign out button. Include navigation back to dashboard.

**Acceptance Criteria:**
- [ ] Pre-populated with current profile values
- [ ] Successful update shows toast confirmation
- [ ] `capital_base`, `default_risk_per_trade`, `default_daily_loss_limit`, `default_max_trades` are editable
- [ ] Sign out calls `supabase.auth.signOut()` → redirect to `/auth/login`

**Testing Checklist:**
- [ ] Change risk per trade → save → refresh → value persisted
- [ ] Sign out → session cleared → visit `/` → redirect to login
- [ ] Validation: daily loss limit must be > risk per trade

---

### 4. Playbooks

---

#### PB-01 · Playbook List Page (`/playbook`)
**Depends on:** A-03, D-02  
**Estimate:** 2h

**Description:**  
Display all active playbook setups for the logged-in user. Show: setup name, timeframe, min R:R, win rate (derived: `winning_trades / total_trades * 100`), total trades. "Add Setup" button. "Archive" button per setup (soft delete).

**Acceptance Criteria:**
- [ ] Fetches from `playbook_setups WHERE is_active = true AND archived_at IS NULL`
- [ ] Win rate displayed as percentage with "Low data" badge if `total_trades < 10`
- [ ] Empty state shown if no setups exist (with CTA to add first setup)
- [ ] Archive button → sets `archived_at = NOW(), is_active = false` → setup disappears from list
- [ ] Maximum 10 setups enforced (hide "Add Setup" if count = 10)

**Testing Checklist:**
- [ ] Create 2 setups → both appear in list
- [ ] Archive 1 → only 1 remains
- [ ] Win rate = 3/10 trades winning → shows 30%
- [ ] `total_trades < 10` → "Low data" badge visible

---

#### PB-02 · Create Playbook Setup Form
**Depends on:** PB-01  
**Estimate:** 2h

**Description:**  
Modal or dedicated page form to create a new playbook setup. Fields: name, entry_conditions (textarea), timeframe (select: 1min/5min/15min/1hr/daily), min_rr_ratio (number input, default 1.5). On save, INSERT to `playbook_setups`.

**Acceptance Criteria:**
- [ ] All fields validated with Zod before submit
- [ ] `name` is required, max 50 chars
- [ ] `entry_conditions` required, max 500 chars
- [ ] `timeframe` required (one of valid enum values)
- [ ] `min_rr_ratio` required, min 1.0, max 10.0
- [ ] On success: setup appears in list without page refresh
- [ ] `total_trades` and `winning_trades` default to 0 on create

**Testing Checklist:**
- [ ] Submit empty form → validation errors on all required fields
- [ ] Valid submission → setup appears in list immediately
- [ ] Create 10 setups → "Add Setup" button disappears

---

#### PB-03 · Edit Playbook Setup
**Depends on:** PB-02  
**Estimate:** 1.5h

**Description:**  
Allow editing of existing setup (name, entry_conditions, timeframe, min_rr_ratio). Same validation as create. NOTE: editing does NOT reset trade stats — stats are historical. Setup UUID is immutable.

**Acceptance Criteria:**
- [ ] Edit form pre-populated with current values
- [ ] UUID unchanged after edit (verified in DB)
- [ ] `total_trades` and `winning_trades` unchanged after edit
- [ ] `updated_at` timestamp updates on save
- [ ] Success toast shown

**Testing Checklist:**
- [ ] Edit name → old name no longer appears
- [ ] Edit timeframe → new value saved
- [ ] Confirm UUID unchanged before and after edit (inspect DB)

---

#### PB-04 · Update Setup Stats Trigger (After Trade Logged)
**Depends on:** PB-03, D-04  
**Estimate:** 2h

**Description:**  
Write a database function + trigger OR application-layer logic: after INSERT on `trade_journal`, if `setup_id IS NOT NULL`, increment `playbook_setups.total_trades` and conditionally increment `winning_trades` if `pnl_inr > 0`. This is called from the Journal submit handler.

**Decision:** Implement as **application-layer** (in the trade journal API handler), not a DB trigger — easier to debug and test.

**Acceptance Criteria:**
- [ ] After journal INSERT: `total_trades++` on linked setup
- [ ] If `pnl_inr > 0`: `winning_trades++` on linked setup
- [ ] If journal entry has no `setup_id`: no update to any setup
- [ ] Race condition safe: use Supabase `.update().eq()` with RLS (not raw SQL)

**Testing Checklist:**
- [ ] Log 3 trades (2 winners, 1 loser) on Setup A → `total_trades = 3`, `winning_trades = 2`
- [ ] Log 1 trade with no setup → Setup A stats unchanged
- [ ] Win rate on PB-01 list updates after trade logged

---

## Sprint 2 — Discipline Loop Part 1 (Days 8–14)

### 5. Morning Check-in

---

#### MC-01 · Morning Check-in Page (`/checkin`) — Form
**Depends on:** D-03, A-03  
**Estimate:** 3h

**Description:**  
Build the 5-slider check-in form (Sleep Quality, Stress Level, Energy, Focus, Motivation). Each slider: 1–10 scale with visual label. Compute Readiness Score on submit: `(sleep*0.25 + (10-stress)*0.10 + energy*0.25 + focus*0.20 + motivation*0.20) * 10`. INSERT to `daily_sessions` (create or update checkin fields). Log `behavioral_events` event `checkin_completed`.

**Note:** Stress is inverted in score calculation — high stress = low readiness.

**Acceptance Criteria:**
- [ ] 5 sliders, each 1–10 with current value label displayed
- [ ] Readiness Score computed: weighted average normalized to 0–100
- [ ] Score displayed with color: ≥70 Green, 40–69 Yellow, <40 Red
- [ ] Contextual message displayed per band (from PRD AC)
- [ ] INSERT or UPSERT to `daily_sessions` with check-in data + `checkin_completed_at = NOW()`
- [ ] `behavioral_events` INSERT: `event_type = 'checkin_completed'`, metadata includes `readiness_score` and `completed_at_ist`
- [ ] Check-in form LOCKED after 11:00 AM IST (form disabled, message shown)
- [ ] Cannot submit if today's check-in already completed (show result instead)

**Testing Checklist:**
- [ ] All 5 sliders at 10 → score = 100, Green
- [ ] Stress=10, all others at 1 → score close to 0, Red
- [ ] Submit → `daily_sessions` row updated with checkin data
- [ ] Refresh after submit → result shown, not form
- [ ] After 11:00 AM IST → form shows "Check-in window closed" message

---

#### MC-02 · Readiness Score Result Display Component
**Depends on:** MC-01  
**Estimate:** 2h

**Description:**  
Build `ReadinessResult` component: circular gauge showing score (0–100), color-coded band, status label (Green/Yellow/Red), contextual message, and a CTA button "Sign Today's Contract →" that links to `/contract`. Component is shown after check-in completion AND as default view if check-in is already done today.

**Acceptance Criteria:**
- [ ] Circular gauge renders score visually (SVG arc or CSS conic-gradient)
- [ ] Three color states: Green (#22c55e), Yellow (#f59e0b), Red (#ef4444)
- [ ] Messages exactly per PRD: "Good to trade. Stay disciplined." / "Proceed with caution. Consider reducing size." / "High risk of emotional trading today. Consider sitting out."
- [ ] CTA button visible: "Sign Today's Contract →"
- [ ] If contract already signed today: CTA changes to "View Dashboard →"

**Testing Checklist:**
- [ ] Score 85 → green gauge, correct message
- [ ] Score 55 → yellow gauge, correct message
- [ ] Score 25 → red gauge, correct message
- [ ] CTA navigates correctly

---

#### MC-03 · Check-in Status in Nav/Header
**Depends on:** MC-02  
**Estimate:** 1h

**Description:**  
Add a persistent status indicator in the app navigation: small colored dot showing today's check-in status. Green if completed, Yellow if not yet done and before 11 AM, Red if not done and after 9 AM.

**Acceptance Criteria:**
- [ ] Status dot visible in navigation on every page
- [ ] Dot is green if `checkin_completed_at IS NOT NULL` for today
- [ ] Dot is yellow if before 9:00 AM IST and not done
- [ ] Dot is red if after 9:00 AM IST and not done
- [ ] Clicking dot navigates to `/checkin`

**Testing Checklist:**
- [ ] Complete check-in → dot turns green on same-page update
- [ ] New day (past midnight IST) → dot resets to yellow

---

### 6. Commitment Contract

---

#### CC-01 · Commitment Contract Page (`/contract`) — Form
**Depends on:** MC-01, D-03, PB-01  
**Estimate:** 3h

**Description:**  
Build the daily commitment contract form. Fields: Max trades today (number, pre-filled from `profiles.default_max_trades`), Max daily loss (₹, pre-filled from `profiles.default_daily_loss_limit`), Allowed setups (multi-select checkboxes from active playbook setups), Forbidden conditions (free text). On sign: UPDATE `daily_sessions.contract_*` fields + `contract_signed_at`. Log `behavioral_events` event `contract_signed`.

**Acceptance Criteria:**
- [ ] Form only accessible after check-in complete (redirect to `/checkin` otherwise)
- [ ] Pre-filled with user's default risk parameters from profile
- [ ] Multi-select for allowed setups shows all active playbook setups
- [ ] At least 1 setup must be selected (validation)
- [ ] On submit: UPDATE `daily_sessions` with contract data
- [ ] `behavioral_events` INSERT: `contract_signed` with metadata `{max_trades, max_loss, setup_ids[]}`
- [ ] After signing: contract is LOCKED for the day (cannot re-sign, shown as read-only)

**Testing Checklist:**
- [ ] Visit `/contract` without check-in → redirect to `/checkin`
- [ ] Pre-filled values match profile defaults
- [ ] Select 0 setups → validation error
- [ ] Sign contract → `contract_signed_at` populated in DB
- [ ] Refresh after signing → read-only view shown
- [ ] Lock: attempt to navigate back and re-submit → blocked

---

#### CC-02 · Contract Summary (Read-Only View)
**Depends on:** CC-01  
**Estimate:** 1.5h

**Description:**  
After contract is signed, display a read-only summary card: Max Trades, Max Loss, Allowed Setups (listed by name), Forbidden Conditions. Show a "Contract locked at HH:MM IST" timestamp. Include "Open Trade Intent Engine →" CTA.

**Acceptance Criteria:**
- [ ] All contract fields displayed in human-readable format
- [ ] Lock timestamp shown in IST
- [ ] Allowed setup names resolved (not just UUIDs)
- [ ] "Open Trade Intent Engine →" CTA links to `/intent`
- [ ] If contract not yet signed for today: show form (CC-01), not summary

**Testing Checklist:**
- [ ] Sign contract → summary shows correct values
- [ ] Allowed setup UUIDs correctly resolved to names
- [ ] New day (past midnight IST) → form shown again (not yesterday's summary)

---

#### CC-03 · Contract Guard for Trade Intent Engine
**Depends on:** CC-01  
**Estimate:** 1h

**Description:**  
Application-layer check: the `/api/intent/validate` endpoint must verify `contract_signed_at IS NOT NULL` for today's session before processing any validation. Return `NO_GO` with reason "Sign your Commitment Contract first" if unsigned.

**Acceptance Criteria:**
- [ ] API returns `{ result: 'no_go', reasons: ['Sign your Commitment Contract first'] }` if contract unsigned
- [ ] Frontend `/intent` page shows "Sign your Contract first" banner if no contract for today
- [ ] Banner links to `/contract`

**Testing Checklist:**
- [ ] Call `/api/intent/validate` without signed contract → `no_go` response
- [ ] Sign contract → same call succeeds validation

---

### 7. Notifications (Core Setup — Full feature in Sprint 3)

---

#### N-01 · Notification Abstraction Layer — Base Structure
**Depends on:** S-01  
**Estimate:** 3h

**Description:**  
Implement the Channel Abstraction Layer per TAD v1.1. Create: `lib/notifications/types.ts` (interfaces), `lib/notifications/dispatcher.ts` (dispatch logic with fallback chain), `lib/notifications/channels/email.ts` (Resend implementation), `lib/notifications/channels/push.ts` (Web Push VAPID skeleton). Do NOT wire to cron yet.

**Acceptance Criteria:**
- [ ] `NotificationChannel` interface defined in `types.ts`
- [ ] `NotificationPayload` type defined (type, title, body, deeplink, urgency)
- [ ] `dispatcher.ts` implements fallback chain: Push → Email → (WhatsApp/Telegram stubs for Phase 2)
- [ ] `EmailChannel` wraps Resend API (`POST /emails`)
- [ ] `PushChannel` wraps `web-push` npm library
- [ ] Both channels implement `isAvailable()` and `send()` methods
- [ ] Failed delivery is caught and logged (not thrown — fallback continues)
- [ ] `behavioral_events` INSERT after successful delivery: `notification_sent`

**Testing Checklist:**
- [ ] Send test email via `EmailChannel.send()` → email arrives in inbox
- [ ] `PushChannel.send()` with invalid subscription → returns `{ success: false }` without crashing
- [ ] Dispatcher with only email available → uses EmailChannel directly

---

#### N-02 · Web Push Subscription Registration
**Depends on:** N-01, A-03  
**Estimate:** 2h

**Description:**  
Build the Push Notification registration flow on the Settings page. Browser permission prompt → get PushSubscription object → POST to `/api/notifications/subscribe` → store in `push_subscriptions` table. Show enable/disable toggle in settings.

**Acceptance Criteria:**
- [ ] VAPID keys generated and configured in env vars
- [ ] `/api/notifications/subscribe` endpoint: validates JWT, INSERTs to `push_subscriptions`
- [ ] Settings page shows "Enable Push Notifications" button
- [ ] After granting permission: button changes to "Notifications Enabled ✓"
- [ ] 410 Gone from push service → UPDATE `push_subscriptions.is_active = false`
- [ ] User can re-register (new subscription replaces old for same endpoint)

**Testing Checklist:**
- [ ] Click Enable → browser permission prompt appears
- [ ] Grant permission → subscription row in `push_subscriptions`
- [ ] Send test push → notification appears in browser/OS notification center
- [ ] Deny permission → button stays in "Enable" state

---

## Sprint 3 — Discipline Loop Part 2 (Days 15–21)

### 8. Trade Intent Engine

---

#### TI-01 · Intent Engine API Route (`/api/intent/validate`)
**Depends on:** CC-03, D-04, D-05  
**Estimate:** 4h

**Description:**  
Core server-side validation endpoint. Implements the full algorithm from TAD: load session, check contract signed, check trade count, check loss budget, check playbook adherence, fetch setup win rate, determine result (GO/CAUTION/NO_GO), INSERT to `trade_intents`, INSERT to `behavioral_events`, return response.

**Acceptance Criteria:**
- [ ] Auth check: JWT validated before processing
- [ ] Pro tier check: return `403 PRO_REQUIRED` if `profiles.tier = 'free'`
- [ ] Validation steps in exact order from TAD algorithm
- [ ] `remaining_budget = contract.max_loss_inr + session.realized_pnl_inr` (pnl is negative for losses)
- [ ] Win rate: `winning_trades / NULLIF(total_trades, 0) * 100` → `null` if total_trades = 0
- [ ] `low_data_warning = true` if `total_trades < 10`
- [ ] All 4 validation outcomes covered: NO_GO (count), NO_GO (budget), CAUTION (setup), GO
- [ ] `trade_intents` INSERT: all fields including `win_rate_at_time` snapshot
- [ ] `behavioral_events` INSERT: `intent_submitted` with metadata
- [ ] Response matches TAD `IntentResponse` type exactly

**Testing Checklist:**
- [ ] No contract signed → `{ result: 'no_go', reasons: ['Sign your Commitment Contract first'] }`
- [ ] Trades at limit (3/3) → `{ result: 'no_go', reasons: ['Daily trade limit reached (3/3)'] }`
- [ ] Risk exceeds remaining budget → `{ result: 'no_go' }` with budget message
- [ ] Setup not in contract list → `{ result: 'caution' }` with playbook message
- [ ] All clear → `{ result: 'go', win_rate: X, low_data_warning: true/false }`
- [ ] `trade_intents` row created for every call
- [ ] Free tier user → 403 response

---

#### TI-02 · Intent Engine UI — Form (`/intent`)
**Depends on:** TI-01, PB-01  
**Estimate:** 3h

**Description:**  
Build the Trade Intent Engine page. Form: Setup selection (tactile cards showing only today's allowed setups from contract), Risk Amount (₹), R:R Ratio. On submit → POST to `/api/intent/validate` → display result card.

**Acceptance Criteria:**
- [ ] Setup selection uses tactile cards showing ONLY setups in today's signed contract (not all setups)
- [ ] If no contract signed: full-page banner "Sign your Contract first" with link
- [ ] Risk amount: positive number, max = remaining daily loss budget (hint shown)
- [ ] R:R ratio: positive number, min 1.0
- [ ] Form submits → loading state → result rendered
- [ ] `intent_id` stored in component state for override tracking

**Testing Checklist:**
- [ ] Contract with 2 of 3 setups allowed → tactile cards show 2 only
- [ ] Submit valid intent → API called → result shown
- [ ] Submit while daily limit reached → NO_GO shown without API call being needed (API validates anyway)

---

#### TI-03 · Intent Engine Result Display Component
**Depends on:** TI-02  
**Estimate:** 2h

**Description:**  
Build `ValidationResult` component showing GO/CAUTION/NO_GO card. Design: GO = green card with checkmark + win rate + context message. CAUTION = amber card with warning. NO_GO = red card with X + reason. For NO_GO: "Proceed Anyway" button with friction (requires typing reason).

**Acceptance Criteria:**
- [ ] GO card: green background, "GO ✓", setup win rate displayed, "Low data warning" if applicable, trades remaining, budget remaining
- [ ] CAUTION card: amber, warning icon, reason listed, "Proceed Anyway" secondary button
- [ ] NO_GO card: red, X icon, reason listed, "Proceed Anyway" button (secondary, small)
- [ ] HYBRID MODEL: If FOMO, Revenge, or Random selected -> trigger 60-second psychological braking screen -> require acknowledgement -> then allow "Proceed Anyway".
- [ ] "Proceed Anyway" requires user to type a reason in text input (min 10 chars)
- [ ] Submit "Proceed Anyway" → PATCH to `/api/intent/[intent_id]/override`
- [ ] After any result: "Log This Trade →" CTA pre-fills the Journal with `intent_id` and setup

**Testing Checklist:**
- [ ] GO result → green card, win rate shown
- [ ] NO_GO result → red card, reason shown
- [ ] "Proceed Anyway" without typing reason → button disabled
- [ ] "Proceed Anyway" with reason → PATCH called → `user_proceeded = true` in DB

---

#### TI-04 · Override API Route (`/api/intent/[intent_id]/override`)
**Depends on:** TI-03, TI-01  
**Estimate:** 1h

**Description:**  
PATCH endpoint to record that user proceeded despite NO_GO. Updates `trade_intents.user_proceeded = true` and `override_reason`. Logs `behavioral_events` `intent_override` event.

**Acceptance Criteria:**
- [ ] Auth check: only the intent's owner can update
- [ ] PATCH body: `{ reason: string }` (min 10 chars, Zod validated)
- [ ] UPDATE `trade_intents` row: `user_proceeded = true, override_reason = reason`
- [ ] INSERT `behavioral_events`: `intent_override`, metadata `{ original_result, reason }`
- [ ] Returns `204 No Content`
- [ ] Cannot update an intent from a different day or different user

**Testing Checklist:**
- [ ] Override call → DB row updated
- [ ] `behavioral_events` row inserted
- [ ] Call with different user's intent_id → 403 or 404

---

#### TI-05 · Intent Engine History (Today's Intents)
**Depends on:** TI-03  
**Estimate:** 2h

**Description:**  
Below the Intent Engine form, display a table of today's submitted intents (from `trade_intents` for today's session). Columns: Time (IST), Setup, Result, Win Rate at Time, Overridden (Y/N).

**Acceptance Criteria:**
- [ ] Shows all `trade_intents` for today's `session_id`
- [ ] Time displayed in IST (converted from UTC)
- [ ] Result displayed with color-coded badge (GO/CAUTION/NO_GO)
- [ ] "Overridden" column shows ✓ if `user_proceeded = true`
- [ ] Empty state: "No trades validated today"

**Testing Checklist:**
- [ ] Submit 3 intents → all 3 appear in table
- [ ] One override → "Overridden" shows ✓ for that row
- [ ] Table is read-only (no edit/delete)

---

### 9. Journal

---

#### J-01 · New Trade Journal Entry Form (`/journal/new`)
**Depends on:** TI-03, D-04, PB-04  
**Estimate:** 3h

**Description:**  
Build trade logging form. Fields: Instrument (text), Entry Price, Exit Price, Quantity (all numeric), Setup Used (tactile card from active setups), Psychology Tag (tactile cards: Focus/Confident/FOMO/Fear/Greed/Revenge/Restlessness), Rule Followed (toggle), Deviation Note (text, shown if Rule Followed = false), Notes (optional). Auto-calculates P&L. If navigated from Intent Engine, pre-fills `setup_id` and `intent_id`.

**Acceptance Criteria:**
- [ ] P&L auto-calculated: `(exit_price - entry_price) * quantity` shown live as user types
- [ ] P&L stored in `pnl_inr` column on submit
- [ ] If `rule_followed = false`: deviation_note is required
- [ ] `intent_id` pre-filled if navigated from Intent Engine "Log This Trade →"
- [ ] INSERT to `trade_journal` on submit
- [ ] UPDATE `daily_sessions.trades_taken++` and `realized_pnl_inr += pnl_inr`
- [ ] UPDATE `playbook_setups` stats (PB-04 logic)
- [ ] INSERT `behavioral_events`: `trade_logged` with metadata
- [ ] Show success toast with P&L after submit

**Testing Checklist:**
- [ ] Entry=100, Exit=105, Qty=100 → P&L shows ₹500 live
- [ ] Submit → trade appears in today's list
- [ ] `daily_sessions.trades_taken` incremented
- [ ] `daily_sessions.realized_pnl_inr` updated correctly (negative for losses)
- [ ] Rule not followed without deviation note → validation error

---

#### J-02 · Today's Journal List (`/journal/[date]`)
**Depends on:** J-01  
**Estimate:** 2h

**Description:**  
Page showing all trades for a given date. Default route for today. Columns: Time, Instrument, Setup, P&L (colored red/green), Psychology Tag (colored badge), Rule Followed. Edit available if entry `locked_at IS NULL`. Shows daily P&L summary at top.

**Acceptance Criteria:**
- [ ] Lists all `trade_journal` rows for the session date
- [ ] P&L column: green if positive, red if negative
- [ ] Psychology tag shown as colored badge
- [ ] Edit button visible only if `locked_at IS NULL` (within 24h)
- [ ] Daily P&L total shown: sum of all trades
- [ ] Empty state: "No trades logged today"
- [ ] Date navigation: Previous/Next day buttons

**Testing Checklist:**
- [ ] 3 trades (2 wins, 1 loss) → correct P&L colors + total
- [ ] Entry older than 24h → Edit button hidden
- [ ] Navigate to previous day → shows that day's trades

---

#### J-03 · Edit Trade Journal Entry
**Depends on:** J-02  
**Estimate:** 2h

**Description:**  
Edit form for unlocked journal entries (`locked_at IS NULL`). Same fields as J-01 but pre-populated. On save: UPDATE `trade_journal`, recalculate daily session P&L aggregate. DB-level trigger blocks UPDATE if `locked_at IS NOT NULL`.

**Acceptance Criteria:**
- [ ] Edit only available if `locked_at IS NULL`
- [ ] If user attempts to edit locked entry → show error "Entry is locked (>24h)"
- [ ] Successful edit → updated values shown in list
- [ ] P&L change → `daily_sessions.realized_pnl_inr` recalculated
- [ ] Playbook stats NOT recalculated on edit (stats are append-only — acceptable tradeoff at MVP)

**Testing Checklist:**
- [ ] Edit within 24h → success
- [ ] Edit after `locked_at` set → DB raises exception → frontend shows error
- [ ] Change P&L on edit → session total updated

---

#### J-04 · Journal Lock Cron (`/api/cron/lock-journals`)
**Depends on:** J-03  
**Estimate:** 2h

**Description:**  
Vercel Cron job that runs daily at 09:30 AM IST (04:00 UTC). Updates `trade_journal.locked_at = NOW()` for all entries where `logged_at < NOW() - INTERVAL '24 hours'` and `locked_at IS NULL`. This enforces immutability.

**Acceptance Criteria:**
- [ ] Cron endpoint: `GET /api/cron/lock-journals`
- [ ] CRON_SECRET auth check
- [ ] UPDATE all eligible rows (uses service role key)
- [ ] Vercel cron schedule: `"0 4 * * *"` (4:00 AM UTC = 9:30 AM IST)
- [ ] Returns count of rows locked
- [ ] INSERT `behavioral_events` NOT required for this (operational, not behavioral)

**Testing Checklist:**
- [ ] Manually call endpoint → entries >24h old get `locked_at` set
- [ ] Entries <24h old → unchanged
- [ ] Already locked entries → unchanged (idempotent)

---

## Sprint 4 — Intelligence & Delivery (Days 22–30)

### 10. Discipline Score

---

#### DS-01 · Score Derivation Engine (`lib/score-engine.ts`)
**Depends on:** D-05, J-01, MC-01, CC-01  
**Estimate:** 4h

**Description:**  
Implement the pure score derivation function per TAD v1.1 Event Sourcing algorithm. Function signature: `deriveScore(userId: string, sessionDate: string): Promise<ScoreResult>`. Reads only from `behavioral_events`. Writes derived score to `daily_sessions` read-model cache. `CURRENT_ALGORITHM_VERSION = 'v1.0'`.

**Acceptance Criteria:**
- [ ] Function reads ONLY from `behavioral_events` for the given `session_id`
- [ ] Pillar 1: Check-in (0/10/20 based on completion + timing)
- [ ] Pillar 2: Journal (20 if no trades, 20 if all trades logged)
- [ ] Pillar 3: Playbook (30 minus overrides × 10 minus violations × 5, min 0)
- [ ] Pillar 4: Revenge (20 minus revenge events × 10, min 0)
- [ ] Pillar 5: Evening (10 if `evening_activity` event present, else 0)
- [ ] Total: sum of 5 pillars (0–100)
- [ ] UPDATE `daily_sessions`: all `score_*` columns + `score_algorithm_version = 'v1.0'` + `score_derived_at`
- [ ] INSERT `behavioral_events`: `score_derived` operational event
- [ ] Function is pure and testable in isolation (no side effects except DB writes)

**Testing Checklist:**
- [ ] User with all 5 behaviors complete → score = 100
- [ ] User with no behaviors → score = 0
- [ ] 1 override → playbook pillar = 20 (not 30)
- [ ] 2 revenge trades → revenge pillar = 0 (not negative)
- [ ] `score_algorithm_version` = 'v1.0' in DB after derivation
- [ ] Same user, same date, run twice → idempotent (no duplicate events)

---

#### DS-02 · Score Derivation Cron (`/api/cron/score`)
**Depends on:** DS-01  
**Estimate:** 2h

**Description:**  
Vercel Cron endpoint that runs daily at 5:00 PM IST (11:30 UTC), Mon–Fri. Fetches all user IDs with a `daily_sessions` row for today. Calls `deriveScore()` for each. Batches in groups of 50 to stay within 60s Vercel timeout. Returns summary stats.

**Acceptance Criteria:**
- [ ] CRON_SECRET auth check
- [ ] Batch size: 50 users per batch (sequential, not parallel — avoids DB overload)
- [ ] Skips users whose `score_derived_at` is already set for today (idempotent)
- [ ] Returns: `{ processed: N, skipped: N, errors: N, duration_ms: N }`
- [ ] Errors per user are caught and logged — one failure doesn't stop the batch
- [ ] Vercel cron schedule: `"30 11 * * 1-5"` (Mon–Fri only)

**Testing Checklist:**
- [ ] Run manually at end of test day → all users' scores populated
- [ ] Run again → all skipped (idempotent)
- [ ] Simulate one user with bad data → error logged, others processed

---

#### DS-03 · Manual Score Trigger (`/api/score/calculate`)
**Depends on:** DS-01  
**Estimate:** 1h

**Description:**  
POST endpoint for users to manually trigger their own score derivation. Used on the Dashboard. Calls `deriveScore()` for the requesting user and today's date. Returns the score result.

**Acceptance Criteria:**
- [ ] Auth check: user can only trigger own score
- [ ] Calls `deriveScore()` for today's IST date
- [ ] Returns full `ScoreResult` (total + all pillars)
- [ ] If score already derived today: re-derives (recalculates from events)
- [ ] Rate limit: max 5 calls per user per day (prevent abuse)

**Testing Checklist:**
- [ ] Click "Calculate" → score populates on dashboard
- [ ] Call 6 times → rate limit response on 6th call

---

#### DS-04 · Score History Page (`/score`)
**Depends on:** DS-03  
**Estimate:** 2h

**Description:**  
Dedicated score page. Shows: today's score gauge (same component as dashboard), full pillar breakdown (each pillar as a labeled progress bar), and a 30-day score chart (line chart via Recharts).

**Acceptance Criteria:**
- [ ] Today's score: circular gauge (0–100) with color coding
- [ ] Pillar breakdown: 5 bars showing each pillar's contribution (e.g., "Playbook: 23/30")
- [ ] 30-day chart: line chart from `daily_sessions WHERE score_total IS NOT NULL`
- [ ] "Calculate Score" button triggers DS-03 manually
- [ ] If score not yet derived today: placeholder "Score available after 5 PM or click Calculate"
- [ ] Score breakdown auditable: each pillar shows earned/maximum points

**Testing Checklist:**
- [ ] 7 days of data → line chart shows 7 points
- [ ] Pillar breakdown sums to score_total
- [ ] Click Calculate → score populates live (no page refresh)

---

### 11. Notifications (Cron Integration)

---

#### N-03 · Notification Cron Handler (`/api/cron/notify`)
**Depends on:** N-01, N-02, D-05  
**Estimate:** 3h

**Description:**  
Implement the `GET /api/cron/notify?type=[type]` endpoint. For each notification type: query DB to find users who need the notification (condition varies by type). Call `dispatcher.dispatch()` for each eligible user. Log results.

**Acceptance Criteria:**
- [ ] CRON_SECRET auth check
- [ ] Supported types: `morning_checkin`, `market_open_warning`, `journal_reminder`, `journal_warning`, `evening_planning`
- [ ] `morning_checkin`: users WHERE `checkin_completed_at IS NULL` for today AND `notification_prefs.morning_checkin.enabled = true`
- [ ] `journal_reminder`: users WHERE trades_taken > 0 AND journal count < trades_taken AND time is 4PM
- [ ] `journal_warning`: same condition as reminder (re-check at 5PM)
- [ ] `evening_planning`: users WHERE no `evening_activity` event today
- [ ] Calls `dispatcher.dispatch()` per user (dispatches to available channels)
- [ ] Returns: `{ sent: N, failed: N, skipped: N }`

**Testing Checklist:**
- [ ] User with pending check-in → push notification received
- [ ] User who completed check-in → skipped (not notified)
- [ ] Push fails (bad subscription) → email fallback triggers
- [ ] `notification_sent` event logged in `behavioral_events`

---

#### N-04 · Add Cron Jobs to `vercel.json`
**Depends on:** N-03, DS-02, J-04  
**Estimate:** 1h

**Description:**  
Configure all cron jobs in `vercel.json`. 6 cron jobs total (5 notifications + 1 score derivation). Verify UTC schedule matches IST times exactly.

**Acceptance Criteria:**
- [ ] `vercel.json` created at project root with `crons` array
- [ ] All 6 cron entries per TAD: exact paths and schedules
- [ ] Times verified: 25 3 (→ 8:30 AM IST), 55 3 (→ 9:00 AM IST), 25 10 (→ 4:00 PM IST), 25 11 (→ 5:00 PM IST), 30 11 (→ 5:00 PM IST = score), 30 14 (→ 8:00 PM IST)
- [ ] Cron jobs run Mon–Fri only (`1-5` day expression)

**Testing Checklist:**
- [ ] Deploy to Vercel → cron jobs visible in Vercel dashboard
- [ ] Trigger one manually from Vercel UI → handler responds

---

#### N-05 · Notification Preferences UI (Settings Page)
**Depends on:** N-02, A-04  
**Estimate:** 2h

**Description:**  
Add notification preferences section to Settings page. For each of the 5 notification types: a toggle (enable/disable) and a time override input. On change: UPDATE `profiles.notification_prefs` JSONB.

**Acceptance Criteria:**
- [ ] 5 toggle rows: morning_checkin, market_open_warning, journal_reminder, journal_warning, evening_planning
- [ ] Each toggle saves immediately (no "Save" button — debounced auto-save)
- [ ] Time input per notification (default values from profiles JSONB)
- [ ] Time change saves to `notification_prefs` JSONB
- [ ] Cron handler respects `enabled = false` (skips user)

**Testing Checklist:**
- [ ] Toggle off `morning_checkin` → cron no longer sends that notification to user
- [ ] Change time → new time saved in DB
- [ ] Refresh Settings → saved preferences shown

---

### 12. Dashboard

---

#### DH-01 · Dashboard Layout & Today's Summary (`/`)
**Depends on:** MC-02, CC-02, DS-04  
**Estimate:** 3h

**Description:**  
Main dashboard page. Shows 6 key metrics as cards: Today's Readiness Score, Today's Discipline Score, Trades Taken vs. Limit (e.g., 2/3), Remaining Daily Loss Budget (₹), Today's P&L, 7-day Score Chart. Each card links to its detail page.

**Acceptance Criteria:**
- [ ] All 6 metrics fetched in a single server component (1 DB query)
- [ ] Readiness Score: circular gauge or numeric badge, color-coded
- [ ] Discipline Score: numeric with "Not yet calculated" if null
- [ ] Trades Taken: "2 / 3" with progress bar
- [ ] Remaining Budget: "₹1,200 remaining of ₹3,000" (red if <20% remains)
- [ ] Today's P&L: green if positive, red if negative
- [ ] 7-day Score Chart: `Recharts` LineChart, dots on data points
- [ ] "Calculate Score" button → triggers DS-03 → updates score card live

**Testing Checklist:**
- [ ] All 6 cards render with real data
- [ ] Budget turns red when <20% remaining
- [ ] P&L negative → red value
- [ ] 0 trades today → "0 / 3" trades card
- [ ] Score null → placeholder text, not crash

---

#### DH-02 · Daily Loop Navigation Component
**Depends on:** DH-01  
**Estimate:** 2h

**Description:**  
Persistent "Today's Loop" progress indicator shown on dashboard. 5 steps: Morning Check-in → Commitment Contract → [Trading Hours] → Trade Journal → Discipline Score. Each step shows ✓ (complete), → (current), ○ (pending). Clicking a step navigates to that page.

**Acceptance Criteria:**
- [ ] Steps derived from real session data (not hardcoded)
- [ ] Check-in: ✓ if `checkin_completed_at IS NOT NULL`
- [ ] Contract: ✓ if `contract_signed_at IS NOT NULL`
- [ ] Journal: ✓ if `trades_taken = 0` OR all trades have journal entries
- [ ] Score: ✓ if `score_derived_at IS NOT NULL` for today
- [ ] Current step highlighted
- [ ] All steps are clickable links

**Testing Checklist:**
- [ ] Fresh session → Check-in is "current" step
- [ ] Complete check-in → Contract becomes "current"
- [ ] All complete → all show ✓

---

#### DH-03 · Mobile Responsive Layout
**Depends on:** DH-01, all page components  
**Estimate:** 2h

**Description:**  
Audit and fix all pages for mobile responsiveness at 375px minimum width. Priority: Dashboard, Check-in, Intent Engine, Journal form. Use Tailwind responsive prefixes (`sm:`, `md:`). Test on mobile browser simulation.

**Acceptance Criteria:**
- [ ] Dashboard cards stack vertically on 375px
- [ ] Check-in sliders are touch-friendly (large enough tap target)
- [ ] Intent Engine form is single-column on mobile
- [ ] Journal form fields full-width on mobile
- [ ] Navigation collapses to hamburger menu on mobile (<640px)
- [ ] No horizontal scroll on any page at 375px

**Testing Checklist:**
- [ ] Chrome DevTools → 375px device → no horizontal scroll on any page
- [ ] Sliders usable with touch (test on real device or simulator)
- [ ] All buttons ≥ 44px tap target height

---

#### DH-04 · Error Boundary + Loading States
**Depends on:** DH-01  
**Estimate:** 2h

**Description:**  
Add loading states (skeleton screens) and error boundaries to all major components. Implement a `<Suspense>` wrapper around all data-fetching Server Components. Add a global error boundary for unexpected crashes.

**Acceptance Criteria:**
- [ ] Dashboard skeleton shown while data loads (gray placeholder cards)
- [ ] Each page section wrapped in `<Suspense fallback={<Skeleton />}>`
- [ ] `error.tsx` page defined at `app/error.tsx` — shows friendly error message
- [ ] `not-found.tsx` page at `app/not-found.tsx`
- [ ] All API route errors return the standard JSON error format from TAD

**Testing Checklist:**
- [ ] Simulate slow network → skeleton visible for > 500ms
- [ ] Navigate to non-existent route → not-found page shown (not 500)
- [ ] Break one Supabase query intentionally → error boundary catches, not white screen

---

### 13. Deployment

---

#### DEP-01 · Connect Vercel Project + Environment Variables
**Depends on:** DH-04  
**Estimate:** 1h

**Description:**  
Create Vercel project. Connect GitHub repository. Configure all environment variables in Vercel dashboard for `production` and `preview` environments. Verify build passes.

**Acceptance Criteria:**
- [ ] Vercel project created and linked to GitHub repo
- [ ] All env vars from TAD configured in Vercel (production)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` marked as sensitive (not exposed in logs)
- [ ] First production build passes without errors
- [ ] Preview deployments enabled for PRs

**Testing Checklist:**
- [ ] Push to `main` → auto-deploy triggers
- [ ] Production URL accessible
- [ ] No `NEXT_PUBLIC_` variable contains a secret key

---

#### DEP-02 · Configure Domain + Cloudflare DNS
**Depends on:** DEP-01  
**Estimate:** 1h

**Description:**  
Add custom domain (tradingos.in or similar) to Vercel. Configure DNS via Cloudflare. Enable HTTPS (Vercel auto-provisioned). Verify SSL and redirect from www to apex.

**Acceptance Criteria:**
- [ ] Domain pointed to Vercel via Cloudflare CNAME/A record
- [ ] HTTPS works (valid SSL certificate)
- [ ] `www.tradingos.in` redirects to `tradingos.in`
- [ ] Cloudflare proxying enabled (orange cloud)

**Testing Checklist:**
- [ ] `https://tradingos.in` loads app
- [ ] `http://tradingos.in` redirects to HTTPS
- [ ] SSL certificate valid (green padlock in browser)

---

#### DEP-03 · Supabase Production Setup + RLS Verification
**Depends on:** DEP-01  
**Estimate:** 2h

**Description:**  
Run all migrations on production Supabase project. Verify RLS policies on all tables. Configure Supabase Auth: enable Google OAuth with production redirect URLs. Configure email templates (sign-up confirmation). Enable PgBouncer connection pooling.

**Acceptance Criteria:**
- [ ] All 6 migrations applied to production DB
- [ ] RLS enabled on all 7 tables (verified via Supabase dashboard)
- [ ] Google OAuth: callback URL set to `https://tradingos.in/auth/callback`
- [ ] Email confirmation template customized with TradingOS branding
- [ ] PgBouncer enabled in Supabase settings
- [ ] Supabase project region: Mumbai (`ap-south-1`) for lowest latency from India

**Testing Checklist:**
- [ ] Sign up on production → confirmation email received with custom template
- [ ] Google OAuth on production → signs in and creates profile
- [ ] Verify RLS: try to access another user's data via Supabase dashboard → blocked

---

#### DEP-04 · Smoke Test & Beta Onboarding Checklist
**Depends on:** DEP-03  
**Estimate:** 3h

**Description:**  
Full end-to-end smoke test of the entire MVP on production. Run the complete daily loop from sign-up to score calculation. Document and fix any critical bugs. Prepare beta onboarding checklist for 10–20 first users.

**Acceptance Criteria:**
- [ ] Complete daily loop tested end-to-end on production:
  - Sign up → email confirmation → onboarding → playbook creation
  - Morning check-in → readiness score displayed
  - Sign commitment contract → locked
  - Trade intent engine → GO/CAUTION/NO_GO displayed correctly
  - Log 2 trades → session aggregates updated
  - Score calculated → all pillars shown
  - Push notification received (if push subscribed)
- [ ] Zero critical bugs (P0: crashes, data loss, auth failures)
- [ ] Beta onboarding email template drafted
- [ ] Beta feedback form link ready (Typeform/Google Form)
- [ ] Monitoring: Vercel Analytics enabled, basic error tracking configured

**Testing Checklist:**
- [ ] Sign up as a brand new user → complete loop without assistance
- [ ] All 5 notification types tested (manually trigger cron)
- [ ] Mobile browser smoke test (Chrome Android)
- [ ] Load dashboard 10 times → p95 load time < 2 seconds (Vercel Analytics)

---

## Sprint Summary Table

| Sprint | Days | Tasks | Hours | Daily Target |
|---|---|---|---|---|
| Sprint 1 — Foundation | 1–7 | S-01 to PB-04 (16 tasks) | 34h | 4.9h/day |
| Sprint 2 — Loop Part 1 | 8–14 | MC-01 to N-02 (14 tasks) | 32h | 4.6h/day |
| Sprint 3 — Loop Part 2 | 15–21 | TI-01 to J-04 (12 tasks) | 28h | 4.0h/day |
| Sprint 4 — Intelligence | 22–30 | DS-01 to DEP-04 (9 tasks) | 37h | 4.1h/day |
| **Total** | **30 days** | **51 tasks** | **131h** | **4.4h/day** |

---

## Dependency Graph (Critical Path)

```
S-01 → S-02 → D-01 → D-02 → PB-01 → PB-02 → PB-03 → PB-04
                ↓                                          ↓
              D-03 → MC-01 → CC-01 → TI-01 → TI-02 → J-01
                ↓                      ↓                ↓
              D-04                   TI-04           DS-01 → DS-02
                ↓                                       ↓
              D-05 → N-01 → N-02 → N-03 → N-04      DH-01
                                                        ↓
S-03 → A-01 → A-02 → A-03 → A-04                   DEP-01 → DEP-04
```

**Critical Path:** S-01 → S-02 → D-01 → D-03 → MC-01 → CC-01 → CC-03 → TI-01 → J-01 → DS-01 → DH-01 → DEP-01 → DEP-04

**Parallelizable (can be done simultaneously):**
- D-02 (Playbooks) while D-03 (Sessions) being built
- A-01/A-02 (Auth pages) while D-04/D-05 (Trade tables) being built
- N-01 (Notification abstraction) can start after S-01 (no DB dependency)
- DH-03 (Mobile responsive) while DS-01 (Score engine) being built

---

## Definition of Done (per task)

- [ ] Feature works end-to-end on `localhost:3000`
- [ ] All acceptance criteria checked
- [ ] All testing checklist items verified
- [ ] No TypeScript errors (`tsc --noEmit` passes)
- [ ] No new ESLint warnings
- [ ] Component renders correctly on 375px width
- [ ] Code pushed to `develop` branch (no uncommitted changes)

---

## Risk Register (Engineering)

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Supabase RLS bug allows cross-user data access | Low | Critical | Test every table with two separate user sessions before Sprint 4 |
| IST timezone offset bugs in cron jobs | High | High | Implement `lib/constants.ts` IST utility from Day 1. Test all time-sensitive features at 8:30 AM, 9:00 AM, 5:00 PM IST explicitly |
| Score derivation cron times out at 60s (Vercel limit) | Low at MVP scale | Medium | Batch size = 50 users (DS-02). Monitor execution time in Vercel logs |
| Push subscription goes stale (410 Gone) | Medium | Low | Handle 410 in PushChannel: mark `is_active = false`, fallback to email |
| Journal immutability trigger fires during legitimate edit (24h bug) | Low | Medium | Set lock cron to 9:30 AM IST (giving users from 9:00 PM to 9:30 AM next day to edit) |
| Sprint 3 TI-01 (Intent Engine API) takes > 4h | Medium | Medium | TI-01 is the most complex single task. Pre-read TAD algorithm before starting. If running long, defer TI-05 (history view) to buffer |

---

*End of Document*

**TradingOS Engineering Breakdown v1.0 | June 2026**  
**51 Tasks | 131h Estimated | 30-Day Sprint | Max 4h per Task**
