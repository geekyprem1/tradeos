# CONTEXT_LOCK.md

## 1. Product Vision
TradingOS is a **Behavior Change System (a Trading Discipline Operating System)**, not a conventional trading journal. It acts as a proactive psychological layer between the trader's mind and the market, engineering consistent execution of a defined edge by making disciplined trading the path of least resistance. 

## 2. Core Value Proposition
Traditional platforms are reactive data repositories. TradingOS intervenes **before** a bad trade is executed via the Trade Intent Gate. It enforces pre-market psychological readiness and post-market reflection, aiming to solve the behavioral failures (FOMO, revenge trading, overtrading) that cause 90%+ of retail traders to lose money.

## 3. Non-Negotiable Product Rules
*   **Event-Sourced Discipline Score:** The Discipline Score must be dynamically derived from an immutable `behavioral_events` append-only log. It is NEVER stored as a mutable primary field. 
*   **Server-Side Intent Validation:** The Trade Intent Engine validation and score derivation must run entirely server-side (API routes/cron) to prevent client-side manipulation.
*   **Journal Immutability:** Trade journal entries must become strictly immutable (locked via database trigger) after 24 hours.
*   **Supabase-First CRUD:** All standard data fetching and mutations must happen directly from the Next.js Client via Supabase SDK with Row-Level Security (RLS). API routes are exclusively for complex business logic, cron jobs, and external APIs.

## 4. Non-Negotiable UX Rules
*   **Psychology-Driven Color System:** Mandatory use of specific functional colors (Emerald Green for discipline, Warning Amber for caution, Crimson Red for emotional threats, Deep Space Navy for the main canvas).
*   **Maximum Cognitive Clarity (Anti-Bloat):** Complex charting libraries, high-density data matrices, live streaming watchlists, and intrusive broker prompts are **strictly forbidden**. Dark mode is mandatory from Day 1.
*   **Friction as a Feature:** The UI must introduce calculated friction before risky trades rather than optimizing for fast execution.

## 5. Architecture Constraints
*   **Frontend:** Next.js 15 (App Router), React Server Components, Tailwind CSS v3, Zustand, React Hook Form + Zod.
*   **Backend:** Supabase (PostgreSQL 15 + Auth + RLS), Vercel Edge/Cron.
*   **Abstraction Layers:** Must implement provider-agnostic interfaces for Notifications (`dispatcher.ts`) and AI (`provider.ts`) to avoid vendor lock-in and enable smooth Phase 2 transitions.
*   **Build Order:** Strict adherence to: Types -> Database -> Server Lib -> API -> UI primitives -> Feature UI. No phase begins until the previous one is verified.

## 6. Features Explicitly Excluded
*   Automated Trade Execution (scope creep / regulatory risk).
*   Strategy Backtesting Engines.
*   Social Feeds, Community Chat, or Copy Trading.
*   Beginners' Strategy Education courses.
*   The AI Accountability Coach (strictly excluded from MVP; requires a 30-day user data baseline).

## 7. MVP Scope (30-Day Launch)
*   **Dynamic Onboarding AI Profiling:** Capturing capital, style, and risk boundaries.
*   **Playbook Creation Engine:** Form-based setup creator.
*   **Morning Psychological Check-in:** 5-question emotional assessment to compute a Readiness Score.
*   **Daily Commitment Contract:** Digital sign-off on max trades, max loss, and allowed setups.
*   **Trade Intent Engine:** Pre-trade gatekeeper (Go/Caution/No-Go validation).
*   **Multi-Dimensional Trade Journal:** Post-trade logging with psychological tags.
*   **Discipline Score Framework:** Daily scoring across 5 weighted pillars.
*   **Chronological Notification Engine:** Web push/email reminders.
*   **Dashboard:** Central command post displaying scores and daily limits.

## 8. Phase 2 Scope (Days 31–90)
*   Pre-Market Analysis Module (mandatory planning gate).
*   Market Close Reflection Loop (deep-dive analytical questions).
*   Evening Blueprint (next-day planning).
*   Psychology Score Mapping/Analytics Panel.
*   Behavioral Escalation Engine (multi-level consequence framework).
*   AI Accountability Coach (pattern recognition LLM).
*   Gamified Streak & Consistency Score.

## 9. Phase 3 Scope (Days 91–180)
*   Broker API Integration (Zerodha, AngelOne, Groww).
*   Mobile App (iOS/Android).
*   Accountability Partner System (social gamification).
*   Prop Firm / Multi-Trader Dashboard (B2B).
*   AI Playbook Recommendation Engine.

## 10. Risks That Could Cause Product Drift (Conflicts & Missing Decisions)

> [!NOTE] 
> **RESOLVED: UX Input Methodology (Dropdowns vs Tactile Cards)**
> *   **Resolution:** UX Deck wins. No dropdowns allowed in Morning Check, Trade Intent, or Journal flows. Use cards, pills, chips, segmented controls, and tactile selection patterns.

> [!NOTE]
> **RESOLVED: Trade Intent "Hard Lock" vs "Soft Gate"**
> *   **Resolution:** Hybrid model. If FOMO, Revenge, or Random is selected, trigger a 60-second psychological braking screen, require acknowledgement, and then allow "Proceed Anyway". No permanent execution blocks.

> [!NOTE]
> **RESOLVED: Language & Localization**
> *   **Resolution:** MVP is English-only. Localization is deferred to Phase 2.

> [!NOTE]
> **RESOLVED: Readiness Score Weighting**
> *   **Resolution:** Sleep 25%, Energy 25%, Focus 20%, Motivation 20%, Stress 10% (inverse).
