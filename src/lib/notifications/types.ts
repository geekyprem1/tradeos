import { NotificationPrefs, PushSubscription } from '../types';

export interface NotificationPayload {
  type: string;
  title: string;
  body: string;
  deeplink: string;
  urgency: 'low' | 'normal' | 'high';
}

export interface DeliveryResult {
  success: boolean;
  channelId: string;
  error?: string;
}

export interface UserNotificationProfile {
  userId: string;
  email: string;
  notificationPrefs: NotificationPrefs;
  pushSubscriptions: PushSubscription[];
}

export interface NotificationChannel {
  channelId: 'email' | 'push' | 'whatsapp' | 'telegram' | 'mobile_push';
  isAvailable(user: UserNotificationProfile): boolean;
  send(payload: NotificationPayload, user: UserNotificationProfile): Promise<DeliveryResult>;
}
