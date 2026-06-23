# TradingOS — Build Order
**Version:** 1.0 | **Date:** June 2026  
**Based on:** PRD v1.0 · TAD v1.1 · EBD v1.0  
**Principle:** Every file you build should never need to be rewritten because of something you build later.

---

## Why This Order Exists

Rework happens in three situations:

1. **Schema changes after API is built** → API rewrites  
2. **API shape changes after UI is built** → UI rewrites  
3. **Ad-hoc types and styles scattered everywhere** → Global refactor  

This order eliminates all three by enforcing: **Types → Database → Server Lib → API → UI primitives → Feature UI**

No phase begins until the previous phase's gate is cleared. No exceptions.

---

## The 19 Phases

```
Phase 01 — Project Scaffold
Phase 02 — Type System & Constants        ← rework prevention anchor
Phase 03 — Database Migrations            ← schema must be final before any code
Phase 04 — Supabase Client Utilities
Phase 05 — Middleware & Route Guards
Phase 06 — UI Primitive Components        ← build once, use everywhere
Phase 07 — App Shell & Layout
Phase 08 — Auth & Onboarding
Phase 09 — Notification Abstraction Layer ← before any feature that sends alerts
Phase 10 — Settings Page
Phase 11 — Playbook Module
Phase 12 — Morning Check-in Module
Phase 13 — Commitment Contract Module
Phase 14 — Score Engine Library           ← lib only, no API yet
Phase 15 — Trade Intent Engine
Phase 16 — Trade Journal Module
Phase 17 — Score API & Score UI
Phase 18 — Notification Cron Wiring
Phase 19 — Dashboard & Deployment
```

---

## Phase 01 — Project Scaffold

**Why first:** Everything else lives inside this structure. Get it right once.

### Files to Create (in order)

```
1.  package.json                    ← npm init (via create-next-app)
2.  next.config.ts                  ← basic config, no custom settings yet
3.  tsconfig.json                   ← strict mode ON from Day 1
4.  tailwind.config.ts              ← design tokens added NOW (colors, fonts, spacing)
5.  postcss.config.mjs
6.  .gitignore                      ← include .env.local, .supabase/, node_modules/
7.  .env.example                    ← ALL env var keys, empty values, committed to git
8.  .env.local                      ← real values, NEVER committed
9.  README.md                       ← project name, setup instructions
```

### `tailwind.config.ts` must include at scaffold time:

```
Colors:    brand-primary, brand-accent, success, danger, surface, surface-raised, muted
Font:      Inter via next/font/google
Dark mode: class strategy
```

> **Gate:** `npm run dev` starts on port 3000. `npm run build` passes. `npm run lint` passes.  
> **Do not proceed to Phase 02 until this gate clears.**

---

## Phase 02 — Type System & Constants

**Why second:** Every file in the codebase will import from here. Define once, reference everywhere. If types are defined per-feature, you'll have 12 slightly different definitions of "Trade" by the end.

### Files to Create (in order)

```
1.  lib/constants.ts
    ├── IST_OFFSET_MINUTES = 330
    ├── SCORE_ALGORITHM_VERSION = 'v1.0'
    ├── SCORE_WEIGHTS (pillar maxes: 20, 20, 30, 20, 10)
    ├── PSYCHOLOGY_TAGS = ['focus','confident','fomo','fear','greed','revenge','restlessness']
    ├── NOTIFICATION_TYPES = ['morning_checkin','market_open_warning','journal_reminder','journal_warning','evening_planning']
    ├── MARKET_TYPES = ['equity','fo','crypto','commodity']
    ├── TRADING_STYLES = ['scalping','intraday','swing']
    └── TIMEFRAMES = ['1min','5min','15min','1hr','daily']

2.  lib/utils.ts
    ├── toIST(utcDate: Date): Date
    ├── todayIST(): string              ← returns YYYY-MM-DD in IST
    ├── formatINR(amount: number): string
    ├── formatPercent(value: number): string
    └── computeReadinessScore(sleep, stress, energy, focus, motivation): number

3.  lib/types.ts                        ← TypeScript interfaces mirroring DB schema
    ├── Profile
    ├── PlaybookSetup
    ├── DailySession
    ├── TradeIntent
    ├── IntentRequest
    ├── IntentResponse
    ├── TradeJournal
    ├── BehavioralEvent
    ├── PushSubscription
    ├── ScoreResult
    │   └── { total, checkin, journal, playbook, noRevenge, evening, algorithmVersion }
    └── NotificationPrefs

4.  lib/validations.ts                  ← Zod schemas (one per form/API)
    ├── ProfileSchema
    ├── PlaybookSetupSchema
    ├── IntentRequestSchema
    ├── TradeJournalSchema
    ├── ContractSchema
    └── OverrideReasonSchema
```

> **Gate:** `tsc --noEmit` passes with zero errors. All types compile.  
> **Do not proceed to Phase 03 until this gate clears.**

---

## Phase 03 — Database Migrations

**Why third:** Schema is the contract everything else is built on. Change the schema after building APIs = rewrite APIs. Run all migrations now. Finalize before writing a single API route.

### Migration Files (strict dependency order)

