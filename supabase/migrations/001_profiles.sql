CREATE TABLE profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                 TEXT NOT NULL,
  full_name             TEXT,
  capital_base          NUMERIC(12,2) NOT NULL DEFAULT 0,
  market_type           TEXT NOT NULL CHECK (market_type IN ('equity','fo','crypto','commodity')),
  trading_style         TEXT NOT NULL CHECK (trading_style IN ('scalping','intraday','swing')),
  default_risk_per_trade    NUMERIC(10,2) NOT NULL DEFAULT 0,
  default_daily_loss_limit  NUMERIC(10,2) NOT NULL DEFAULT 0,
  default_max_trades        INTEGER NOT NULL DEFAULT 3,
  tier                  TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','pro','teams')),
  tier_expires_at       TIMESTAMPTZ,
  notification_prefs    JSONB NOT NULL DEFAULT '{
    "morning_checkin":       {"enabled": true, "time_ist": "08:30"},
    "market_open_warning":   {"enabled": true, "time_ist": "09:00"},
    "journal_reminder":      {"enabled": true, "time_ist": "16:00"},
    "journal_warning":       {"enabled": true, "time_ist": "17:00"},
    "evening_planning":      {"enabled": true, "time_ist": "20:00"}
  }',
  push_subscription     JSONB,
  onboarding_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
