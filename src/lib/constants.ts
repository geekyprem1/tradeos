export const IST_OFFSET_MINUTES = 330;
export const SCORE_ALGORITHM_VERSION = 'v1.0';

export const SCORE_WEIGHTS = {
  checkin: 20,
  journal: 20,
  playbook: 30,
  noRevenge: 20,
  evening: 10,
} as const;

export const PSYCHOLOGY_TAGS = [
  'focus',
  'confident',
  'fomo',
  'fear',
  'greed',
  'revenge',
  'random',
  'restlessness',
] as const;

export const NOTIFICATION_TYPES = [
  'morning_checkin',
  'market_open_warning',
  'journal_reminder',
  'journal_warning',
  'evening_planning',
] as const;

export const MARKET_TYPES = ['equity', 'fo', 'crypto', 'commodity'] as const;

export const TRADING_STYLES = ['scalping', 'intraday', 'swing'] as const;

export const TIMEFRAMES = ['1min', '5min', '15min', '1hr', 'daily'] as const;