```
supabase/migrations/

001_profiles.sql
    ├── CREATE TABLE profiles (all columns per TAD)
    ├── CREATE FUNCTION handle_new_user()
    ├── CREATE TRIGGER on_auth_user_created
    ├── ALTER TABLE profiles ENABLE ROW LEVEL SECURITY
    ├── CREATE POLICY "Users view own profile"   (SELECT)
    └── CREATE POLICY "Users update own profile" (UPDATE)

002_playbook_setups.sql
    ├── CREATE TABLE playbook_setups (all columns per TAD)
    ├── ALTER TABLE playbook_setups ENABLE ROW LEVEL SECURITY
    └── CREATE POLICY "Users manage own data" (FOR ALL)

003_daily_sessions.sql
    ├── CREATE TABLE daily_sessions (all columns per TAD v1.1)
    │   └── NOTE: score_derived_at and score_algorithm_version (NOT score_calculated_at)
    ├── UNIQUE constraint on (user_id, session_date)
    ├── ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY
    ├── CREATE POLICY "Users manage own data" (FOR ALL)
    ├── CREATE INDEX idx_daily_sessions_user_date
    ├── CREATE INDEX idx_daily_sessions_algo_version
    └── CREATE INDEX idx_daily_sessions_pending_checkin

004_trades.sql
    ├── CREATE TABLE trade_intents (all columns — no updated_at)
    ├── CREATE TABLE trade_journal (all columns + locked_at)
    ├── CREATE FUNCTION prevent_journal_update()
    ├── CREATE TRIGGER lock_journal_entries (BEFORE UPDATE on trade_journal)
    ├── ALTER TABLE trade_intents ENABLE ROW LEVEL SECURITY
    ├── ALTER TABLE trade_journal ENABLE ROW LEVEL SECURITY
    ├── CREATE POLICY "Users manage own data" ON trade_intents (FOR ALL)
    ├── CREATE POLICY "Users view own trades"         ON trade_journal (SELECT)
    ├── CREATE POLICY "Users insert own trades"       ON trade_journal (INSERT)
    ├── CREATE POLICY "Users update unlocked trades"  ON trade_journal (UPDATE WHERE locked_at IS NULL)
    └── CREATE INDEX idx_trade_journal_user_setup

005_behavioral_events.sql
    ├── CREATE TABLE behavioral_events (all columns — no updated_at, no delete)
    ├── ALTER TABLE behavioral_events ENABLE ROW LEVEL SECURITY
    ├── CREATE POLICY "Users view own events" (SELECT only — no client write)
    ├── CREATE INDEX idx_behavioral_events_user_session_type
    └── CREATE INDEX idx_behavioral_events_user_time

006_push_subscriptions.sql
    ├── CREATE TABLE push_subscriptions (all columns)
    ├── UNIQUE constraint on endpoint
    ├── ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY
    └── CREATE POLICY "Users manage own data" (FOR ALL)

supabase/seed.sql
    ├── INSERT 1 test user (bypass auth — use Supabase admin)
    ├── INSERT profile (onboarding_completed = true)
    ├── INSERT 2 playbook setups (with realistic data)
    └── INSERT 1 daily_session for today (checkin + contract pre-filled)
```

### Verification Queries (run after each migration)

```
After 001: SELECT COUNT(*) FROM profiles;                  → 0 rows (no users yet)
After 002: \d playbook_setups                              → check columns
After 003: SELECT column_name FROM information_schema.columns WHERE table_name='daily_sessions';
After 004: UPDATE trade_journal SET notes='test';          → should fail (trigger test after seed)
After 005: INSERT INTO behavioral_events VALUES (...);     → should fail (RLS blocks client)
After 006: \d push_subscriptions                          → check unique constraint on endpoint
After seed: SELECT * FROM profiles;                        → 1 row
```

> **Gate:** All 7 migrations + seed apply via `supabase db reset` without errors. All RLS tests above pass.  
> **Do not proceed to Phase 04 until this gate clears.**

---

## Phase 04 — Supabase Client Utilities

**Why fourth:** Every API route and Server Component needs these. Build them once, centrally, correctly.

### Files to Create (in order)

```
1.  lib/supabase/client.ts
    └── createBrowserClient() — anon key only, for "use client" components

2.  lib/supabase/server.ts
    └── createServerClient() — service role key, for API routes and Server Components

3.  lib/supabase/middleware.ts
    └── createMiddlewareClient() — for middleware.ts session refresh
```

### Rules to Enforce (document in a comment at top of each file)

```
client.ts:  NEVER import in API routes or Server Components
server.ts:  NEVER expose to browser. NEVER import in "use client" files.
            NEVER log or return the service role key.
```

> **Gate:** Import both clients in a throwaway test file. `tsc --noEmit` passes.  
> **Do not proceed to Phase 05 until this gate clears.**

---

## Phase 05 — Middleware & Route Guards

**Why fifth:** Without this, every page is publicly accessible. Set security before building any page.

### Files to Create (in order)

```
1.  middleware.ts
    ├── Import: lib/supabase/middleware.ts
    ├── Refresh session on every request (Supabase SSR requirement)
    ├── UNPROTECTED routes: /auth/*, /api/auth/*, /_next/*, /favicon.ico
    ├── PROTECTED routes: everything else
    ├── Guard 1: No session → redirect to /auth/login
    └── Guard 2: Session + onboarding_completed=false → redirect to /onboarding/profile

2.  app/auth/callback/route.ts
    └── Exchange ?code= param for session via supabase.auth.exchangeCodeForSession()
        Redirect to /onboarding/profile after
```

> **Gate:** Visit `localhost:3000` in incognito → redirects to `/auth/login`. Page doesn't exist yet — a 404 is acceptable. The redirect must happen.  
> **Do not proceed to Phase 06 until this gate clears.**

---

## Phase 06 — UI Primitive Components

**Why sixth:** Every feature page uses these. If you build a button inside a feature page first and then extract it, you'll refactor it. Build primitives once and reference them everywhere.

**Rule:** No primitive component has any business logic. No DB calls. Pure UI only.

### Files to Create (in order)

```
components/ui/

1.  Button.tsx
    └── variants: primary, secondary, danger, ghost
        sizes: sm, md, lg
        states: loading (spinner), disabled

2.  Input.tsx
    └── variants: default, error
        label, error message, helper text slots

3.  Select.tsx
    └── native <select> element, dark-themed, label slot

4.  Slider.tsx
    └── range 1–10, current value display, color-coded track

5.  Toggle.tsx
    └── boolean on/off, label slot, disabled state

6.  Card.tsx
    └── variants: default, raised, bordered
        padding presets: sm, md, lg

7.  Badge.tsx
    └── variants: success (green), warning (amber), danger (red), neutral (muted)
        sizes: sm, md

8.  ProgressBar.tsx
    └── props: value (0–100), max, label, color override

9.  Skeleton.tsx
    └── variants: text, card, circle
        animated pulse

10. Modal.tsx
    └── overlay + centered dialog, close on backdrop click, escape key

11. Toast.tsx
    └── variants: success, error, info
        auto-dismiss after 3s
        position: bottom-right

12. ScoreGauge.tsx          ← shared by Score page AND Dashboard
    └── props: score (0–100)
        SVG arc or CSS conic-gradient
        colors: <40 red, 40–69 amber, ≥70 green
        score number centered, label below
```

