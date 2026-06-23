import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deriveScore } from '@/lib/score-engine';
import { todayIST } from '@/lib/utils';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = todayIST();
  const start = Date.now();

  try {
    // Fetch all daily_sessions for today where score_derived_at IS NULL
    // Limit to 50 for batching
    const { data: sessions, error } = await supabase
      .from('daily_sessions')
      .select('id, user_id')
      .eq('session_date', today)
      .is('score_derived_at', null)
      .limit(50);

    if (error) {
      throw new Error(`Failed to fetch sessions: ${error.message}`);
    }

    if (!sessions || sessions.length === 0) {
      return NextResponse.json({ processed: 0, skipped: 0, errors: 0, duration_ms: Date.now() - start });
    }

    let processed = 0;
    let errors = 0;

    for (const session of sessions) {
      try {
        await deriveScore(session.user_id, today);
        processed++;
      } catch (err) {
        console.error(`Failed to derive score for user ${session.user_id}:`, err);
        errors++;
      }
    }

    return NextResponse.json({
      processed,
      skipped: 0, // In a larger system we might track skipped explicitly
      errors,
      duration_ms: Date.now() - start,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
