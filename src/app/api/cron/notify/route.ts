import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { dispatcher } from '@/lib/notifications/dispatcher';
import { NotificationPayload, UserNotificationProfile } from '@/lib/notifications/types';
import { todayIST } from '@/lib/utils';
import { NOTIFICATION_TYPES } from '@/lib/constants';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  if (!type || !NOTIFICATION_TYPES.includes(type as any)) {
    return NextResponse.json({ error: 'Invalid or missing type parameter' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const today = todayIST();
  let eligibleUserIds: string[] = [];

  try {
    switch (type) {
      case 'morning_checkin':
      case 'market_open_warning': {
        const { data } = await supabase
          .from('daily_sessions')
          .select('user_id')
          .eq('session_date', today)
          .is('checkin_completed_at', null);
        if (data) eligibleUserIds = data.map((d: any) => d.user_id);
        break;
      }
      
      case 'journal_reminder':
      case 'journal_warning': {
        // trades_taken > 0 AND journal count < trades_taken
        // We will fetch sessions with trades > 0, then check behavioral_events
        const { data: sessions } = await supabase
          .from('daily_sessions')
          .select('id, user_id, trades_taken')
          .eq('session_date', today)
          .gt('trades_taken', 0);
          
        if (sessions) {
          for (const s of sessions) {
            const { count } = await supabase
              .from('behavioral_events')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', s.id)
              .eq('event_type', 'trade_logged');
              
            if (count !== null && count < s.trades_taken) {
              eligibleUserIds.push(s.user_id);
            }
          }
        }
        break;
      }

      case 'evening_planning': {
        // Active sessions but no evening_activity
        const { data: sessions } = await supabase
          .from('daily_sessions')
          .select('id, user_id')
          .eq('session_date', today);

        if (sessions) {
          for (const s of sessions) {
            const { count } = await supabase
              .from('behavioral_events')
              .select('*', { count: 'exact', head: true })
              .eq('session_id', s.id)
              .eq('event_type', 'evening_activity');
              
            if (count === 0) {
              eligibleUserIds.push(s.user_id);
            }
          }
        }
        break;
      }
    }

    if (eligibleUserIds.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, skipped: 0 });
    }

    // Build payload
    let payload: NotificationPayload = {
      type,
      title: 'Notification',
      body: 'You have a pending task.',
      deeplink: '/',
      urgency: 'normal'
    };

    if (type === 'morning_checkin') {
      payload = { type, title: 'Morning Check-in', body: 'Time to set your intentions for the day.', deeplink: '/checkin', urgency: 'normal' };
    } else if (type === 'market_open_warning') {
      payload = { type, title: 'Market Opens Soon', body: 'You haven\'t completed your check-in! Complete it now.', deeplink: '/checkin', urgency: 'high' };
    } else if (type === 'journal_reminder') {
      payload = { type, title: 'Journal Reminder', body: 'You have unlogged trades. Log them to complete your loop.', deeplink: `/journal/${today}`, urgency: 'normal' };
    } else if (type === 'journal_warning') {
      payload = { type, title: 'Journal Warning', body: 'Missing journals will affect your discipline score. Log now.', deeplink: `/journal/${today}`, urgency: 'high' };
    } else if (type === 'evening_planning') {
      payload = { type, title: 'Evening Planning', body: 'Review your day and prepare for tomorrow.', deeplink: '/playbook', urgency: 'low' };
    }

    let sent = 0;
    let failed = 0;

    // Fetch profiles for eligible users
    for (const userId of eligibleUserIds) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email, notification_prefs')
        .eq('id', userId)
        .single();
        
      if (!profile) continue;

      const { data: subs } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      const userProfile: UserNotificationProfile = {
        userId,
        email: profile.email,
        notificationPrefs: profile.notification_prefs,
        pushSubscriptions: subs || []
      };

      const result = await dispatcher.dispatch(payload, userProfile);
      if (result.success) sent++;
      else failed++;
    }

    return NextResponse.json({ sent, failed, skipped: 0 });
  } catch (error: any) {
    console.error('Notify cron error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