> **Gate:** Render all 12 components on a temporary `/dev-ui` test page. Verify each variant. Dark theme consistent across all. Delete the test page after verification.  
> **Do not proceed to Phase 07 until this gate clears.**

---

## Phase 07 — App Shell & Layout

**Why seventh:** Every page inherits the layout. Build it once with the correct structure.

### Files to Create (in order)

```
1.  app/globals.css
    ├── @import Inter from next/font (or @apply in layout)
    ├── CSS custom properties for all design tokens
    ├── Dark background: #0f172a (body)
    └── Base resets

2.  app/layout.tsx                          ← Root layout
    ├── <html lang="en" className="dark">
    ├── Inter font applied
    ├── <body> with surface background
    └── Toast provider (if using context)

3.  components/layout/Navigation.tsx
    ├── Left sidebar or top nav (pick ONE layout — don't change later)
    ├── Links: Dashboard (/), Check-in (/checkin), Contract (/contract),
    │         Intent (/intent), Journal (/journal), Score (/score), Settings (/settings)
    ├── Check-in status dot (green/yellow/red based on today's session)
    └── User avatar + sign out

4.  components/layout/AppShell.tsx
    └── Wraps Navigation + <main> content area
        Responsive: sidebar on desktop, bottom nav on mobile

5.  app/(protected)/layout.tsx              ← Layout for all protected routes
    └── Wraps AppShell

6.  app/error.tsx                           ← Global error boundary
    └── Friendly error message + "Go to dashboard" link

7.  app/not-found.tsx                       ← 404 page
    └── Friendly message + navigation link
```

> **Gate:** `localhost:3000` shows the navigation shell (even if content is empty). Navigation links render. Error and 404 pages render.  
> **Do not proceed to Phase 08 until this gate clears.**

---

## Phase 08 — Auth & Onboarding

**Why eighth:** Every other feature requires a logged-in user with a complete profile. Auth must work perfectly before any feature is built.

### API Routes (in order)

```
None needed — Supabase Auth handles all auth flows via client SDK.
Only callback route already built in Phase 05.
```

### Pages (in order)

```
1.  app/auth/login/page.tsx
    ├── Email + password form (React Hook Form + ProfileSchema email field)
    ├── "Continue with Google" button
    ├── Error display (invalid credentials, unconfirmed email)
    └── Link to /auth/signup

2.  app/auth/signup/page.tsx
    ├── Full Name + Email + Password + Confirm Password
    ├── Password match validation (client-side)
    └── Post-submit: "Check your email" confirmation screen (not a redirect)

3.  app/onboarding/profile/page.tsx
    ├── Step 1 of 2 indicator
    ├── Fields: capital_base, market_type, trading_style,
    │           default_risk_per_trade, default_daily_loss_limit, default_max_trades
    ├── All using primitives from Phase 06
    └── On save: UPDATE profiles, redirect to /onboarding/playbook

4.  app/onboarding/playbook/page.tsx
    ├── Step 2 of 2 indicator
    ├── Reuse PlaybookSetupForm component (will be built properly in Phase 11)
    │   → For now: inline form is acceptable (will be extracted in Phase 11)
    ├── On save: INSERT playbook_setups, UPDATE profiles.onboarding_completed=true
    └── Redirect to /

5.  app/settings/page.tsx (stub only — full build in Phase 10)
    └── Logout button only, no other content yet
```

> **Gate:** Full flow works: Sign up → email confirmation → onboarding Step 1 → Step 2 → dashboard redirect. Google OAuth sign in works. Sign out works. `profiles` row created on signup (trigger fires).  
> **Do not proceed to Phase 09 until this gate clears.**

---

## Phase 09 — Notification Abstraction Layer

**Why ninth (before features):** The check-in, contract, journal, and cron all need to send notifications. If you build `EmailChannel` inside the check-in feature, you'll copy-paste it to every other feature. Build the abstraction now. Features just call `dispatcher.dispatch()`.

### Files to Create (in order)

```
1.  lib/notifications/types.ts
    ├── interface NotificationChannel
    │   ├── channelId: 'email' | 'push' | 'whatsapp' | 'telegram' | 'mobile_push'
    │   ├── isAvailable(user: UserNotificationProfile): boolean
    │   └── send(payload, user): Promise<DeliveryResult>
    ├── type NotificationPayload
    │   ├── type: NotificationType (from lib/constants.ts)
    │   ├── title: string
    │   ├── body: string
    │   ├── deeplink: string
    │   └── urgency: 'low' | 'normal' | 'high'
    ├── type DeliveryResult
    │   ├── success: boolean
    │   ├── channelId: string
    │   └── error?: string
    └── type UserNotificationProfile
        ├── userId: string
        ├── email: string
        ├── notificationPrefs: NotificationPrefs
        └── pushSubscriptions: PushSubscription[]

2.  lib/notifications/channels/email.ts
    ├── Implements NotificationChannel
    ├── channelId = 'email'
    ├── isAvailable(): always true (email always available if RESEND_API_KEY set)
    └── send(): POST to Resend API
        Return DeliveryResult

3.  lib/notifications/channels/push.ts
    ├── Implements NotificationChannel
    ├── channelId = 'push'
    ├── isAvailable(): user has at least 1 active push subscription
    ├── send(): for each active subscription, call web-push sendNotification()
    └── On 410 Gone: mark subscription inactive, return partial success

4.  lib/notifications/dispatcher.ts
    ├── Import: EmailChannel, PushChannel
    ├── Channel preference order: [PushChannel, EmailChannel]
    ├── dispatch(payload, user): Promise<DeliveryResult>
    │   ├── For each channel in order:
    │   │   ├── if !channel.isAvailable(user) OR prefs disabled → skip
    │   │   ├── await channel.send(payload, user)
    │   │   ├── if success → log behavioral_events 'notification_sent', return
    │   │   └── if failure → log behavioral_events 'notification_failed', continue
    │   └── if all fail → log 'notification_undelivered'
    └── NOTE: WhatsApp and Telegram are stubbed channel files for Phase 2:
            lib/notifications/channels/whatsapp.ts (empty stub, throws NotImplemented)
            lib/notifications/channels/telegram.ts (empty stub, throws NotImplemented)
```

