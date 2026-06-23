CREATE TABLE playbook_setups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  entry_conditions TEXT NOT NULL,
  timeframe       TEXT NOT NULL,
  min_rr_ratio    NUMERIC(4,2) NOT NULL DEFAULT 1.5,
  filters         JSONB,
  notes           TEXT,
  total_trades    INTEGER NOT NULL DEFAULT 0,
  winning_trades  INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  archived_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE playbook_setups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own data" ON playbook_setups FOR ALL USING (auth.uid() = user_id);
