'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProfileSchema } from '@/lib/validations';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastContext';
import { MARKET_TYPES, TRADING_STYLES } from '@/lib/constants';

type ProfileFormValues = z.infer<typeof ProfileSchema>;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function SettingsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSavingProfile, setIsSavingProfile] = React.useState(false);
  const [isSignOutLoading, setIsSignOutLoading] = React.useState(false);
  
  const [pushEnabled, setPushEnabled] = React.useState(false);
  const [notificationPrefs, setNotificationPrefs] = React.useState({
    morning_checkin: true,
    market_open_warning: true,
    journal_reminder: true,
    journal_warning: true,
    evening_planning: true,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
  });

  React.useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          reset({
            capital_base: profile.capital_base,
            market_type: profile.market_type,
            trading_style: profile.trading_style,
            default_risk_per_trade: profile.default_risk_per_trade,
            default_daily_loss_limit: profile.default_daily_loss_limit,
            default_max_trades: profile.default_max_trades,
          });

          if (profile.notification_prefs) {
            setNotificationPrefs({
              morning_checkin: profile.notification_prefs.morning_checkin?.enabled ?? true,
              market_open_warning: profile.notification_prefs.market_open_warning?.enabled ?? true,
              journal_reminder: profile.notification_prefs.journal_reminder?.enabled ?? true,
              journal_warning: profile.notification_prefs.journal_warning?.enabled ?? true,
              evening_planning: profile.notification_prefs.evening_planning?.enabled ?? true,
            });
          }
        }
      }
      setIsLoading(false);
      
      // Check push subscription status
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          setPushEnabled(!!subscription);
        }
      }
    }
    loadData();
  }, [supabase, reset]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSavingProfile(true);
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) return;

    // Build prefs object to save
    const updatedPrefs = {
      morning_checkin: { enabled: notificationPrefs.morning_checkin, time_ist: '08:30' },
      market_open_warning: { enabled: notificationPrefs.market_open_warning, time_ist: '09:00' },
      journal_reminder: { enabled: notificationPrefs.journal_reminder, time_ist: '15:30' },
      journal_warning: { enabled: notificationPrefs.journal_warning, time_ist: '14:00' },
      evening_planning: { enabled: notificationPrefs.evening_planning, time_ist: '20:00' },
    };

    const { error } = await supabase
      .from('profiles')
      .update({
        ...data,
        notification_prefs: updatedPrefs,
      })
      .eq('id', session.user.id);

    setIsSavingProfile(false);

    if (error) {
      showToast({ message: error.message, variant: 'error' });
    } else {
      showToast({ message: 'Settings saved successfully', variant: 'success' });
    }
  };

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    const { error } = await supabase.auth.signOut();
    setIsSignOutLoading(false);

    if (error) {
      showToast({ message: error.message, variant: 'error' });
    } else {
      router.push('/auth/login');
      router.refresh();
    }
  };

  const enablePushNotifications = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      showToast({ message: 'Push notifications are not supported by your browser.', variant: 'error' });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        showToast({ message: 'Notification permission denied.', variant: 'error' });
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        throw new Error('VAPID public key missing');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
      });

      const subJSON = subscription.toJSON();

      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: {
            endpoint: subJSON.endpoint,
            keys: {
              p256dh: subJSON.keys?.p256dh,
              auth: subJSON.keys?.auth,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription on server');
      }

      setPushEnabled(true);
      showToast({ message: 'Push notifications enabled ✓', variant: 'success' });
    } catch (error: any) {
      console.error(error);
      showToast({ message: error.message, variant: 'error' });
    }
  };

  if (isLoading) return <div className="p-6 text-white">Loading settings...</div>;

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-white">Settings</h1>
      
      <div className="space-y-6 max-w-2xl">
        <Card variant="default" padding="lg">
          <h2 className="mb-4 text-lg font-medium text-white">Risk Profile</h2>
          <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Capital Base (₹)"
                type="number"
                {...register('capital_base', { valueAsNumber: true })}
                error={errors.capital_base?.message}
              />
              <Input
                label="Max Trades per Day"
                type="number"
                {...register('default_max_trades', { valueAsNumber: true })}
                error={errors.default_max_trades?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Primary Market"
                {...register('market_type')}
                error={errors.market_type?.message}
              >
                {MARKET_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>

              <Select
                label="Trading Style"
                {...register('trading_style')}
                error={errors.trading_style?.message}
              >
                {TRADING_STYLES.map(style => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Risk per Trade (₹)"
                type="number"
                {...register('default_risk_per_trade', { valueAsNumber: true })}
                error={errors.default_risk_per_trade?.message}
              />
              <Input
                label="Daily Loss Limit (₹)"
                type="number"
                {...register('default_daily_loss_limit', { valueAsNumber: true })}
                error={errors.default_daily_loss_limit?.message}
              />
            </div>

            <div className="mt-8 pt-6 border-t border-muted">
              <h3 className="mb-4 text-base font-medium text-white">Notification Preferences</h3>
              
              <div className="space-y-3 mb-6">
                <Toggle
                  label="Morning Check-in Reminder"
                  checked={notificationPrefs.morning_checkin}
                  onChange={(e) => setNotificationPrefs(prev => ({...prev, morning_checkin: e.target.checked}))}
                />
                <Toggle
                  label="Market Open Warning"
                  checked={notificationPrefs.market_open_warning}
                  onChange={(e) => setNotificationPrefs(prev => ({...prev, market_open_warning: e.target.checked}))}
                />
                <Toggle
                  label="Trade Journal Reminder"
                  checked={notificationPrefs.journal_reminder}
                  onChange={(e) => setNotificationPrefs(prev => ({...prev, journal_reminder: e.target.checked}))}
                />
                <Toggle
                  label="Journal Rule Violation Warning"
                  checked={notificationPrefs.journal_warning}
                  onChange={(e) => setNotificationPrefs(prev => ({...prev, journal_warning: e.target.checked}))}
                />
                <Toggle
                  label="Evening Planning"
                  checked={notificationPrefs.evening_planning}
                  onChange={(e) => setNotificationPrefs(prev => ({...prev, evening_planning: e.target.checked}))}
                />
              </div>

              {!pushEnabled ? (
                <Button type="button" onClick={enablePushNotifications} variant="secondary" className="w-full">
                  Enable Push Notifications
                </Button>
              ) : (
                <div className="rounded-md bg-surface-raised p-3 border border-success">
                  <p className="text-sm font-medium text-success text-center">Push Notifications Enabled ✓</p>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full mt-6" isLoading={isSavingProfile}>
              Save Settings
            </Button>
          </form>
        </Card>

        <Card variant="default" padding="lg">
          <h2 className="mb-4 text-lg font-medium text-white">Account</h2>
          <Button 
            variant="danger" 
            onClick={handleSignOut} 
            isLoading={isSignOutLoading}
          >
            Sign Out
          </Button>
        </Card>
      </div>
    </div>
  );
}