> **Gate:** Write a one-off test script (in `scratch/` directory, not committed) that calls `dispatcher.dispatch()` with a test email payload. Email arrives in inbox. Delete test script.  
> **Do not proceed to Phase 10 until this gate clears.**

---

## Phase 10 — Settings Page (Full Build)

**Why tenth:** Push subscription registration (N-02 in EBD) requires the Supabase client and the `push_subscriptions` table (Phase 03) to exist. Settings page is low-complexity and fast — gets it out of the way.

### API Routes (in order)

```
1.  app/api/notifications/subscribe/route.ts
    ├── POST — authenticated
    ├── Body: { subscription: { endpoint, keys: { p256dh, auth } } }
    ├── Zod validate body
    ├── UPSERT to push_subscriptions (endpoint is unique — update on conflict)
    └── Return 201
```

### Pages (in order)

```
1.  app/settings/page.tsx (replace stub from Phase 08)
    ├── Section 1: Risk Profile (same fields as onboarding — pre-populated from profile)
    │   └── Save button → UPDATE profiles
    ├── Section 2: Push Notifications
    │   ├── Enable/Disable toggle per notification type
    │   ├── "Enable Push Notifications" button → browser permission → POST subscribe API
    │   └── After grant: show "Notifications Enabled ✓"
    └── Section 3: Account
        └── Sign Out button
```

> **Gate:** Update risk profile → value persists after page refresh. Enable push → notification in OS tray. All 5 notification type toggles save to `profiles.notification_prefs`.  
> **Do not proceed to Phase 11 until this gate clears.**

---

## Phase 11 — Playbook Module

**Why eleventh:** Playbooks must exist before Check-in (which references setup names) and before the Commitment Contract (which selects allowed setups). Every downstream feature depends on at least one setup existing.

### Components (in order)

```
1.  components/playbook/SetupForm.tsx
    ├── Fields: name, entry_conditions (textarea), timeframe (select), min_rr_ratio
    ├── Uses: Input, Select, Button from Phase 06
    ├── Uses: PlaybookSetupSchema from lib/validations.ts
    └── Props: onSubmit, defaultValues (for edit mode)

2.  components/playbook/SetupCard.tsx
    ├── Displays: name, timeframe, win rate, total trades
    ├── "Low data" badge if total_trades < 10
    ├── Edit button, Archive button
    └── Uses: Card, Badge from Phase 06
```

### Pages (in order)

```
1.  app/playbook/page.tsx
    ├── Fetch: all active setups for user (Supabase SDK direct, no API route needed)
    ├── Render: list of SetupCard components
    ├── "Add Setup" button → opens Modal containing SetupForm
    ├── Archive action: UPDATE playbook_setups SET archived_at, is_active=false
    └── Create action: INSERT playbook_setups
```

### No API routes for Playbooks

> Playbook CRUD goes directly client → Supabase SDK (RLS handles security). No API route needed. This is the Supabase-First pattern from TAD.

> **Gate:** Create a playbook setup → appears in list. Archive it → disappears. Edit it → values updated. Win rate shows "Low data" on new setup.  
> **Do not proceed to Phase 12 until this gate clears.**

---

## Phase 12 — Morning Check-in Module

**Why twelfth:** Check-in creates the `daily_sessions` row. The Commitment Contract (Phase 13) updates it. The Intent Engine (Phase 15) reads it. Everything flows through the session — create it first.

### Components (in order)

```
1.  components/checkin/ReadinessSlider.tsx
    ├── Wraps Slider from Phase 06
    ├── Props: label, name, value, onChange
    └── Labels: "1 = Poor", "10 = Excellent" (inverted for Stress)

2.  components/checkin/ReadinessResult.tsx
    ├── Uses: ScoreGauge from Phase 06
    ├── Color-coded band message (exact text from PRD)
    ├── CTA: "Sign Today's Contract →" or "View Dashboard →" if already signed
    └── Props: score, contractSigned
```

### Pages (in order)

```
1.  app/checkin/page.tsx
    ├── Check if today's session exists:
    │   ├── EXISTS + checkin_completed_at NOT NULL → show ReadinessResult (read-only)
    │   └── NOT EXISTS or checkin_completed_at NULL → show form
    ├── Time gate: if time > 11:00 AM IST AND no check-in → show "Window closed" message
    ├── On submit:
    │   ├── Compute readiness score via utils.ts computeReadinessScore()
    │   ├── UPSERT daily_sessions (checkin fields + checkin_completed_at = NOW())
    │   ├── INSERT behavioral_events: 'checkin_completed' {readiness_score, completed_at_ist}
    │   └── Show ReadinessResult
    └── Direct Supabase SDK calls — no API route needed
```

### Update Navigation (Phase 07 file)

```
components/layout/Navigation.tsx  ← ADD check-in status dot logic
    ├── Fetch today's session on every render
    ├── Dot: green if checkin_completed_at NOT NULL
    ├── Dot: yellow if before 09:00 IST and not done
    └── Dot: red if after 09:00 IST and not done
```

> **Gate:** Complete check-in → readiness score shown with correct color. Refresh → result shown (not form again). After 11 AM IST → form disabled. Navigation dot updates.  
> **Do not proceed to Phase 13 until this gate clears.**

---

## Phase 13 — Commitment Contract Module

**Why thirteenth:** Contract must exist before the Intent Engine (which validates against contract limits). Contract reads playbook setups (Phase 11) and requires a session (Phase 12).

