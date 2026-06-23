CREATE TABLE behavioral_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  session_id      UUID REFERENCES daily_sessions(id),
  event_type      TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE behavioral_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own events" ON behavioral_events FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX idx_behavioral_events_user_session_type ON behavioral_events(user_id, session_id, event_type, occurred_at DESC);
CREATE INDEX idx_behavioral_events_user_time ON behavioral_events(user_id, occurred_at DESC);
