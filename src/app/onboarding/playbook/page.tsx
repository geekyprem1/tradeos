'use client';

import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastContext';
import { SetupForm } from '@/components/playbook/SetupForm';

export default function OnboardingPlaybookPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const supabase = createBrowserClient();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      showToast({ message: 'No active session found', variant: 'error' });
      setIsLoading(false);
      return;
    }

    // Insert Playbook Setup
    const { error: setupError } = await supabase
      .from('playbook_setups')
      .insert({
        user_id: session.user.id,
        name: data.name,
        entry_conditions: data.entry_conditions,
        timeframe: data.timeframe,
        min_rr_ratio: data.min_rr_ratio,
        notes: data.notes,
        total_trades: 0,
        winning_trades: 0,
        is_active: true,
      });

    if (setupError) {
      showToast({ message: setupError.message, variant: 'error' });
      setIsLoading(false);
      return;
    }

    // Update profile onboarding_completed
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true })
      .eq('id', session.user.id);

    setIsLoading(false);

    if (profileError) {
      showToast({ message: profileError.message, variant: 'error' });
    } else {
      showToast({ message: 'Welcome to TradingOS!', variant: 'success' });
      router.push('/');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card variant="raised" padding="lg" className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">First Playbook Setup</h1>
          <span className="text-sm font-medium text-muted">Step 2 of 2</span>
        </div>
        
        <p className="mb-6 text-sm text-muted">
          Add your first trading setup. You can add more later in the Playbook module.
        </p>

        <SetupForm 
          onSubmit={onSubmit} 
          isLoading={isLoading} 
          submitLabel="Complete Setup" 
        />
      </Card>
    </div>
  );
}