### Components (in order)

```
1.  components/contract/ContractForm.tsx
    ├── Fields: max_trades (number, pre-filled from profile default),
    │           max_loss_inr (number, pre-filled from profile default),
    │           allowed_setup_ids (multi-select checkboxes, from active setups),
    │           forbidden_conditions (textarea, optional)
    ├── Uses: Input, Toggle, Button from Phase 06
    ├── Uses: ContractSchema from lib/validations.ts
    └── At least 1 setup required (validation)

2.  components/contract/ContractSummary.tsx
    ├── Read-only view of signed contract
    ├── Max Trades, Max Loss (₹), Allowed Setup names, Forbidden conditions
    ├── "Locked at HH:MM IST" timestamp
    └── CTA: "Open Trade Intent Engine →"
```

### Pages (in order)

```
1.  app/contract/page.tsx
    ├── Guard: if no check-in today → redirect to /checkin
    ├── If contract_signed_at NOT NULL → show ContractSummary (read-only)
    ├── If contract_signed_at IS NULL → show ContractForm
    ├── On sign:
    │   ├── UPDATE daily_sessions (contract_* fields + contract_signed_at = NOW())
    │   ├── INSERT behavioral_events: 'contract_signed' {max_trades, max_loss, setup_ids}
    │   └── Show ContractSummary
    └── Direct Supabase SDK calls — no API route needed
```

> **Gate:** Sign contract → read-only summary shown. Refresh → summary persists. New day (test by changing session_date) → form shown again. No check-in → redirect to /checkin.  
> **Do not proceed to Phase 14 until this gate clears.**

---

## Phase 14 — Score Engine Library

**Why fourteenth (before Intent Engine):** The Intent Engine API references behavioral events. The Score Engine also references behavioral events. Build the score derivation function before either API route — it will be called from DS-02 (Score Cron) AND can be unit-tested independently.

**Rule:** `lib/score-engine.ts` is a pure library file. No HTTP handlers, no Express, no Next.js. Just a function. It can be tested with a direct Node.js script.

### Files to Create (in order)

```
1.  lib/score-engine.ts
    ├── Import: lib/types.ts (ScoreResult, BehavioralEvent)
    ├── Import: lib/constants.ts (SCORE_ALGORITHM_VERSION, SCORE_WEIGHTS)
    ├── Import: lib/supabase/server.ts
    │
    ├── FUNCTION deriveScore(userId: string, sessionDate: string): Promise<ScoreResult>
    │   ├── Fetch session_id from daily_sessions (userId + sessionDate)
    │   ├── Fetch ALL score-input events from behavioral_events for this session_id
    │   │   event_types: checkin_completed, contract_signed, trade_logged,
    │   │                intent_submitted, intent_override, evening_activity
    │   ├── Derive Pillar 1: Check-in (0 | 10 | 20)
    │   ├── Derive Pillar 2: Journal (20 if trades=0, else based on trade_logged count)
    │   ├── Derive Pillar 3: Playbook (30 - overrides×10 - violations×5, min 0)
    │   ├── Derive Pillar 4: Revenge (20 - revenge_count×10, min 0)
    │   ├── Derive Pillar 5: Evening (10 if evening_activity event exists, else 0)
    │   ├── Total = sum of pillars
    │   ├── UPDATE daily_sessions read-model cache (all score_* columns)
    │   ├── INSERT behavioral_events: 'score_derived' operational event
    │   └── Return ScoreResult
    │
    └── FUNCTION getScoreAlgorithmVersion(): string
        └── Return SCORE_ALGORITHM_VERSION constant
```

### Test Script (scratch file — not committed)

```
scratch/test-score-engine.ts
    ├── Call deriveScore() with real user_id from seed data
    ├── Log result to console
    └── Delete after verification
```

> **Gate:** `deriveScore()` runs against seed data and returns a valid `ScoreResult`. All 5 pillars calculate correctly. `daily_sessions` read-model cache updated. Delete test script.  
> **Do not proceed to Phase 15 until this gate clears.**

---

## Phase 15 — Trade Intent Engine

**Why fifteenth:** Depends on contracts (Phase 13) and behavioral events structure (Phase 14 revealed it). Build API first, then UI.

### API Routes (in order)

```
1.  app/api/intent/validate/route.ts
    ├── POST — authenticated
    ├── Zod validate: IntentRequestSchema
    ├── Check: profiles.tier === 'pro' (else return 403 PRO_REQUIRED)
    ├── Load today's session (userId + todayIST())
    ├── Check: contract_signed_at NOT NULL (else return no_go)
    ├── Check: trades_taken < contract_max_trades (else return no_go)
    ├── Check: risk_amount <= remaining_budget (else return no_go)
    ├── Check: setup_id IN contract_allowed_setup_ids (else flag caution)
    ├── Fetch: setup win_rate + total_trades from playbook_setups
    ├── Determine: final result (no_go | caution | go)
    ├── INSERT trade_intents (all fields + win_rate_at_time snapshot)
    ├── INSERT behavioral_events: 'intent_submitted'
    └── Return IntentResponse

2.  app/api/intent/[intent_id]/override/route.ts
    ├── PATCH — authenticated
    ├── Body: { reason: string } — min 10 chars
    ├── Verify: intent belongs to requesting user
    ├── UPDATE trade_intents: user_proceeded=true, override_reason
    ├── INSERT behavioral_events: 'intent_override' {original_result, reason}
    └── Return 204 No Content
```

### Components (in order)

