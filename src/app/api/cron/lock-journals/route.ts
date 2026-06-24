import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  // Verify cron secret if in production
  if (
    process.env.NODE_ENV === 'production' &&
    request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();

    // Lock entries older than 24 hours
    // Since locked_at is what the trigger checks, setting locked_at to NOW() secures the row.
    const { data, error } = await supabase
      .from('trade_journal')
      .update({ locked_at: new Date().toISOString() })
      .lt('logged_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .is('locked_at', null)
      .select('id');

    if (error) {
      console.error('Failed to lock journals:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      locked_count: data?.length || 0 
    });
  } catch (error: unknown) {
    console.error('Cron lock-journals error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
