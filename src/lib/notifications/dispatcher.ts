import { EmailChannel } from './channels/email';
import { PushChannel } from './channels/push';
import { DeliveryResult, NotificationPayload, UserNotificationProfile } from './types';
import { createAdminClient } from '@/lib/supabase/admin';

export class NotificationDispatcher {
  private channels = [new PushChannel(), new EmailChannel()];

  async dispatch(payload: NotificationPayload, user: UserNotificationProfile): Promise<DeliveryResult> {
    const supabase = createAdminClient();

    // Check if the user has disabled this notification type
    const prefs = user.notificationPrefs;
    const typeKey = payload.type as keyof typeof prefs;
    if (prefs && prefs[typeKey] && !prefs[typeKey].enabled) {
      return { success: false, channelId: 'none', error: 'User disabled this notification type' };
    }

    let result: DeliveryResult | null = null;

    for (const channel of this.channels) {
      if (channel.isAvailable(user)) {
        result = await channel.send(payload, user);
        
        if (result.success) {
          // Log success event
          await supabase.from('behavioral_events').insert({
            user_id: user.userId,
            event_type: 'notification_sent',
            metadata: {
              notification_type: payload.type,
              channel: result.channelId,
            },
          });
          return result;
        } else {
          // Log failure event but continue to next channel
          await supabase.from('behavioral_events').insert({
            user_id: user.userId,
            event_type: 'notification_failed',
            metadata: {
              notification_type: payload.type,
              channel: channel.channelId,
              error: result.error,
            },
          });
        }
      }
    }

    // If we reach here, all channels failed or none were available
    await supabase.from('behavioral_events').insert({
      user_id: user.userId,
      event_type: 'notification_undelivered',
      metadata: {
        notification_type: payload.type,
        error: 'All channels failed or unavailable',
      },
    });

    return result || { success: false, channelId: 'none', error: 'No channels available' };
  }
}

export const dispatcher = new NotificationDispatcher();
