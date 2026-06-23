import { ScoreResult, BehavioralEvent } from './types';
import { SCORE_ALGORITHM_VERSION, SCORE_WEIGHTS } from './constants';
import { createAdminClient } from './supabase/admin';

export function getScoreAlgorithmVersion(): string {
  return SCORE_ALGORITHM_VERSION;
}

export async function deriveScore(userId: string, sessionDate: string): Promise<ScoreResult> {
  const supabase = createAdminClient();

  // 1. Fetch Session
  const { data: session, error: sessionError } = await supabase
    .from('daily_sessions')
    .select('id, trades_taken')
    .eq('user_id', userId)
    .eq('session_date', sessionDate)
    .single();

  if (sessionError) {
    throw new Error(`Failed to fetch daily_session: ${sessionError.message}`);
  }

  // 2. Fetch all events for this session
  const { data: eventsRes, error: eventsError } = await supabase
    .from('behavioral_events')
    .select('*')
    .eq('session_id', session.id);

  if (eventsError) {
    throw new Error(`Failed to fetch behavioral_events: ${eventsError.message}`);
  }

  const events: BehavioralEvent[] = eventsRes || [];

  // Initialize scores to max by default
  let checkinScore = 0;
  let journalScore = 0;
  let playbookScore: number = SCORE_WEIGHTS.playbook;
  let noRevengeScore: number = SCORE_WEIGHTS.noRevenge;
  let eveningScore = 0;

  // Counters
  let tradeLoggedCount = 0;

  for (const event of events) {
    switch (event.event_type) {
      case 'checkin_completed':
        checkinScore = SCORE_WEIGHTS.checkin;
        break;
      case 'trade_logged':
        tradeLoggedCount++;
        // Note: rule_followed = false means a playbook violation
        if (event.metadata?.rule_followed === false) {
          playbookScore -= 5;
        }
        if (event.metadata?.psychology_tag === 'revenge') {
          noRevengeScore -= 10;
        }
        break;
      case 'intent_override':
        playbookScore -= 10;
        break;
      case 'evening_activity':
        eveningScore = SCORE_WEIGHTS.evening;
        break;
    }
  }

  // Calculate Journal Pillar
  // If trades_taken is 0, they get full points automatically
  if (session.trades_taken === 0) {
    journalScore = SCORE_WEIGHTS.journal;
  } else {
    // If they took trades, they must log them.
    const ratio = Math.min(1, tradeLoggedCount / session.trades_taken);
    journalScore = Math.round(SCORE_WEIGHTS.journal * ratio);
  }

  // Clamp values to floor of 0
  playbookScore = Math.max(0, playbookScore);
  noRevengeScore = Math.max(0, noRevengeScore);

  const total = checkinScore + journalScore + playbookScore + noRevengeScore + eveningScore;

  const result: ScoreResult = {
    total,
    checkin: checkinScore,
    journal: journalScore,
    playbook: playbookScore,
    noRevenge: noRevengeScore,
    evening: eveningScore,
    algorithmVersion: getScoreAlgorithmVersion(),
  };

  // 3. Update Read-Model Cache in daily_sessions
  const { error: updateError } = await supabase
    .from('daily_sessions')
    .update({
      score_total: result.total,
      score_checkin_pillar: result.checkin,
      score_journal_pillar: result.journal,
      score_playbook_pillar: result.playbook,
      score_no_revenge_pillar: result.noRevenge,
      score_evening_pillar: result.evening,
      score_algorithm_version: result.algorithmVersion,
      score_derived_at: new Date().toISOString(),
    })
    .eq('id', session.id);

  if (updateError) {
    throw new Error(`Failed to update daily_session score cache: ${updateError.message}`);
  }

  // 4. Insert Operational Event
  const { error: logError } = await supabase
    .from('behavioral_events')
    .insert({
      user_id: userId,
      session_id: session.id,
      event_type: 'score_derived',
      metadata: { score: result },
    });

  if (logError) {
    throw new Error(`Failed to log score_derived event: ${logError.message}`);
  }

  return result;
}