```
1.  components/intent/IntentForm.tsx
    ├── Setup dropdown (only setups from today's contract — fetch contract on load)
    ├── Risk Amount (₹) input with remaining budget hint
    ├── R:R Ratio input
    ├── Uses: Select, Input, Button from Phase 06
    └── Props: contractSetups, budgetRemaining, onResult(IntentResponse, intentId)

2.  components/intent/ValidationResult.tsx
    ├── Props: result (IntentResponse), intentId, onOverride, onLogTrade
    ├── GO state: green card, win rate, budget remaining, trades remaining
    ├── CAUTION state: amber card, warning, reasons, "Proceed Anyway" (small)
    ├── NO_GO state: red card, reasons, "Proceed Anyway" (requires typed reason)
    ├── "Proceed Anyway" flow: Input for reason (min 10 chars) → PATCH override API
    └── "Log This Trade →" CTA: navigates to /journal/new?intent_id=X&setup_id=Y

3.  components/intent/IntentHistory.tsx
    ├── Table of today's trade_intents for current session
    ├── Columns: Time (IST), Setup Name, Result (badge), Win Rate, Overridden
    └── Real-time update after new intent submitted (refetch after IntentForm submit)
```

### Pages (in order)

```
1.  app/intent/page.tsx
    ├── Guard: no contract today → full-page banner with link to /contract
    ├── Fetch today's session + contract data
    ├── Render: IntentForm + ValidationResult (conditional) + IntentHistory
    └── All API calls via fetch() to routes built above
```

> **Gate:** Test all 4 result paths (no contract, trade limit, budget breach, all clear). Override flow records reason in DB. "Log This Trade →" pre-fills journal URL with intent_id.  
> **Do not proceed to Phase 16 until this gate clears.**

---

## Phase 16 — Trade Journal Module

**Why sixteenth:** Reads intent_id (Phase 15), updates playbook stats (Phase 11), appends behavioral events (needed by Phase 17 score).

### API Routes (in order)

```
1.  app/api/cron/lock-journals/route.ts
    ├── GET — requires CRON_SECRET bearer token
    ├── UPDATE trade_journal SET locked_at=NOW()
    │   WHERE logged_at < NOW() - INTERVAL '24 hours' AND locked_at IS NULL
    └── Return { locked: N }
```

### Components (in order)

```
1.  components/journal/PsychTag.tsx
    ├── Badge variant per psychology tag
    ├── Colors: focus/confident=green, fomo/restlessness=yellow, fear/greed/revenge=red
    └── Uses: Badge from Phase 06

2.  components/journal/TradeForm.tsx
    ├── Fields: instrument (text), entry_price, exit_price, quantity (numbers)
    ├── Auto-computed P&L display: (exit - entry) × qty — live as user types
    ├── Setup dropdown (from all active setups — not just today's contract)
    ├── Psychology tag select (all 7 values from constants.ts)
    ├── Rule Followed toggle
    ├── Deviation Note (textarea — required if rule_followed=false, hidden otherwise)
    ├── Notes (optional textarea)
    ├── Pre-fill support: intent_id, setup_id from URL params
    └── Uses: Input, Select, Toggle, Button, PsychTag from above

3.  components/journal/TradeList.tsx
    ├── Renders list of trade_journal rows for a given date
    ├── Columns: Time (IST), Instrument, Setup, P&L (colored), PsychTag, Rule Followed
    ├── Edit button (hidden if locked_at NOT NULL)
    └── Daily P&L summary row at bottom

4.  components/journal/DailyPnLSummary.tsx
    └── Total P&L, trade count, win count, loss count for the day
```

### Pages (in order)

```
1.  app/journal/new/page.tsx
    ├── Render: TradeForm
    ├── Read URL params: intent_id, setup_id (pre-fill if present)
    ├── On submit:
    │   ├── INSERT trade_journal
    │   ├── UPDATE daily_sessions (trades_taken++, realized_pnl_inr += pnl_inr)
    │   ├── UPDATE playbook_setups stats (total_trades++, winning_trades++ if pnl > 0)
    │   ├── INSERT behavioral_events: 'trade_logged' {pnl, tag, rule_followed, setup_id}
    │   └── Redirect to /journal/[todayIST()]
    └── Direct Supabase SDK calls — no API route needed

2.  app/journal/[date]/page.tsx
    ├── Fetch: trade_journal for session date
    ├── Fetch: daily_sessions for session date (for P&L summary)
    ├── Render: DailyPnLSummary + TradeList
    ├── Edit flow: load TradeForm pre-populated → UPDATE trade_journal
    │   └── On DB trigger reject (locked) → show error toast
    └── Date navigation: prev/next day links
```

### Add "Evening Activity" Event (required for Pillar 5 of Score Engine)

```
After journal is logged for the day, trigger:
    INSERT behavioral_events: 'evening_activity' {activity_type: 'trade_logged'}
    
This happens inside app/journal/new/page.tsx submit handler.
Pillar 5 checks for ANY evening_activity event after 4PM IST.
```

> **Gate:** Log 3 trades → all appear in `/journal/[date]`. P&L total correct. `daily_sessions.trades_taken` and `realized_pnl_inr` correct. `playbook_setups.total_trades` updated. Lock cron endpoint runs and locks entries > 24h.  
> **Do not proceed to Phase 17 until this gate clears.**

---

## Phase 17 — Score API & Score UI

**Why seventeenth:** Score derives from behavioral events written by all previous phases (Check-in, Contract, Intent, Journal). All events must exist before score can be accurate.

### API Routes (in order)

```
1.  app/api/score/calculate/route.ts
    ├── POST — authenticated
    ├── Rate limit: 5 calls per user per day (use simple DB counter or Redis-free approach)
    ├── Call: deriveScore(userId, todayIST()) from lib/score-engine.ts
    └── Return: ScoreResult

2.  app/api/cron/score/route.ts
    ├── GET — requires CRON_SECRET bearer token
    ├── Fetch: all user_ids with daily_sessions for today
    ├── Batch: 50 users per iteration
    ├── Skip: sessions where score_derived_at IS NOT NULL for today (idempotent)
    ├── For each: call deriveScore()
    └── Return: { processed, skipped, errors, duration_ms }
```

### Components (in order)

```
1.  components/score/ScoreBreakdown.tsx
    ├── 5 labeled progress bars (one per pillar)
    ├── Label: "Check-in: 20 / 20", "Journal: 15 / 20", etc.
    └── Uses: ProgressBar from Phase 06

2.  components/score/ScoreChart.tsx
    ├── Recharts LineChart
    ├── X-axis: date (last 30 days)
    ├── Y-axis: score (0–100)
    ├── Data: daily_sessions where score_total IS NOT NULL
    └── Dot on each data point, tooltip on hover
```

