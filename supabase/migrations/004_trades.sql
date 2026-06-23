CREATE TABLE trade_intents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  session_id      UUID NOT NULL REFERENCES daily_sessions(id),
  setup_id        UUID REFERENCES playbook_setups(id),
  risk_amount_inr NUMERIC(10,2) NOT NULL,
  rr_ratio        NUMERIC(4,2) NOT NULL,
  notes           TEXT,
  validation_result   TEXT NOT NULL CHECK (validation_result IN ('go','caution','no_go')),
  validation_reasons  JSONB NOT NULL,
  win_rate_at_time    NUMERIC(5,2),
  user_proceeded      BOOLEAN,
  override_reason     TEXT,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE trade_journal (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  session_id      UUID NOT NULL REFERENCES daily_sessions(id),
  intent_id       UUID REFERENCES trade_intents(id),
  setup_id        UUID REFERENCES playbook_setups(id),
  instrument      TEXT,
  entry_price     NUMERIC(12,4) NOT NULL,
  exit_price      NUMERIC(12,4) NOT NULL,
  quantity        NUMERIC(12,4) NOT NULL,
  pnl_inr        NUMERIC(12,2) NOT NULL,
  psychology_tag  TEXT NOT NULL CHECK (psychology_tag IN ('focus','confident','fomo','fear','greed','revenge','restlessness')),
  rule_followed   BOOLEAN NOT NULL DEFAULT TRUE,
  deviation_note  TEXT,
  notes           TEXT,
  logged_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_at       TIMESTAMPTZ
);

CREATE OR REPLACE FUNCTION prevent_journal_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.locked_at IS NOT NULL THEN
    RAISE EXCEPTION 'Trade journal entry is locked and cannot be modified.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER lock_journal_entries
  BEFORE UPDATE ON trade_journal
  FOR EACH ROW EXECUTE FUNCTION prevent_journal_update();

ALTER TABLE trade_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own data" ON trade_intents FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own trades" ON trade_journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own trades" ON trade_journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update unlocked trades" ON trade_journal FOR UPDATE USING (auth.uid() = user_id AND locked_at IS NULL);

CREATE INDEX idx_trade_journal_user_setup ON trade_journal(user_id, setup_id);
