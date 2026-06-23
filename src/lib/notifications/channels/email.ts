import { Resend } from 'resend';
import { DeliveryResult, NotificationChannel, NotificationPayload, UserNotificationProfile } from '../types';

export class EmailChannel implements NotificationChannel {
  channelId = 'email' as const;
  private resend: Resend | null = null;

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  isAvailable(user: UserNotificationProfile): boolean {
    // Email is available if RESEND_API_KEY is configured and user has an email.
    return !!this.resend && !!user.email;
  }

  async send(payload: NotificationPayload, user: UserNotificationProfile): Promise<DeliveryResult> {
    if (!this.resend) {
      return { success: false, channelId: this.channelId, error: 'Resend is not configured' };
    }

    try {
      const { data, error } = await this.resend.emails.send({
        from: 'TradingOS <notifications@tradingos.dev>', // Should ideally be configured
        to: user.email,
        subject: payload.title,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">${payload.title}</h2>
            <p style="color: #555; line-height: 1.5;">${payload.body}</p>
            ${
              payload.deeplink
                ? `<a href="${payload.deeplink}" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background-color: #2563eb; color: #fff; text-decoration: none; border-radius: 4px;">View in TradingOS</a>`
                : ''
            }
          </div>
        `,
      });

      if (error) {
        return { success: false, channelId: this.channelId, error: error.message };
      }

      return { success: true, channelId: this.channelId };
    } catch (error: any) {
      return { success: false, channelId: this.channelId, error: error.message };
    }
  }
}
