CREATE TABLE daily_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date    DATE NOT NULL,
  checkin_sleep       INTEGER CHECK (checkin_sleep BETWEEN 1 AND 10),
  checkin_stress      INTEGER CHECK (checkin_stress BETWEEN 1 AND 10),
  checkin_energy      INTEGER CHECK (checkin_energy BETWEEN 1 AND 10),
  checkin_focus       INTEGER CHECK (checkin_focus BETWEEN 1 AND 10),
  checkin_motivation  INTEGER CHECK (checkin_motivation BETWEEN 1 AND 10),
  readiness_score     INTEGER,
  checkin_completed_at TIMESTAMPTZ,
  contract_max_trades          INTEGER,
  contract_max_loss_inr        NUMERIC(10,2),
  contract_allowed_setup_ids   UUID[],
  contract_forbidden_conditions TEXT,
  contract_signed_at           TIMESTAMPTZ,
  trades_taken        INTEGER NOT NULL DEFAULT 0,
  realized_pnl_inr    NUMERIC(12,2) NOT NULL DEFAULT 0,
  score_total              INTEGER,
  score_checkin_pillar     INTEGER,
  score_journal_pillar     INTEGER,
  score_playbook_pillar    INTEGER,
  score_no_revenge_pillar  INTEGER,
  score_evening_pillar     INTEGER,
  score_algorithm_version  TEXT,
  score_derived_at         TIMESTAMPTZ,
  is_trading_day      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, session_date)
);

ALTER TABLE daily_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own data" ON daily_sessions FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_daily_sessions_user_date ON daily_sessions(user_id, session_date DESC);
CREATE INDEX idx_daily_sessions_algo_version ON daily_sessions(score_algorithm_version, session_date DESC) WHERE score_total IS NOT NULL;
CREATE INDEX idx_daily_sessions_pending_checkin ON daily_sessions(session_date, checkin_completed_at) WHERE checkin_completed_at IS NULL;
