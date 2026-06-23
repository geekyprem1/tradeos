# TradingOS — Product Requirements Document (PRD)
**Version:** 1.0 | **Date:** June 2026 | **Status:** APPROVED FOR DEVELOPMENT  
**Prepared by:** Senior Product Management & Principal Architecture Review  
**Classification:** Internal — Startup Engineering Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision](#2-product-vision)
3. [Core Problem Statement](#3-core-problem-statement)
4. [Target Users](#4-target-users)
5. [User Personas](#5-user-personas)
6. [User Journey](#6-user-journey)
7. [Feature Breakdown (MoSCoW)](#7-feature-breakdown-moscow)
8. [MVP Scope — 30-Day Launch](#8-mvp-scope--30-day-launch)
9. [Phase 2 Features](#9-phase-2-features)
10. [Phase 3 Features](#10-phase-3-features)
11. [Functional Requirements](#11-functional-requirements)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [User Stories](#13-user-stories)
14. [Acceptance Criteria](#14-acceptance-criteria)
15. [Success Metrics](#15-success-metrics)
16. [Risks and Mitigations](#16-risks-and-mitigations)
17. [Monetization Strategy](#17-monetization-strategy)
18. [Competitive Advantages](#18-competitive-advantages)
19. [Technical Recommendations](#19-technical-recommendations)

---

## 1. Executive Summary

TradingOS is a **Behavior Change SaaS** — a Trading Discipline Operating System — designed to address the single greatest cause of retail trader failure: **the gap between knowing what to do and consistently doing it**.

The platform is **not a trading journal**. It is a proactive behavioral infrastructure that wraps around a trader's entire day — from pre-market psychological readiness to post-market reflection — enforcing discipline, accountability, and rule adherence through AI-driven nudges, gamification, and a proprietary Discipline Score.

**Market Opportunity:** India's retail trading population exceeded 50 million active accounts by 2025, with SEBI data indicating that 90%+ of F&O traders lose money. The primary cause is behavioral, not analytical. No existing product addresses this gap at the operating-system layer.

**MVP Target:** 30-day launch. Single-player web application with core discipline loop — Psychological Check-in → Commitment Contract → Trade Intent Gate → Multi-dimensional Journal → Discipline Score.

**Business Model:** Freemium SaaS. Free tier for onboarding and basic journaling; Pro tier (₹799–₹1,499/month) for AI coaching, full Discipline Score, and broker integrations.

---

## 2. Product Vision

> **"Make disciplined trading the path of least resistance — not the exception."**

TradingOS will become the **operating layer** between a trader's mind and the market. Where trading platforms help you *execute*, TradingOS helps you *decide whether to execute and why*.

The system is designed around one foundational thesis:

> Profitable trading is a *behavioral outcome* of consistent execution of a defined edge. TradingOS engineers that consistency.

**5-Year Vision:** Become the #1 behavioral intelligence platform for retail traders in India, expanding into global markets and institutional desk compliance tooling.

---

## 3. Core Problem Statement

### The Real Problem: Behavior, Not Strategy

> [!IMPORTANT]
> 90%+ of retail traders have read books, watched YouTube tutorials, and know what a stop-loss is. They still blow their accounts. The problem is **not** strategy — it is the inability to execute that strategy consistently under emotional pressure.

**Specific Behavioral Failure Modes:**

| Failure Mode | What Happens |
|---|---|
| **Revenge Trading** | After a loss, trader abandons rules and over-leverages to recover. |
| **FOMO Trades** | Trader enters unplanned setups driven by fear of missing a move. |
| **Overtrading** | Trader exceeds self-defined trade limits, eroding edge via cost drag. |
| **Pre-Market Skipping** | No planning → reactive, emotional decisions all day. |
| **Incomplete Reflection** | No post-trade logging → same mistakes repeat in infinite loops. |
| **Playbook Violation** | Trader takes setups outside their defined edge, chasing noise. |

### Why Existing Tools Fail

- **Trading Journals (Trademetria, Chartlog, TraderVue):** Reactive — they only record after the damage is done. No behavioral intervention layer.
- **Trading Platforms (Zerodha Kite, AngelOne):** Focused purely on execution. Zero behavioral context.
- **Trading Communities/Discord:** Social reinforcement with zero accountability infrastructure.
- **Coaching/Mentors:** High cost, not scalable, not data-driven.

### The Gap TradingOS Fills

TradingOS intervenes **before** the bad trade is taken — not after.

---

## 4. Target Users

### Primary Market

**Retail Traders in India (F&O, Equity Intraday, Swing)**
- Trading capital: ₹50,000 – ₹25,00,000
- Experience: 6 months to 5 years
- Pain: Knows their edge, cannot execute it consistently
- Spends: ₹500–₹3,000/month on courses, tools, data feeds

### Secondary Market (Phase 2+)

- **International retail traders** (US, UAE, Southeast Asia)
- **Prop trading firms** managing junior trader compliance
- **Trading coaches and educators** who want to give clients structured accountability tools

### Anti-Target (Cut Scope Now)

> [!WARNING]
> TradingOS is **NOT** for:
> - Algorithmic/quant traders (they already have automated guardrails)
> - Beginners who don't yet have a defined strategy (they need education, not discipline tools)
> - Investors with multi-week holding periods (the behavioral loop doesn't apply)

Targeting beginners in MVP will dilute the value prop and cause high churn. The product speaks most powerfully to traders who already *know better* but still *do worse*.

---

## 5. User Personas

### Persona 1 — Arjun, The Inconsistent Profitable Trader
| Attribute | Detail |
|---|---|
| **Age** | 28 |
| **Occupation** | Full-time intraday trader (NSE F&O) |
| **Experience** | 3 years |
| **Capital** | ₹5,00,000 |
| **Tech Comfort** | High |
| **Quote** | *"My strategy works. I just can't stop myself from revenge trading after a bad morning."* |
| **Goals** | Build consistent monthly returns; stop repeating the same emotional mistakes |
| **Pain Points** | No structured pre-market routine; blows stop-losses under pressure; great weeks followed by disaster weeks |
| **Willingness to Pay** | ₹999–₹1,499/month for a tool that actually changes his behavior |

---

### Persona 2 — Priya, The Rule-Aware but Rule-Breaking Swing Trader
| Attribute | Detail |
|---|---|
| **Age** | 34 |
| **Occupation** | IT professional + part-time swing trader |
| **Experience** | 2 years |
| **Capital** | ₹2,50,000 |
| **Tech Comfort** | Medium |
| **Quote** | *"I write rules in my notebook. I break them every other week when the market moves."* |
| **Goals** | Create accountability so she stops making emotionally-driven exits |
| **Pain Points** | No one holding her accountable; no way to track *why* she deviated from her plan |
| **Willingness to Pay** | ₹499–₹799/month |

---

### Persona 3 — Vikram, The Overtrader
| Attribute | Detail |
|---|---|
| **Age** | 22 |
| **Occupation** | Recent graduate, full-time trader |
| **Experience** | 1 year |
| **Capital** | ₹1,00,000 |
| **Tech Comfort** | Very High |
| **Quote** | *"I always tell myself: just one more trade. Then the day ends and I'm down 5%."* |
| **Goals** | Enforce daily trade limits; stop overtrading; grow capital |
| **Pain Points** | No circuit-breaker before impulse trades; no visibility into behavioral patterns |
| **Willingness to Pay** | Free tier first; converts to ₹499 if he sees improvement within 30 days |

---

## 6. User Journey

### The TradingOS Daily Loop

```
[NIGHT BEFORE]
  └─ Evening Planning → Blueprint tomorrow's watchlist & rules
  └─ Commitment Contract signed for next day

[MORNING — PRE-MARKET]
  └─ Psychological Check-in → Readiness Score generated
  └─ Pre-Market Analysis → Bias, levels, expected setups logged
  └─ Daily Commitment Contract reviewed and locked

[DURING MARKET HOURS]
  └─ Trade Intent Engine → Gatekeeper BEFORE each trade
      ├─ Validates: Is this in the Playbook?
      ├─ Checks: Is daily loss limit hit?
      └─ Shows: Historical win rate for this setup
  └─ Real-time Notification Engine → Reminders and warnings

[POST-MARKET]
  └─ Trade Journal → Each trade logged with P&L + psychology tags
  └─ Market Close Reflection → Deep-dive questions on best/worst trades
  └─ Discipline Score updated → Visible progress metric

[EVENING]
  └─ Evening Blueprint for tomorrow
  └─ AI Coach Weekly Summary (Pro tier) → Pattern blindspots surfaced
```

### Emotional Arc

The system is designed so the trader **feels the friction** before a bad trade and **feels the reward** for completing the discipline loop. This is the core UX psychology — negative reinforcement (friction gate before impulse trade) and positive reinforcement (streak, score increase).

---

## 7. Feature Breakdown (MoSCoW)

### MUST HAVE — MVP Core Loop

| # | Feature | Rationale |
|---|---|---|
| M1 | Onboarding AI Profiling | Sets the behavioral baseline; without it, all other features lack personalization |
| M2 | Playbook Creation Engine | The rule book. If we can't capture the trader's edge, we can't detect violations |
| M3 | Morning Psychological Check-in | Readiness Score is the first intervention of the day |
| M4 | Daily Commitment Contract | Written psychological commitment dramatically increases adherence |
| M5 | Trade Intent Engine (Gatekeeper) | THE killer feature — pre-trade friction and warning. Highest behavioral ROI |
| M6 | Multi-Dimensional Trade Journal | Core data capture — without this, AI coaching is impossible |
| M7 | Discipline Score Framework | The master metric. The single number users will optimize for |
| M8 | Notification Engine | Drives habit formation; without it, users forget the loop |

### SHOULD HAVE — Phase 2

| # | Feature | Rationale |
|---|---|---|
| S1 | Pre-Market Analysis Module | Strengthens the planning discipline; adds to score weighting |
| S2 | Market Close Reflection Loop | Closes the daily behavioral loop; enables pattern discovery |
| S3 | Evening Blueprint | Night-before planning prevents morning chaos |
| S4 | Psychology Score Mapping | Quantifies emotional state over time; powerful retention hook |
| S5 | Behavioral Escalation Engine | Automated consequence system for rule violations |
| S6 | AI Accountability Coach | Highest-value feature; requires data accumulation from S6+ weeks |
| S7 | Gamified Streak & Consistency Score | Retention flywheel; drives daily active use |

### COULD HAVE — Phase 3

| # | Feature | Rationale |
|---|---|---|
| C1 | Broker API Integration (Zerodha, AngelOne) | Real-time trade sync; eliminates manual logging friction |
| C2 | Community/Accountability Partners | Social accountability layer; significant UX lift |
| C3 | Mobile App (iOS/Android) | Increases notification efficacy; needed for full-day engagement |
| C4 | Prop Firm Multi-User Dashboard | B2B revenue stream; compliance use case |
| C5 | Custom AI Playbook Suggestions | AI recommends setup configurations based on market conditions |

### WON'T HAVE (This Cycle)

| # | Feature | Why Cut |
|---|---|---|
| W1 | Automated Trade Execution | Scope creep into brokerage territory; regulatory minefield |
| W2 | Strategy Backtesting Engine | Different product entirely; attracts wrong user segment |
| W3 | Social Feed / Content Platform | Dilutes the behavioral focus; competes with Discord |
| W4 | Copy Trading | Legal and compliance risk; out of scope |
| W5 | Beginners' Strategy Education | Different ICP; competes with learning platforms |

> [!CAUTION]
> **Challenge: The AI Coach (System 15) should NOT be in MVP.** Building an LLM layer before you have 4–8 weeks of per-user behavioral data will produce generic, low-confidence outputs that erode trust. The coach needs data to be useful. Ship it in Phase 2 after data density exists.

---

## 8. MVP Scope — 30-Day Launch

### MVP Goal

> Ship the smallest coherent behavioral loop that delivers measurable value on Day 1. The MVP is a **discipline enforcement web app** — not an AI platform.

### MVP Feature Set

| Feature | Description | Priority |
|---|---|---|
| **Onboarding Profiler** | 10-screen onboarding capturing capital, style, risk limits, and 3 playbook setups | MUST |
| **Playbook Builder** | Simple form-based setup creator (up to 5 setups; name, entry rules, R:R, filters) | MUST |
| **Morning Check-in** | 5-question emotional readiness form → Readiness Score (0–100%) → color-coded status | MUST |
| **Commitment Contract** | Daily digital contract: Max trades, Max loss, Allowed setups, Forbidden conditions | MUST |
| **Trade Intent Engine** | Pre-trade form: Setup selected, Risk amount, R:R → Validates against playbook + daily limits → Go/No-Go signal | MUST |
| **Trade Journal** | Post-trade log: Entry, Exit, P&L, Setup used, Psychology tag (dropdown: Focus/FOMO/Revenge/Fear/Greed) | MUST |
| **Discipline Score** | Daily score (0–100) with 5 weighted pillars; visible dashboard card; 7-day trend chart | MUST |
| **Notification Engine** | 5 scheduled push/email reminders per the chronological framework (8:30, 9:00, 4:00, 5:00, 8:00 PM) | MUST |
| **User Auth** | Email/password signup + Google OAuth | MUST |
| **Dashboard** | Today's Readiness Score, Discipline Score, Trade count vs limit, remaining loss budget | MUST |

### MVP Out of Scope (Hard Cuts)

- AI Accountability Coach → Phase 2
- Psychology Score trend analytics → Phase 2
- Broker API integrations → Phase 3
- Mobile app → Phase 3
- Escalation engine (multi-level) → Phase 2
- Streak/gamification → Phase 2 (but streak counter is a **fast follow** in Week 5)

### 30-Day Build Timeline (High Level)

| Week | Deliverable |
|---|---|
| Week 1 | Auth, Onboarding Profiler, Playbook Builder |
| Week 2 | Morning Check-in, Commitment Contract, Notification Engine |
| Week 3 | Trade Intent Engine (gatekeeper), Trade Journal |
| Week 4 | Discipline Score Engine, Dashboard, QA, Beta onboarding (10–20 users) |

---

## 9. Phase 2 Features

**Timeline:** Days 31–90 (Months 2–3)

### P2.1 — Pre-Market Analysis Module
Structured form for Market Bias, Key Levels (support/resistance), Watchlist, Expected Playbook setup for the day. Mandatory pre-market gate — affects Discipline Score if skipped.

### P2.2 — Market Close Reflection Loop
1-hour post-market window with 4 deep-dive mandatory questions:
- Best trade of the day — why?
- Worst trade — what went wrong?
- Were rules followed? If not, what triggered the deviation?
- Key lesson learned.

Responses stored, searchable, and fed into AI coach (P2.6).

### P2.3 — Evening Blueprint
Night-before planning: Watchlist for tomorrow, max trade count locked, special rules for next session. Reduces morning decision fatigue.

### P2.4 — Psychology Score Analytics Panel
Emotional tag data from trade journals aggregated into a weekly psychology heatmap. Shows correlation between emotional state and trade outcome. E.g., "Your FOMO-tagged trades have a -₹1,200 average PnL. Your 'Focus'-tagged trades average +₹2,400."

### P2.5 — Behavioral Escalation Engine
Multi-level consequence framework for rule violations:
- Level 1 → Standard Reminder
- Level 2 → Strict Warning (prominent UI banner)
- Level 3 → Critical Alert (email + push)
- Level 4 → Discipline Score deduction
- Level 5 → Red Account Status Advisory (trading pause recommendation)

### P2.6 — AI Accountability Coach
**Minimum data requirement before activation: 30 days of logged trades.**

Weekly AI-generated insight report highlighting:
- Behavioral pattern blindspots (e.g., "6 of your last 10 losses followed your first daily loss — revenge trading pattern detected")
- Setup performance comparison (playbook vs. off-playbook)
- Readiness Score correlation with trade outcome

Use a fine-tuned LLM (GPT-4o or Claude) with structured prompt engineering over user's behavioral data. Do NOT use generic financial advice.

### P2.7 — Gamified Streak & Consistency Engine
- Visible daily streak counter
- Streak badges at milestones (7, 21, 45, 90 days)
- Consistency score separate from Discipline Score
- Streak lost if morning check-in OR journal is missed

---

## 10. Phase 3 Features

**Timeline:** Days 91–180 (Months 4–6)

### P3.1 — Broker API Integration
Priority integrations: **Zerodha (Kite Connect)**, **AngelOne (SmartAPI)**, **Groww**.

Enables:
- Automatic trade import → eliminates manual journal entry friction
- Real-time daily loss limit monitoring → live gatekeeper
- P&L sync for Discipline Score calculation

> [!WARNING]
> Broker APIs require formal API key management, SEBI compliance review, and terms of service alignment with each broker. Begin legal groundwork in Phase 2 planning.

### P3.2 — Mobile App (React Native / Flutter)
Priority: Push notifications are the #1 retention driver for this product. A mobile app dramatically increases notification click-through rates vs. web push.

MVP mobile scope: Notifications + Morning Check-in + Trade Intent Engine. Full feature parity in a later release.

### P3.3 — Accountability Partner System
Opt-in pairing or small group (2–4 traders) for mutual accountability. Weekly Discipline Score shared with partner(s). Gamified leaderboard within the group.

### P3.4 — Prop Firm / Multi-Trader Dashboard
B2B product for prop trading firms or trading coaches managing 5–50 traders. Dashboard shows aggregate Discipline Scores, rule violation alerts, and at-risk trader flagging.

### P3.5 — AI Playbook Recommendation Engine
Based on a trader's historical win rate by setup type, time of day, and market condition — the AI proactively suggests playbook refinements.

---

## 11. Functional Requirements

### FR-01: User Authentication
- System shall support email/password registration and Google OAuth sign-in.
- System shall enforce email verification before access to core features.
- System shall support password reset via email.

### FR-02: Onboarding Profiler
- System shall collect: capital base, market type (Equity/F&O/Crypto/Commodity), trading style (Scalping/Intraday/Swing), risk per trade (₹), daily loss limit (₹), max trades per day (integer).
- System shall not allow core features until onboarding is complete.
- System shall allow user to update profile settings post-onboarding.

### FR-03: Playbook Builder
- System shall allow creation of minimum 1, maximum 10 trading setups.
- Each setup shall capture: Setup Name, Entry Conditions (free text + tags), Timeframe, Minimum R:R Ratio, Volume/Trend filters (optional).
- System shall allow editing and archiving (soft delete) of setups.

### FR-04: Morning Psychological Check-in
- System shall present 5 readiness questions (Sleep Quality, Stress Level, Energy, Focus, Motivation) on a 1–10 scale.
- System shall compute a Readiness Score (weighted average, normalized to 0–100%).
- System shall display a color-coded status: Green (70%+), Yellow (40–69%), Red (<40%).
- System shall display a contextual AI message based on score range.
- System shall not allow Commitment Contract to be signed until Check-in is complete.

### FR-05: Daily Commitment Contract
- System shall require daily sign-off of: Max trades today, Max daily loss (₹), Allowed setups (multi-select from Playbook), Forbidden conditions (free text).
- System shall timestamp and persist the contract per session date.
- System shall use the signed contract values in Trade Intent Engine validations throughout the day.

### FR-06: Trade Intent Engine
- System shall present a pre-trade form: Setup (dropdown from Playbook), Risk Amount (₹), R:R Ratio.
- System shall validate against: (a) Is setup in today's allowed setups from Contract? (b) Will this trade's risk exceed remaining daily loss budget? (c) Will this trade exceed max trade count?
- System shall display a Go / Caution / No-Go recommendation with rationale.
- System shall log the intent submission regardless of user's subsequent action.
- System shall NOT hard-block the user — it is an advisory gate, not a lock. (Enforced soft-block with friction, not hard technical block.)

### FR-07: Trade Journal
- System shall allow post-trade logging with: Entry Price, Exit Price, Quantity, Setup Used (linked to Playbook), Outcome (P&L in ₹), Psychology Tag (Fear / FOMO / Greed / Revenge / Restlessness / Focus / Confident), Notes (free text).
- System shall auto-calculate P&L if Entry, Exit, and Quantity are provided.
- System shall allow editing of journal entries within the same trading day.
- System shall not allow deletion of journal entries (preserves data integrity for behavioral analysis).

### FR-08: Discipline Score Engine
- System shall compute a daily Discipline Score (0–100) based on five pillars:
  - Pre-Market Analysis Completed: +20 pts (Phase 2; during MVP, Morning Check-in + Contract = +20 pts)
  - Journal Completion: +20 pts
  - Rules & Playbook Adherence: +30 pts (based on intent engine usage and tagged violations)
  - No Revenge Trading: +20 pts (auto-detected via psychology tags and post-loss trade patterns)
  - Evening Planning: +10 pts (Phase 2; during MVP, awarded for any evening activity)
- System shall display daily score, 7-day rolling average, and historical chart.
- System shall recalculate score at end of each trading day (5:00 PM IST by default).

### FR-09: Notification Engine
- System shall send scheduled notifications at:
  - 08:30 AM: "Complete your Pre-Market Routine"
  - 09:00 AM (if morning check-in pending): "Trading Plan Pending — Required before market open"
  - 04:00 PM: "Write your Post-Market Journal"
  - 05:00 PM (if journal pending): "Journal Incomplete — Data gap risk"
  - 08:00 PM: "Tomorrow's Planning — Blueprint your next session"
- System shall support both web push notifications and email fallback.
- System shall allow users to configure notification times and opt-out of individual notifications.

### FR-10: Dashboard
- System shall display on the main dashboard: Today's Readiness Score, Today's Discipline Score, Trades Taken vs. Limit (e.g., 2/3), Remaining Daily Loss Budget (e.g., ₹1,200 remaining of ₹3,000), Today's P&L, 7-day Discipline Score chart.

---

## 12. Non-Functional Requirements

### NFR-01: Performance
- Dashboard initial load: < 2 seconds (p95) on standard broadband.
- Trade Intent Engine validation response: < 500ms.
- Notification delivery: Within ±5 minutes of scheduled time.

### NFR-02: Reliability
- System uptime: 99.5% monthly SLA (excluding planned maintenance).
- Data loss tolerance: Zero. All trade journal entries and behavioral data must be persisted with daily backups.
- Trading day hours (9:00 AM – 3:30 PM IST) are critical windows — zero degraded service during these hours.

### NFR-03: Security
- All user financial data encrypted at rest (AES-256) and in transit (TLS 1.3+).
- PII data (email, capital figures) stored in compliance with IT Act 2000 (India) and DPDP Act 2023.
- No sale or sharing of user trading data with third parties without explicit consent.
- Session tokens expire after 24 hours of inactivity.

### NFR-04: Scalability
- MVP: Design for 0–500 concurrent users.
- Phase 2: System should scale horizontally to 5,000 concurrent users without re-architecture.

### NFR-05: Usability
- Onboarding completion rate target: >80% (reduce drop-off through progress indicators and skip options for non-critical fields).
- Mobile-responsive web design: Fully functional on screens 375px wide and above.
- All core daily actions (Check-in, Intent Engine, Journal) completable in under 3 minutes each.

### NFR-06: Data Integrity
- Each trade journal entry is immutable after 24 hours (prevent data manipulation for vanity metrics).
- Discipline Score calculations must be auditable — users can see the raw inputs that produced their score.

---

## 13. User Stories

### Epic 1: Onboarding & Setup

**US-001** — As a new trader, I want to set up my risk profile during onboarding so that TradingOS knows my trading boundaries from Day 1.

**US-002** — As a trader, I want to create and save my trading setups in a Playbook so that TradingOS can validate my trades against my own rules.

**US-003** — As a trader, I want to update my risk parameters (daily loss limit, max trades) when my account size changes so that my guardrails stay relevant.

---

### Epic 2: Daily Discipline Loop

**US-004** — As a trader, I want to complete a morning emotional check-in so that I know my readiness state before I start trading.

**US-005** — As a trader, I want to sign a daily Commitment Contract so that I have a written record of the rules I'm committing to today.

**US-006** — As a trader, I want to be warned if my morning check-in shows low readiness (Red status) so that I can choose to trade with reduced size or sit out.

---

### Epic 3: Trade Intent Engine

**US-007** — As a trader, I want to declare my intent before each trade so that I'm forced to consciously validate it against my playbook before executing.

**US-008** — As a trader, I want to see a Go/Caution/No-Go recommendation from TradingOS before I trade so that I have a behavioral circuit-breaker for impulse trades.

**US-009** — As a trader, I want to be alerted when my daily loss limit is nearly reached so that I don't accidentally breach my risk rules.

**US-010** — As a trader, I want to see my historical win rate for each setup in the Intent Engine so that I can make data-informed decisions in real time.

---

### Epic 4: Trade Journal

**US-011** — As a trader, I want to log each trade post-execution with psychology tags so that I can track the emotional context of every trade.

**US-012** — As a trader, I want to see all my trades for today in a summary so that I can quickly review my session performance.

---

### Epic 5: Discipline Score & Dashboard

**US-013** — As a trader, I want to see my Discipline Score at the end of each day so that I know how well I adhered to my rules.

**US-014** — As a trader, I want to see a 7-day Discipline Score chart on my dashboard so that I can track behavioral trends over time.

**US-015** — As a trader, I want to understand why my Discipline Score dropped on a specific day so that I can identify and fix the behavioral failure.

---

### Epic 6: Notifications & Habit Formation

**US-016** — As a trader, I want to receive scheduled reminders throughout the day so that I don't forget to complete the discipline loop.

**US-017** — As a trader, I want to customize my notification times so that reminders work within my personal schedule.

---

## 14. Acceptance Criteria

### AC for US-004 (Morning Check-in)
- [ ] User is prompted with 5 sliders/scale inputs (Sleep, Stress, Energy, Focus, Motivation) on a 1–10 scale.
- [ ] Readiness Score is calculated and displayed immediately upon submission.
- [ ] Score 70–100: Green status with message "Good to trade. Stay disciplined."
- [ ] Score 40–69: Yellow status with message "Proceed with caution. Consider reducing size."
- [ ] Score 0–39: Red status with message "High risk of emotional trading today. Consider sitting out."
- [ ] User cannot proceed to Commitment Contract without completing check-in.
- [ ] Check-in is locked after 11:00 AM IST (prevents backdating).

### AC for US-007 & US-008 (Trade Intent Engine)
- [ ] Pre-trade form presents: Setup dropdown (populated from user's Playbook), Risk Amount input (₹), R:R Ratio input.
- [ ] On submission, system validates: Setup is in today's approved list, Trade risk does not exceed remaining daily loss budget, Trade count does not exceed daily maximum.
- [ ] If all validations pass → display "GO ✓" in green with setup win-rate context.
- [ ] If risk budget would be exceeded → display "NO-GO ✗ — Daily loss limit would be breached."
- [ ] If setup not in contract → display "CAUTION ⚠ — This setup is not in today's approved list."
- [ ] If trade count exceeded → display "NO-GO ✗ — Maximum trades for today reached."
- [ ] All intent submissions are persisted to database with timestamp and recommendation shown.
- [ ] System does NOT prevent the user from trading — it shows an advisory. User can proceed by clicking "Proceed Anyway" (which logs the override).

### AC for US-013 (Discipline Score)
- [ ] Score is computed daily at 5:00 PM IST (or manually triggerable by user post-session).
- [ ] Score breakdown is visible: each pillar shows raw contribution (e.g., Journal Completion: 20/20, Playbook Adherence: 18/30).
- [ ] Score is stored historically and accessible from the dashboard chart.
- [ ] If a pillar's inputs are not completed for the day, that pillar scores 0.

### AC for US-016 (Notifications)
- [ ] User receives web push notification at 08:30 AM if morning check-in is not complete.
- [ ] User receives email fallback within 15 minutes if push notification is undelivered.
- [ ] Notification contains a direct deep-link to the relevant module.
- [ ] User can disable/configure each notification individually in Settings.

---

## 15. Success Metrics

### Business KPIs

| Metric | MVP Target (Day 30) | Phase 2 Target (Day 90) |
|---|---|---|
| Registered Users | 200 | 2,000 |
| Paid Subscribers | 20 | 200 |
| Monthly Recurring Revenue | ₹15,000 | ₹1,50,000 |
| Conversion Rate (Free → Paid) | 10% | 10–12% |

### Engagement KPIs (Leading Indicators of Retention)

| Metric | Target |
|---|---|
| Daily Active Users / Monthly Active Users (DAU/MAU) | > 40% |
| Morning Check-in Completion Rate | > 65% of DAU |
| Trade Intent Engine Usage per Trade | > 70% of all logged trades |
| Journal Completion Rate (trades logged same day) | > 75% of DAU |
| D7 Retention | > 45% |
| D30 Retention | > 25% |

### Behavioral Outcome KPIs (Product's Core Promise)

| Metric | Target at 90 Days |
|---|---|
| Avg. Discipline Score improvement (Day 1 vs. Day 60) | +15 points |
| % of users with 0 revenge trading flags after 30 days vs. Day 1 | > 30% improvement |
| % of trades taken through Intent Engine (playbook validation) | > 70% |
| Avg. daily loss limit breaches per user per week | < 0.5 (down from baseline) |

> [!NOTE]
> The behavioral outcome metrics are the product's core value proposition and should be the headline story in all investor and press communications.

---

## 16. Risks and Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | **Users don't form the habit loop** — they sign up, use it 3 days, stop | High | Critical | Aggressive onboarding gamification; early streak rewards; weekly behavioral summary emails to re-engage. |
| R2 | **Manual data entry fatigue** — logging trades is too tedious without broker API | High | High | Minimize journal fields to 5–6 mandatory fields; auto-fill setup name from intent engine; streamline UX to <90 seconds per trade log. Phase 3 broker API solves this fully. |
| R3 | **AI Coach generates generic/wrong advice** (shipped too early) | Medium | High | Hard gate: AI Coach ships only after 30 days of data per user. Use structured prompt engineering over real data, not generic LLM outputs. |
| R4 | **Competing trading journal adds a "pre-trade gate"** — feature copied | Medium | Medium | Move fast on Phase 2 AI coaching differentiation; build the behavioral data moat — the longer users are on the platform, the more personalized and irreplaceable the AI coach becomes. |
| R5 | **Broker API integration blocked by broker's T&C or SEBI guidance** | Low | High | Begin legal review in Month 2. Design data architecture so manual and API-synced trades coexist gracefully; API is enhancement, not dependency. |
| R6 | **Privacy concerns about sharing emotional/financial data** | Medium | Medium | Publish a transparent privacy policy; offer local data export at any time; no third-party data sharing without explicit opt-in. |
| R7 | **Users game the Discipline Score** — mark all trades as "Focus" tagged regardless of reality | Medium | Medium | Cross-reference psychology tags with P&L outcomes; AI coach identifies anomalies (e.g., user tags all losing trades as "Confident" — statistically improbable). |
| R8 | **30-day build timeline is too aggressive for quality** | High | High | Ruthlessly cut scope to the 8 MUST features only. Accept incomplete polish on Phase 2 features. Ship beta to 20 trusted users at Day 25 for validation. |

---

## 17. Monetization Strategy

### Tier Structure

| Tier | Price | Included |
|---|---|---|
| **Free** | ₹0/month | Playbook (up to 3 setups), Morning Check-in, Trade Journal (up to 5 trades/day), Basic Discipline Score (view only, no history), Notifications (3/day) |
| **Pro** | ₹799/month | Everything in Free + Unlimited setups, Full Discipline Score with history & breakdown, Trade Intent Engine, Pre-market & Evening planning modules, Psychology Score analytics, AI Coach (Phase 2), Priority support |
| **Pro Annual** | ₹6,999/year (~₹583/month) | Same as Pro + 2 months free. Drives LTV and reduces churn. |
| **Teams** (Phase 3) | ₹2,499/month per 5 seats | Multi-trader dashboard for prop firms and coaching groups |

### Free Tier Strategy

> [!IMPORTANT]
> The Free tier is a **behavioral taste-test**, not a full product. It must be valuable enough that users feel the product is working, but limited enough that they feel the absence of key features (Intent Engine, AI Coach, Score history). The gap between Free and Pro must be visceral.

**Paywall trigger moments:**
- Attempt to use Trade Intent Engine → "Pro feature — see your historical win rate per setup"
- Viewing Discipline Score history → "Unlock 90-day trend analytics with Pro"
- AI Coach insight → "Upgrade to Pro to see your full behavioral blindspot report"

### Revenue Projections (Conservative)

| Month | Registered | Paid (10%) | MRR |
|---|---|---|---|
| 1 | 200 | 20 | ₹15,980 |
| 3 | 2,000 | 200 | ₹1,59,800 |
| 6 | 8,000 | 800 | ₹6,39,200 |
| 12 | 25,000 | 2,500 | ₹19,97,500 |

### Secondary Revenue Streams (Phase 3+)
- **Broker referral commissions:** Zerodha/AngelOne pay acquisition fees for funded account referrals.
- **Trading coach partnerships:** White-label TradingOS for coaches to give their students accountability infrastructure.
- **Prop firm compliance SaaS:** B2B per-seat licensing.

---

## 18. Competitive Advantages

### Moat Analysis

| Advantage | Depth | Defensibility |
|---|---|---|
| **Behavioral Data Moat** | The longer a trader uses TradingOS, the more personalized the AI coaching becomes. After 90 days of data, switching to a competitor means starting over with no behavioral history. | **High** — increases over time |
| **Pre-Trade Gating (Intent Engine)** | No competitor has a behavioral circuit-breaker *before* the trade. All journals are reactive. TradingOS is the first to operate at the decision point. | **High** — first-mover in positioning |
| **Discipline Score as Identity** | A single, proprietary score that traders will share, compare, and optimize. Creates a new performance identity metric beyond P&L. | **Medium** — needs adoption |
| **India-First Market Focus** | Deep integration with Indian brokers (Zerodha, AngelOne), Indian market hours, INR-denominated pricing, Hindi/Hinglish UI consideration for wider reach | **Medium** — replicable but requires time |
| **Habit-Loop Architecture** | The daily loop (Check-in → Contract → Intent → Journal → Score) is designed for habit formation using BJ Fogg's Behavior Model and Nir Eyal's Hook Model. Most journals are just Excel sheets with a logo. | **High** — UX philosophy is a moat |

### Competitive Positioning Map

```
                        PROACTIVE (Pre-Trade Intervention)
                                     ▲
                                     │
                              TradingOS (Target)
                                     │
REACTIVE ◄───────────────────────────┼────────────────────────► DATA-RICH
(Post-trade only)                    │                   (Heavy analytics)
                         Trademetria │ TraderVue
                         Chartlog    │
                                     │
                                     ▼
                        REACTIVE (Post-Trade Analysis)
```

---

## 19. Technical Recommendations

> [!NOTE]
> This section provides high-level guidance only. No detailed architecture is defined here. A separate Technical Architecture Document (TAD) should be produced before development begins.

### Core Recommendation: Keep it Simple at MVP

Do not over-engineer the MVP. The behavioral loop does not require microservices, real-time event streaming, or complex ML pipelines on Day 1.

### Stack Direction

| Layer | Recommendation | Rationale |
|---|---|---|
| **Frontend** | Next.js (React) | SEO-friendly, fast, excellent ecosystem, works well for data-heavy dashboards |
| **Backend** | Node.js + Express OR Next.js API Routes | Fast to ship; avoid framework lock-in at MVP |
| **Database** | PostgreSQL (primary) | Relational structure needed for score calculations, journaling, and user profiles |
| **Auth** | NextAuth.js or Supabase Auth | Fast implementation; Google OAuth built-in |
| **Notifications** | SendGrid (email) + Web Push API | Reliable; web push avoids app store dependency at MVP |
| **Hosting** | Vercel (frontend) + Railway/Supabase (backend/DB) | Fastest path to production; scalable for Phase 2 |
| **AI Coach (Phase 2)** | OpenAI GPT-4o or Anthropic Claude API | Structured prompts over user behavioral data; NOT a fine-tuned model at Phase 2 |

### Critical Architecture Decisions to Make Before Day 1

1. **Timezone handling:** All times must be stored in UTC and displayed in IST. Market hours logic must be IST-aware. Build this right from Day 1.
2. **Discipline Score calculation:** Make this a server-side job (cron at 5:00 PM IST), not a client-side calculation. Prevents gaming via client manipulation.
3. **Data schema for behavioral events:** Design a generic behavioral event log from Day 1 (user_id, event_type, timestamp, metadata JSON). This powers the Phase 2 AI coach without re-architecture.
4. **Immutable trade journal entries:** Enforce immutability at DB level (no UPDATE after 24 hours), not just at UI level.
5. **Playbook setup IDs:** Assign stable UUIDs to each setup so historical data references are not broken when a user renames a setup.

### What NOT to Build at MVP

- Do NOT build your own notification scheduling system — use a hosted cron service (Railway Cron, Vercel Cron, or a dedicated job queue like BullMQ).
- Do NOT integrate broker APIs at MVP — the authentication, token refresh, error handling, and rate-limiting complexity will consume 2–3 weeks that should go to core features.
- Do NOT build a mobile app at MVP — web push on mobile browsers (Chrome/Android) is sufficient for notification delivery in Phase 1.

---

## Appendix A: MoSCoW Summary Table

| ID | Feature | Phase | Priority |
|---|---|---|---|
| M1 | Onboarding AI Profiling | MVP | Must |
| M2 | Playbook Creation Engine | MVP | Must |
| M3 | Morning Psychological Check-in | MVP | Must |
| M4 | Daily Commitment Contract | MVP | Must |
| M5 | Trade Intent Engine (Gatekeeper) | MVP | Must |
| M6 | Multi-Dimensional Trade Journal | MVP | Must |
| M7 | Discipline Score Framework | MVP | Must |
| M8 | Notification Engine | MVP | Must |
| S1 | Pre-Market Analysis Module | Phase 2 | Should |
| S2 | Market Close Reflection Loop | Phase 2 | Should |
| S3 | Evening Blueprint | Phase 2 | Should |
| S4 | Psychology Score Analytics | Phase 2 | Should |
| S5 | Behavioral Escalation Engine | Phase 2 | Should |
| S6 | AI Accountability Coach | Phase 2 | Should |
| S7 | Gamified Streak & Consistency | Phase 2 | Should |
| C1 | Broker API Integration | Phase 3 | Could |
| C2 | Accountability Partners | Phase 3 | Could |
| C3 | Mobile App (iOS/Android) | Phase 3 | Could |
| C4 | Prop Firm Dashboard | Phase 3 | Could |
| C5 | AI Playbook Suggestions | Phase 3 | Could |
| W1 | Automated Trade Execution | Never | Won't |
| W2 | Backtesting Engine | Never | Won't |
| W3 | Social Feed / Content Platform | Never | Won't |
| W4 | Copy Trading | Never | Won't |

---

## Appendix B: Open Questions & Decisions Required

> [!IMPORTANT]
> These decisions should be made BEFORE development begins:

1. **Language/Localization:** Will the MVP UI be in English only, or will Hindi/Hinglish toggles be included? The concept document was written in Hinglish — is there a specific vernacular UX hypothesis to test?

2. **Readiness Score Weighting:** Which of the 5 check-in factors (Sleep, Stress, Energy, Focus, Motivation) are weighted equally, or is there a custom weighting? Recommend starting with equal weights and adjusting based on data.

3. **Hard Block vs. Soft Gate:** The concept proposes the Intent Engine as a gatekeeper. This PRD recommends a **soft gate with friction** (user can override with "Proceed Anyway"). Should the system ever hard-block trading intent? This has significant UX implications.

4. **Pricing in USD for global expansion:** Is the plan to localize pricing for USD/AED markets in Phase 2, or India-first through Phase 3?

5. **Beta cohort strategy:** Who are the first 20 beta users? Trading community members? Existing network? This decision impacts onboarding feedback quality significantly.

---

*End of Document*

**TradingOS PRD v1.0 | Prepared June 2026 | For Internal Engineering Use**
