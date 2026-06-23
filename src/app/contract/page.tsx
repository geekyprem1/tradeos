'use client';

import * as React from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ContractForm } from '@/components/contract/ContractForm';
import { ContractSummary } from '@/components/contract/ContractSummary';
import { useToast } from '@/components/ui/ToastContext';
import { todayIST, toIST } from '@/lib/utils';
import { PlaybookSetup } from '@/lib/types';
import { Card } from '@/components/ui/Card';

export default function ContractPage() {
  const supabase = createBrowserClient();
  const router = useRouter();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [sessionData, setSessionData] = React.useState<any>(null);
  const [profileData, setProfileData] = React.useState<any>(null);
  const [activeSetups, setActiveSetups] = React.useState<PlaybookSetup[]>([]);

  React.useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const today = todayIST();

      // 1. Fetch today's session
      const { data: sessionDataRes, error: sessionError } = await supabase
        .from('daily_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('session_date', today)
        .single();

      if (sessionError && sessionError.code !== 'PGRST116') {
        showToast({ message: sessionError.message, variant: 'error' });
      }

      if (!sessionDataRes || !sessionDataRes.checkin_completed_at) {
        // No check-in today, redirect to checkin
        router.push('/checkin');
        return;
      }

      setSessionData(sessionDataRes);

      // 2. Fetch active playbook setups
      const { data: setupsRes } = await supabase
        .from('playbook_setups')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_active', true)
        .is('archived_at', null)
        .order('created_at', { ascending: false });

      if (setupsRes) setActiveSetups(setupsRes);

      // 3. Fetch profile defaults (if contract not already signed)
      if (!sessionDataRes.contract_signed_at) {
        const { data: profileRes } = await supabase
          .from('profiles')
          .select('default_max_trades, default_daily_loss_limit')
          .eq('id', session.user.id)
          .single();
        if (profileRes) setProfileData(profileRes);
      }

      setIsLoading(false);
    }
    loadData();
  }, [supabase, router, showToast]);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const now = new Date().toISOString();

    // 1. UPDATE daily_sessions
    const { data: updatedSession, error: updateError } = await supabase
      .from('daily_sessions')
      .update({
        contract_max_trades: formData.max_trades,
        contract_max_loss_inr: formData.max_loss_inr,
        contract_allowed_setup_ids: formData.allowed_setup_ids,
        contract_forbidden_conditions: formData.forbidden_conditions,
        contract_signed_at: now,
      })
      .eq('id', sessionData.id)
      .select()
      .single();

    if (updateError) {
      showToast({ message: updateError.message, variant: 'error' });
      setIsSubmitting(false);
      return;
    }

    // 2. INSERT behavioral_events
    await supabase.from('behavioral_events').insert({
      user_id: session.user.id,
      session_id: updatedSession.id,
      event_type: 'contract_signed',
      metadata: {
        max_trades: formData.max_trades,
        max_loss_inr: formData.max_loss_inr,
        setup_ids: formData.allowed_setup_ids,
        signed_at_ist: toIST(new Date()).toISOString(),
      },
    });

    setSessionData(updatedSession);
    setIsSubmitting(false);
    showToast({ message: 'Contract locked successfully', variant: 'success' });
  };

  if (isLoading) {
    return <div className="p-6 text-white">Loading contract...</div>;
  }

  // Contract already signed -> Show Summary
  if (sessionData && sessionData.contract_signed_at) {
    return (
      <div className="mx-auto max-w-2xl p-4 sm:p-6 mt-10">
        <ContractSummary
          maxTrades={sessionData.contract_max_trades}
          maxLoss={sessionData.contract_max_loss_inr}
          allowedSetupIds={sessionData.contract_allowed_setup_ids || []}
          forbiddenConditions={sessionData.contract_forbidden_conditions}
          signedAt={sessionData.contract_signed_at}
          setups={activeSetups}
        />
      </div>
    );
  }

  // Show Form
  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Daily Commitment Contract</h1>
        <p className="text-muted text-sm mt-1">
          Lock in your limits for today. The Intent Engine will strictly enforce these rules.
        </p>
      </div>

      <Card padding="lg">
        <ContractForm
          setups={activeSetups}
          defaultValues={profileData ? {
            max_trades: profileData.default_max_trades,
            max_loss_inr: profileData.default_daily_loss_limit,
          } : undefined}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </Card>
    </div>
  );
}
