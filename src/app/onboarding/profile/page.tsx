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
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastContext';
import { MARKET_TYPES, TRADING_STYLES } from '@/lib/constants';

type ProfileFormValues = z.infer<typeof ProfileSchema>;

export default function OnboardingProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const supabase = createBrowserClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      capital_base: 100000,
      market_type: 'equity',
      trading_style: 'intraday',
      default_risk_per_trade: 1000,
      default_daily_loss_limit: 2000,
      default_max_trades: 3,
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      showToast({ message: 'No active session found', variant: 'error' });
      setIsLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        capital_base: data.capital_base,
        market_type: data.market_type,
        trading_style: data.trading_style,
        default_risk_per_trade: data.default_risk_per_trade,
        default_daily_loss_limit: data.default_daily_loss_limit,
        default_max_trades: data.default_max_trades,
      })
      .eq('id', session.user.id);

    setIsLoading(false);

    if (error) {
      showToast({ message: error.message, variant: 'error' });
    } else {
      router.push('/onboarding/playbook');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card variant="raised" padding="lg" className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Risk Profile</h1>
          <span className="text-sm font-medium text-muted">Step 1 of 2</span>
        </div>
        
        <p className="mb-6 text-sm text-muted">
          Tell us about your trading style to personalize your TradingOS experience.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Capital Base (₹)"
            type="number"
            {...register('capital_base', { valueAsNumber: true })}
            error={errors.capital_base?.message}
          />

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

          <Input
            label="Max Trades per Day"
            type="number"
            {...register('default_max_trades', { valueAsNumber: true })}
            error={errors.default_max_trades?.message}
          />
          
          <Button type="submit" className="w-full mt-6" isLoading={isLoading}>
            Continue to Playbook
          </Button>
        </form>
      </Card>
    </div>
  );
}