### Pages (in order)

```
1.  app/score/page.tsx
    ├── If score_derived_at IS NOT NULL for today: show ScoreGauge + ScoreBreakdown
    ├── If not: show placeholder "Score available at 5PM or click Calculate"
    ├── "Calculate Now" button → POST /api/score/calculate → update ScoreGauge live
    └── ScoreChart below (30-day history)
```

> **Gate:** After completing full daily loop (check-in + contract + intent + journal), click "Calculate Now" → score shows with all 5 pillars correctly populated. Score chart shows data points for any previously derived scores.  
> **Do not proceed to Phase 18 until this gate clears.**

---

## Phase 18 — Notification Cron Wiring

**Why eighteenth:** Cron logic queries DB state that is only meaningful after all features exist (session, contract, journal). Wiring crons before features are built would require testing against incomplete data.

### API Routes (in order)

```
1.  app/api/cron/notify/route.ts
    ├── GET — requires CRON_SECRET bearer token
    ├── Query param: type (one of 5 notification types from constants.ts)
    ├── Query logic per type:
    │   ├── morning_checkin:     daily_sessions WHERE checkin_completed_at IS NULL for today
    │   ├── market_open_warning: daily_sessions WHERE checkin_completed_at IS NULL for today
    │   ├── journal_reminder:    daily_sessions WHERE trades_taken > 0 AND
    │   │                        journal count (from behavioral_events) < trades_taken
    │   ├── journal_warning:     same condition as journal_reminder
    │   └── evening_planning:    no 'evening_activity' event today
    ├── For each eligible user:
    │   ├── Fetch UserNotificationProfile (email + prefs + push subscriptions)
    │   └── Call dispatcher.dispatch(payload, userProfile)
    └── Return: { sent, failed, skipped }
```

### Configuration File

```
vercel.json
    └── crons: [
          { path: '/api/cron/notify?type=morning_checkin',    schedule: '25 3 * * 1-5'  },
          { path: '/api/cron/notify?type=market_open_warning',schedule: '55 3 * * 1-5'  },
          { path: '/api/cron/notify?type=journal_reminder',   schedule: '25 10 * * 1-5' },
          { path: '/api/cron/notify?type=journal_warning',    schedule: '25 11 * * 1-5' },
          { path: '/api/cron/score',                          schedule: '30 11 * * 1-5' },
          { path: '/api/cron/notify?type=evening_planning',   schedule: '30 14 * * 1-5' },
          { path: '/api/cron/lock-journals',                  schedule: '0 4 * * *'     }
        ]
```

### IST ↔ UTC Schedule Reference

```
08:30 AM IST = 03:25 UTC → '25 3 * * 1-5'
09:00 AM IST = 03:55 UTC → '55 3 * * 1-5'
04:00 PM IST = 10:25 UTC → '25 10 * * 1-5'
05:00 PM IST = 11:25 UTC → '25 11 * * 1-5'    (notification)
05:00 PM IST = 11:30 UTC → '30 11 * * 1-5'    (score cron — 5 min after notify)
08:00 PM IST = 14:30 UTC → '30 14 * * 1-5'
09:30 AM IST = 04:00 UTC → '0 4 * * *'        (journal lock — daily)
```

> **Gate:** Manually call each cron endpoint with correct `CRON_SECRET` header. Each returns expected JSON. Push notification arrives in browser. Email notification arrives in inbox. `behavioral_events` shows `notification_sent` events.  
> **Do not proceed to Phase 19 until this gate clears.**

---

## Phase 19 — Dashboard & Deployment

**Why last:** Dashboard aggregates data from every other feature. Build it last — it's a read-only projection. Deployment is last because the app must be feature-complete.

### Components (in order)

```
1.  components/dashboard/MetricCard.tsx
    ├── Props: label, value, sublabel, color, icon, linkTo
    └── Uses: Card from Phase 06

2.  components/dashboard/DailyLoopProgress.tsx
    ├── 5 steps: Check-in → Contract → [Trade] → Journal → Score
    ├── Each step derives state from today's session data
    ├── Clickable — navigates to relevant page
    └── Current step highlighted with brand-primary color

3.  components/dashboard/BudgetBar.tsx
    └── Remaining daily loss budget as colored progress bar
        Red if < 20% remaining, amber if < 50%
```

### Pages (in order)

```
1.  app/page.tsx (Dashboard — the protected root)
    ├── Single server-side fetch: today's daily_sessions (joined or parallel)
    ├── 6 metric cards:
    │   ├── Readiness Score (from session.readiness_score)
    │   ├── Discipline Score (from session.score_total — null-safe)
    │   ├── Trades (session.trades_taken / contract_max_trades)
    │   ├── Budget Remaining (computed from contract + realized_pnl)
    │   ├── Today's P&L (session.realized_pnl_inr)
    │   └── 7-day Score Chart (last 7 score_totals)
    ├── DailyLoopProgress component
    ├── "Calculate Score" button → calls /api/score/calculate → updates Discipline card
    └── Suspense boundaries around each section
```

### Deployment (in order)

```
1.  Vercel project creation
    ├── Connect GitHub repository
    ├── Set all env vars (production environment)
    └── Enable preview deployments

2.  Production Supabase setup
    ├── Run all 7 migrations on production project
    ├── Verify all RLS policies via Supabase dashboard
    ├── Configure Google OAuth callback URL to production domain
    ├── Customize email templates (signup confirmation)
    └── Enable PgBouncer

3.  Domain + DNS
    ├── Add domain in Vercel
    ├── Configure Cloudflare DNS
    └── Verify HTTPS + www redirect

4.  Production smoke test (full daily loop)
    └── Sign up → onboarding → check-in → contract → intent → journal → score → notification
```

