import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // Protect cron endpoint with a bearer token
  // Check if process.env.CRON_SECRET exists, if not, skip for local dev ease, but ideally enforce it.
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // We want to lock journals older than 24 hours.
  // Supabase/PostgreSQL has date math, but doing it from JS is easier and safer across dialects.
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Update trade_journal
  const { data, error } = await supabase
    .from('trade_journal')
    .update({ locked_at: new Date().toISOString() })
    .lt('logged_at', twentyFourHoursAgo)
    .is('locked_at', null)
    .select('id');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ 
    locked: data ? data.length : 0,
    success: true 
  });
}
