import { z } from 'zod';
import { MARKET_TYPES, TRADING_STYLES, TIMEFRAMES, PSYCHOLOGY_TAGS } from './constants';

export const ProfileSchema = z.object({
  capital_base: z.number().min(0),
  market_type: z.enum(MARKET_TYPES),
  trading_style: z.enum(TRADING_STYLES),
  default_risk_per_trade: z.number().min(0),
  default_daily_loss_limit: z.number().min(0),
  default_max_trades: z.number().int().min(1),
});

export const PlaybookSetupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  entry_conditions: z.string().min(1, 'Entry conditions are required'),
  timeframe: z.enum(TIMEFRAMES),
  min_rr_ratio: z.number().min(0.1),
  notes: z.string().optional(),
});

export const IntentRequestSchema = z.object({
  setup_id: z.string().uuid(),
  risk_amount_inr: z.number().min(0),
  rr_ratio: z.number().min(0.1),
  session_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export const TradeJournalSchema = z.object({
  intent_id: z.string().uuid().optional(),
  setup_id: z.string().uuid().optional(),
  instrument: z.string().optional(),
  entry_price: z.number().min(0),
  exit_price: z.number().min(0),
  quantity: z.number().min(0),
  pnl_inr: z.number(),
  psychology_tag: z.enum(PSYCHOLOGY_TAGS),
  rule_followed: z.boolean(),
  deviation_note: z.string().optional(),
  notes: z.string().optional(),
});

export const ContractSchema = z.object({
  max_trades: z.number().int().min(1),
  max_loss_inr: z.number().min(0),
  allowed_setup_ids: z.array(z.string().uuid()).min(1, 'At least one setup must be allowed'),
  forbidden_conditions: z.string().optional(),
});

export const OverrideReasonSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const SignupSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const PushSubscriptionSchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});
