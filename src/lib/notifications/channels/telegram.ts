import { DeliveryResult, NotificationChannel, NotificationPayload, UserNotificationProfile } from '../types';

export class TelegramChannel implements NotificationChannel {
  channelId = 'telegram' as const;

  isAvailable(user: UserNotificationProfile): boolean {
    return false;
  }

  async send(payload: NotificationPayload, user: UserNotificationProfile): Promise<DeliveryResult> {
    throw new Error('NotImplementedError: Telegram channel is not implemented in Phase 1');
  }
}
