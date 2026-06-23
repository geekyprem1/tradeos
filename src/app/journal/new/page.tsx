'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import { PlaybookSetup } from '@/lib/types';
import { todayIST } from '@/lib/utils';
import { TradeForm } from '@/components/journal/TradeForm';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/ToastContext';

function NewJournalEntryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const supabase = createBrowserClient();

  const intentId = searchParams.get('intent_id') || undefined;
  const setupId = searchParams.get('setup_id') || undefined;

  const [setups, setSetups] = React.useState<PlaybookSetup[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function fetchSetups() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from('playbook_setups')
        .select('*')
        .eq('user_id', session.user.id)
        .is('archived_at', null)
        .order('name', { ascending: true });

      if (data) {
        setSetups(data);
      }
      setIsLoading(false);
    }
    fetchSetups();
  }, [supabase]);

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const today = todayIST();

      // 1. Fetch daily session ID
      const { data: dailySession, error: sessionError } = await supabase
        .from('daily_sessions')
        .select('id, trades_taken, realized_pnl_inr')
        .eq('user_id', session.user.id)
        .eq('session_date', today)
        .single();

      if (sessionError || !dailySession) {
        throw new Error('Please complete Morning Check-in first before logging trades.');
      }

      const pnl = (formData.exit_price - formData.entry_price) * formData.quantity;

      // 2. INSERT trade_journal
      const { error: insertError } = await supabase.from('trade_journal').insert({
        user_id: session.user.id,
        session_id: dailySession.id,
        intent_id: formData.intent_id || null,
        setup_id: formData.setup_id || null,
        instrument: formData.instrument,
        entry_price: formData.entry_price,
        exit_price: formData.exit_price,
        quantity: formData.quantity,
        pnl_inr: pnl,
        psychology_tag: formData.psychology_tag,
        rule_followed: formData.rule_followed,
        deviation_note: formData.deviation_note || null,
        notes: formData.notes || null,
        logged_at: new Date().toISOString(),
      });

      if (insertError) throw new Error(insertError.message);

      // 3. UPDATE daily_sessions (trades_taken++, realized_pnl_inr += pnl_inr)
      await supabase
        .from('daily_sessions')
        .update({
          trades_taken: (dailySession.trades_taken || 0) + 1,
          realized_pnl_inr: (dailySession.realized_pnl_inr || 0) + pnl,
        })
        .eq('id', dailySession.id);

      // 4. UPDATE playbook_setups
      if (formData.setup_id) {
        const { data: setupData } = await supabase
          .from('playbook_setups')
          .select('total_trades, winning_trades')
          .eq('id', formData.setup_id)
          .single();

        if (setupData) {
          const isWin = pnl > 0;
          await supabase
            .from('playbook_setups')
            .update({
              total_trades: setupData.total_trades + 1,
              winning_trades: setupData.winning_trades + (isWin ? 1 : 0),
            })
            .eq('id', formData.setup_id);
        }
      }

      // 5. INSERT behavioral_events 'trade_logged'
      await supabase.from('behavioral_events').insert({
        user_id: session.user.id,
        session_id: dailySession.id,
        event_type: 'trade_logged',
        metadata: {
          pnl,
          tag: formData.psychology_tag,
          rule_followed: formData.rule_followed,
          setup_id: formData.setup_id,
        },
      });

      // 6. Check Evening Activity (After 4 PM IST)
      const now = new Date();
      const currentHourUTC = now.getUTCHours();
      const currentMinuteUTC = now.getUTCMinutes();
      // IST is UTC + 5:30.
      // 4:00 PM IST is 10:30 AM UTC.
      const currentMinutesSinceMidnightUTC = currentHourUTC * 60 + currentMinuteUTC;
      const thresholdMinutes = 10 * 60 + 30; // 10:30 AM UTC
      
      if (currentMinutesSinceMidnightUTC >= thresholdMinutes) {
        await supabase.from('behavioral_events').insert({
          user_id: session.user.id,
          session_id: dailySession.id,
          event_type: 'evening_activity',
          metadata: { activity_type: 'trade_logged' },
        });
      }

      showToast({ message: 'Trade logged successfully.', variant: 'success' });
      router.push(`/journal/${today}`);

    } catch (err: any) {
      showToast({ message: err.message, variant: 'error' });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Log Trade</h1>
        <p className="text-muted text-sm mt-1">
          Record the exact outcomes and psychology of your trade.
        </p>
      </div>

      <Card padding="lg">
        <TradeForm
          setups={setups}
          defaultIntentId={intentId}
          defaultSetupId={setupId}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </Card>
    </div>
  );
}

export default function NewJournalEntryPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-white">Loading form...</div>}>
      <NewJournalEntryContent />
    </React.Suspense>
  );
}
