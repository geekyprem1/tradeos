-- Migration: 007_add_random_psychology_tag
-- Description: Forward-only migration to add the 'random' psychology tag to the trade_journal table.
-- Rationale: Avoids modifying historical migrations which are already applied to the database.

-- 1. Drop the existing auto-generated check constraint on psychology_tag
ALTER TABLE trade_journal DROP CONSTRAINT IF EXISTS trade_journal_psychology_tag_check;

-- 2. Add the updated check constraint including 'random'
ALTER TABLE trade_journal ADD CONSTRAINT trade_journal_psychology_tag_check CHECK (
  psychology_tag IN (
    'focus',
    'confident',
    'fomo',
    'fear',
    'greed',
    'revenge',
    'random',
    'restlessness'
  )
);