> **Gate:** Full end-to-end daily loop works on production domain with real users. All 7 cron jobs visible in Vercel dashboard. Push notification received on production. No P0 bugs.

---

## Complete File Creation Sequence

For a solo founder who needs to know exactly what to open next:

```
PHASE 01 — SCAFFOLD
 1  package.json
 2  next.config.ts
 3  tsconfig.json
 4  tailwind.config.ts
 5  postcss.config.mjs
 6  .gitignore
 7  .env.example
 8  .env.local
 9  README.md

PHASE 02 — TYPES
10  lib/constants.ts
11  lib/utils.ts
12  lib/types.ts
13  lib/validations.ts

PHASE 03 — DATABASE
14  supabase/migrations/001_profiles.sql
15  supabase/migrations/002_playbook_setups.sql
16  supabase/migrations/003_daily_sessions.sql
17  supabase/migrations/004_trades.sql
18  supabase/migrations/005_behavioral_events.sql
19  supabase/migrations/006_push_subscriptions.sql
20  supabase/seed.sql

PHASE 04 — SUPABASE CLIENTS
21  lib/supabase/client.ts
22  lib/supabase/server.ts
23  lib/supabase/middleware.ts

PHASE 05 — MIDDLEWARE
24  middleware.ts
25  app/auth/callback/route.ts

PHASE 06 — UI PRIMITIVES
26  components/ui/Button.tsx
27  components/ui/Input.tsx
28  components/ui/Select.tsx
29  components/ui/Slider.tsx
30  components/ui/Toggle.tsx
31  components/ui/Card.tsx
32  components/ui/Badge.tsx
33  components/ui/ProgressBar.tsx
34  components/ui/Skeleton.tsx
35  components/ui/Modal.tsx
36  components/ui/Toast.tsx
37  components/ui/ScoreGauge.tsx

PHASE 07 — APP SHELL
38  app/globals.css
39  app/layout.tsx
40  components/layout/Navigation.tsx
41  components/layout/AppShell.tsx
42  app/(protected)/layout.tsx
43  app/error.tsx
44  app/not-found.tsx

PHASE 08 — AUTH
45  app/auth/login/page.tsx
46  app/auth/signup/page.tsx
47  app/onboarding/profile/page.tsx
48  app/onboarding/playbook/page.tsx
49  app/settings/page.tsx             ← stub (logout only)

PHASE 09 — NOTIFICATION LAYER
50  lib/notifications/types.ts
51  lib/notifications/channels/email.ts
52  lib/notifications/channels/push.ts
53  lib/notifications/channels/whatsapp.ts   ← stub (Phase 2)
54  lib/notifications/channels/telegram.ts   ← stub (Phase 2)
55  lib/notifications/dispatcher.ts

PHASE 10 — SETTINGS
56  app/api/notifications/subscribe/route.ts
57  app/settings/page.tsx             ← full replace of stub

PHASE 11 — PLAYBOOKS
58  components/playbook/SetupForm.tsx
59  components/playbook/SetupCard.tsx
60  app/playbook/page.tsx

PHASE 12 — MORNING CHECK-IN
61  components/checkin/ReadinessSlider.tsx
62  components/checkin/ReadinessResult.tsx
63  app/checkin/page.tsx
64  components/layout/Navigation.tsx  ← update: add status dot logic

PHASE 13 — COMMITMENT CONTRACT
65  components/contract/ContractForm.tsx
66  components/contract/ContractSummary.tsx
67  app/contract/page.tsx

PHASE 14 — SCORE ENGINE LIBRARY
68  lib/score-engine.ts

PHASE 15 — INTENT ENGINE
69  app/api/intent/validate/route.ts
70  app/api/intent/[intent_id]/override/route.ts
71  components/intent/IntentForm.tsx
72  components/intent/ValidationResult.tsx
73  components/intent/IntentHistory.tsx
74  app/intent/page.tsx

PHASE 16 — JOURNAL
75  app/api/cron/lock-journals/route.ts
76  components/journal/PsychTag.tsx
77  components/journal/TradeForm.tsx
78  components/journal/TradeList.tsx
79  components/journal/DailyPnLSummary.tsx
80  app/journal/new/page.tsx
81  app/journal/[date]/page.tsx

PHASE 17 — SCORE API & UI
82  app/api/score/calculate/route.ts
83  app/api/cron/score/route.ts
84  components/score/ScoreBreakdown.tsx
85  components/score/ScoreChart.tsx
86  app/score/page.tsx

PHASE 18 — NOTIFICATION CRON
87  app/api/cron/notify/route.ts
88  vercel.json

PHASE 19 — DASHBOARD & DEPLOY
89  components/dashboard/MetricCard.tsx
90  components/dashboard/DailyLoopProgress.tsx
91  components/dashboard/BudgetBar.tsx
92  app/page.tsx                      ← Dashboard (the protected root)
```

**Total: 92 files. No file needs to be rewritten because of a later file.**

---

## Rework Prevention Summary

| Common Mistake | How This Order Prevents It |
|---|---|
| Schema changes after API built | DB finalized in Phase 03, before first API route in Phase 15 |
| API shape changes after UI built | Every API route built before its UI component (15→71, 17→82) |
| Type mismatches across files | `lib/types.ts` in Phase 02 — imported by everything |
| Copy-pasted notification code | Dispatcher built in Phase 09 — features just call it |
| Dashboard shows wrong data | Built last (Phase 19) — all data sources exist |
| IST timezone bugs | `lib/utils.ts` in Phase 02 — `todayIST()` used everywhere |
| Score algorithm changes break history | Event Sourcing from Day 1 — DB in Phase 03 captures events, score derived from events |
| UI primitives inconsistent | All primitives in Phase 06, before any feature UI |
| Score Engine coupled to API | `lib/score-engine.ts` is a pure library (Phase 14), API routes import it (Phase 17) |
| Onboarding blocks features | Auth + onboarding complete (Phase 08) before any feature module |

---

*End of Document*

**TradingOS Build Order v1.0 | June 2026**  
**92 files · 19 phases · Zero rework if followed in sequence**
