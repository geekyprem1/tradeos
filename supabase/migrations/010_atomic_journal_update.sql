CREATE OR REPLACE FUNCTION increment_journal_stats(
  p_session_id UUID,
  p_pnl_inr NUMERIC,
  p_setup_id UUID,
  p_is_win BOOLEAN
) RETURNS void AS $$
BEGIN
  -- 1. Atomically update daily_sessions
  UPDATE daily_sessions
  SET trades_taken = trades_taken + 1,
      realized_pnl_inr = realized_pnl_inr + p_pnl_inr
  WHERE id = p_session_id;

  -- 2. Atomically update playbook_setups if provided
  IF p_setup_id IS NOT NULL THEN
    UPDATE playbook_setups
    SET total_trades = total_trades + 1,
        winning_trades = winning_trades + CASE WHEN p_is_win THEN 1 ELSE 0 END
    WHERE id = p_setup_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
