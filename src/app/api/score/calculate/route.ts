import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { deriveScore } from '@/lib/score-engine';
import { todayIST } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = todayIST();

    // Optionally check if score is already derived and limit recalculation
    // For now, allow recalculation if they added new journal entries.
    
    // Check if daily_session exists
    const { data: sessionData, error: sessionError } = await supabase
      .from('daily_sessions')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('session_date', today)
      .single();

    if (sessionError || !sessionData) {
      return NextResponse.json({ error: 'No daily session found for today. Did you complete the morning check-in?' }, { status: 400 });
    }

    const scoreResult = await deriveScore(session.user.id, today);

    return NextResponse.json(scoreResult);
  } catch (error: unknown) {
    console.error('Calculate score error:', error);
    const errorMsg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
