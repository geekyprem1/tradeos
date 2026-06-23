-- Migration: 008_add_performance_indexes
-- Description: Adds missing foreign key and operational indexes based on Phase 03 performance audit.

-- 1. Playbook Setups
-- Rationale: Fast lookup of active playbook setups for a user (queried constantly by intent and contract pages).
CREATE INDEX IF NOT EXISTS idx_playbook_setups_user_active 
ON playbook_setups(user_id) 
WHERE is_active = true;

-- 2. Trade Intents
-- Rationale: Fast lookup of all trade intents for a given daily session (queried by the intent history table).
CREATE INDEX IF NOT EXISTS idx_trade_intents_session 
ON trade_intents(session_id);

-- 3. Trade Journal
-- Rationale: Fast lookup of all trades in a given daily session (queried by the journal summary and score engine).
CREATE INDEX IF NOT EXISTS idx_trade_journal_session 
ON trade_journal(session_id);

-- 4. Push Subscriptions
-- Rationale: Fast lookup of active push notification endpoints for a user when dispatching alerts.
CREATE INDEX IF NOT EXISTS idx_push_subs_user 
ON push_subscriptions(user_id) 
WHERE is_active = true;
