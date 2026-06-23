'use client';

import * as React from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { PlaybookSetup, TradeIntent, IntentResponse } from '@/lib/types';
import { todayIST } from '@/lib/utils';
import { IntentForm } from '@/components/intent/IntentForm';
import { ValidationResult } from '@/components/intent/ValidationResult';
import { IntentHistory } from '@/components/intent/IntentHistory';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function IntentPage() {
  const supabase = createBrowserClient();
  const [isLoading, setIsLoading] = React.useState(true);
  const [noContract, setNoContract] = React.useState(false);

  const [contractSetups, setContractSetups] = React.useState<PlaybookSetup[]>([]);
  const [budgetRemaining, setBudgetRemaining] = React.useState(0);
  const [allSetups, setAllSetups] = React.useState<PlaybookSetup[]>([]);
  const [intents, setIntents] = React.useState<TradeIntent[]>([]);

  // Local state for current validation
  const [currentResult, setCurrentResult] = React.useState<IntentResponse | null>(null);
  const [currentIntentId, setCurrentIntentId] = React.useState<string | null>(null);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const today = todayIST();

    // Fetch daily session
    const { data: sessionData } = await supabase
      .from('daily_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('session_date', today)
      .single();

    if (!sessionData || !sessionData.contract_signed_at) {
      setNoContract(true);
      setIsLoading(false);
      return;
    }

    setNoContract(false);

    const max_loss = sessionData.contract_max_loss_inr || 0;
    const realized = sessionData.realized_pnl_inr || 0;
    setBudgetRemaining(max_loss + realized);

    // Fetch all active setups
    const { data: setupsData } = await supabase
      .from('playbook_setups')
      .select('*')
      .eq('user_id', session.user.id)
      .is('archived_at', null);

    if (setupsData) {
      setAllSetups(setupsData);
      const allowedIds = sessionData.contract_allowed_setup_ids || [];
      const allowed = setupsData.filter(s => allowedIds.includes(s.id));
      setContractSetups(allowed);
    }

    // Fetch today's intents
    const { data: intentsData } = await supabase
      .from('trade_intents')
      .select('*')
      .eq('session_id', sessionData.id)
      .order('submitted_at', { ascending: false });

    if (intentsData) {
      setIntents(intentsData);
    }

    setIsLoading(false);
  }, [supabase]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleValidationResult = (result: IntentResponse, intentId: string) => {
    setCurrentResult(result);
    setCurrentIntentId(intentId);
    loadData(); // Refetch history
  };

  const handleReset = () => {
    setCurrentResult(null);
    setCurrentIntentId(null);
  };

  const handleOverrideComplete = () => {
    loadData();
  };

  if (isLoading) {
    return <div className="p-6 text-white">Loading Engine...</div>;
  }

  if (noContract) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
        <Card className="max-w-md text-center p-8 border-warning/50 bg-warning/10">
          <h2 className="text-xl font-bold text-white mb-2">Contract Required</h2>
          <p className="text-muted text-sm mb-6">
            The Intent Engine is locked. You must sign your daily commitment contract before evaluating any trade setups.
          </p>
          <Link href="/contract">
            <Button className="w-full">Sign Daily Contract</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Trade Intent Engine</h1>
        <p className="text-muted text-sm mt-1">
          Validate your setup against your daily contract before executing in the market.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {currentResult && currentIntentId ? (
            <ValidationResult
              result={currentResult}
              intentId={currentIntentId}
              setupId={allSetups.find(s => s.id === (intents.find(i => i.id === currentIntentId)?.setup_id))?.id || ''}
              onOverrideComplete={handleOverrideComplete}
              onReset={handleReset}
            />
          ) : (
            <Card padding="lg">
              <h2 className="text-lg font-bold text-white mb-4">New Trade Intent</h2>
              <IntentForm
                contractSetups={contractSetups}
                budgetRemaining={budgetRemaining}
                onResult={handleValidationResult}
              />
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-white mb-4">Today's Validation History</h2>
          <IntentHistory intents={intents} setups={allSetups} />
        </div>
      </div>
    </div>
  );
}
