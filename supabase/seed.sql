-- Create a test user via auth.users so the trigger fires
INSERT INTO auth.users (id, email, email_confirmed_at, raw_user_meta_data)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test@example.com',
  NOW(),
  '{"full_name": "Test User"}'
);

-- Note: the handle_new_user trigger automatically creates the profile row.
-- Let's update the created profile to mark onboarding_completed = true
UPDATE public.profiles
SET onboarding_completed = true,
    capital_base = 100000,
    market_type = 'equity',
    trading_style = 'intraday',
    default_risk_per_trade = 1000,
    default_daily_loss_limit = 3000,
    default_max_trades = 3
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Insert Playbook setups
INSERT INTO public.playbook_setups (id, user_id, name, entry_conditions, timeframe, min_rr_ratio)
VALUES 
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Breakout Pullback', 'Price breaks resistance, pulls back with lower volume', '5min', 2.0),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Moving Average Bounce', 'Price bounces off 20 EMA', '15min', 1.5);

-- Insert Daily session
INSERT INTO public.daily_sessions (
  id, user_id, session_date, 
  checkin_sleep, checkin_stress, checkin_energy, checkin_focus, checkin_motivation, 
  readiness_score, checkin_completed_at,
  contract_max_trades, contract_max_loss_inr, contract_allowed_setup_ids, contract_signed_at
)
VALUES (
  '00000000-0000-0000-0000-000000000201',
  '00000000-0000-0000-0000-000000000001',
  CURRENT_DATE,
  8, 3, 7, 8, 9, 
  85, NOW(),
  3, 3000, ARRAY['00000000-0000-0000-0000-000000000101'::uuid, '00000000-0000-0000-0000-000000000102'::uuid], NOW()
);
