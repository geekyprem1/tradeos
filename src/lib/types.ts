export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  capital_base: number;
  market_type: 'equity' | 'fo' | 'crypto' | 'commodity';
  trading_style: 'scalping' | 'intraday' | 'swing';
  default_risk_per_trade: number;
  default_daily_loss_limit: number;
  default_max_trades: number;
  tier: 'free' | 'pro' | 'teams';
  tier_expires_at?: string;
  notification_prefs: NotificationPrefs;
  push_subscription?: Record<string, unknown>;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaybookSetup {
  id: string;
  user_id: string;
  name: string;
  entry_conditions: string;
  timeframe: '1min' | '5min' | '15min' | '1hr' | 'daily';
  min_rr_ratio: number;
  filters?: Record<string, unknown>;
  notes?: string;
  total_trades: number;
  winning_trades: number;
  is_active: boolean;
  archived_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DailySession {
  id: string;
  user_id: string;
  session_date: string;
  checkin_sleep?: number;
  checkin_stress?: number;
  checkin_energy?: number;
  checkin_focus?: number;
  checkin_motivation?: number;
  readiness_score?: number;
  checkin_completed_at?: string;
  contract_max_trades?: number;
  contract_max_loss_inr?: number;
  contract_allowed_setup_ids?: string[];
  contract_forbidden_conditions?: string;
  contract_signed_at?: string;
  trades_taken: number;
  realized_pnl_inr: number;
  score_total?: number;
  score_checkin_pillar?: number;
  score_journal_pillar?: number;
  score_playbook_pillar?: number;
  score_no_revenge_pillar?: number;
  score_evening_pillar?: number;
  score_algorithm_version?: string;
  score_derived_at?: string;
  is_trading_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface TradeIntent {
  id: string;
  user_id: string;
  session_id: string;
  setup_id?: string;
  risk_amount_inr: number;
  rr_ratio: number;
  notes?: string;
  validation_result: 'go' | 'caution' | 'no_go';
  validation_reasons: string[];
  win_rate_at_time?: number;
  user_proceeded?: boolean;
  override_reason?: string;
  submitted_at: string;
}

export interface IntentRequest {
  setup_id: string;
  risk_amount_inr: number;
  rr_ratio: number;
  session_date: string;
  psychology_tag: 'focus'|'confident'|'fomo'|'fear'|'greed'|'revenge'|'random'|'restlessness';
}

export interface IntentResponse {
  intent_id: string;
  result: 'go' | 'caution' | 'no_go';
  reasons: string[];
  win_rate: number | null;
  trades_remaining: number;
  budget_remaining_inr: number;
  low_data_warning: boolean;
  requires_brake?: boolean;
}

export interface TradeJournal {
  id: string;
  user_id: string;
  session_id: string;
  intent_id?: string;
  setup_id?: string;
  instrument?: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  pnl_inr: number;
  psychology_tag: 'focus'|'confident'|'fomo'|'fear'|'greed'|'revenge'|'random'|'restlessness';
  rule_followed: boolean;
  deviation_note?: string;
  notes?: string;
  logged_at: string;
  locked_at?: string;
}

export interface BehavioralEvent {
  id: string;
  user_id: string;
  session_id?: string;
  event_type: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
}

export interface PushSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  user_agent?: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface ScoreResult {
  total: number;
  checkin: number;
  journal: number;
  playbook: number;
  noRevenge: number;
  evening: number;
  algorithmVersion: string;
}

export interface NotificationPrefs {
  morning_checkin: { enabled: boolean; time_ist: string };
  market_open_warning: { enabled: boolean; time_ist: string };
  journal_reminder: { enabled: boolean; time_ist: string };
  journal_warning: { enabled: boolean; time_ist: string };
  evening_planning: { enabled: boolean; time_ist: string };
}
