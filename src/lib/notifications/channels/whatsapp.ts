import { DeliveryResult, NotificationChannel, NotificationPayload, UserNotificationProfile } from '../types';

export class WhatsAppChannel implements NotificationChannel {
  channelId = 'whatsapp' as const;

  isAvailable(user: UserNotificationProfile): boolean {
    return false;
  }

  async send(payload: NotificationPayload, user: UserNotificationProfile): Promise<DeliveryResult> {
    throw new Error('NotImplementedError: WhatsApp channel is not implemented in Phase 1');
  }
}
