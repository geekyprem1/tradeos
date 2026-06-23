import webpush from 'web-push';
import { DeliveryResult, NotificationChannel, NotificationPayload, UserNotificationProfile } from '../types';

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:notifications@tradingos.dev',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export class PushChannel implements NotificationChannel {
  channelId = 'push' as const;

  isAvailable(user: UserNotificationProfile): boolean {
    return user.pushSubscriptions && user.pushSubscriptions.length > 0;
  }

  async send(payload: NotificationPayload, user: UserNotificationProfile): Promise<DeliveryResult> {
    if (!this.isAvailable(user)) {
      return { success: false, channelId: this.channelId, error: 'No active push subscriptions' };
    }

    let allFailed = true;
    let lastError = '';

    const sendPromises = user.pushSubscriptions.map(async (sub) => {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh_key,
            auth: sub.auth_key,
          },
        };

        await webpush.sendNotification(
          pushSubscription,
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            url: payload.deeplink,
          })
        );
        allFailed = false;
      } catch (error: any) {
        lastError = error.message;
        // Check for 410 Gone (subscription expired/unsubscribed)
        if (error.statusCode === 410) {
          // Note: In dispatcher, we could use a callback or event to mark this sub as inactive in DB.
          // For now, we return partial success or let dispatcher handle the failure.
          console.error('Push subscription 410 Gone for user:', user.userId);
        }
      }
    });

    await Promise.all(sendPromises);

    if (allFailed) {
      return { success: false, channelId: this.channelId, error: lastError };
    }

    return { success: true, channelId: this.channelId };
  }
}
