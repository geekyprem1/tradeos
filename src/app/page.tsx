import * as React from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { todayIST } from '@/lib/utils';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DailyLoopProgress } from '@/components/dashboard/DailyLoopProgress';
import { BudgetBar } from '@/components/dashboard/BudgetBar';
import { ScoreChart } from '@/components/score/ScoreChart';
import { Activity, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BehavioralEvent } from '@/lib/types';

export default async function DashboardPage() {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    // Middleware should have caught this, but just in case
    return <div className="p-6 text-white">Please log in.</div>;
  }

  const today = todayIST();

  // Fetch today's session
  const { data: sessionData } = await supabase
    .from('daily_sessions')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('session_date', today)
    .single();

  // Fetch Score History (last 7 days for the mini chart, or we can just use the ScoreChart which handles 30 days but we limit the query)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

  const { data: history } = await supabase
    .from('daily_sessions')
    .select('session_date, score_total')
    .eq('user_id', session.user.id)
    .gte('session_date', thirtyDaysAgoStr)
    .not('score_total', 'is', null)
    .order('session_date', { ascending: true });

  const chartData = history ? history.map(h => ({
    date: h.session_date,
    score: h.score_total || 0,
  })) : [];

  // Fetch setups for allowed setups display
  const { data: allSetups } = await supabase
    .from('playbook_setups')
    .select('id, name')
    .eq('user_id', session.user.id);

  // Fetch today's behavioral events
  const { data: todayEvents } = await supabase
    .from('behavioral_events')
    .select('*')
    .eq('session_id', sessionData?.id)
    .order('occurred_at', { ascending: false })
    .limit(5);

  // Computed Values
  const checkinDone = !!sessionData?.checkin_completed_at;
  const contractDone = !!sessionData?.contract_signed_at;
  const scoreDone = !!sessionData?.score_derived_at;
  const maxTrades = sessionData?.contract_max_trades || 0;
  const tradesTaken = sessionData?.trades_taken || 0;
  const realizedPnL = sessionData?.realized_pnl_inr || 0;
  const maxLoss = sessionData?.contract_max_loss_inr || 0;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">TradingOS Dashboard</h1>
          <p className="text-muted text-sm mt-1">Date: {today}</p>
        </div>
      </div>

      <DailyLoopProgress 
        checkinDone={checkinDone}
        contractDone={contractDone}
        tradesTaken={tradesTaken}
        scoreDone={scoreDone}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          label="Readiness Score" 
          value={sessionData?.readiness_score ? `${sessionData.readiness_score}/100` : '--'} 
          icon={<Zap className="w-4 h-4 text-brand-accent" />}
          linkTo="/checkin"
          valueColor={sessionData?.readiness_score && sessionData.readiness_score > 70 ? 'success' : 'default'}
        />
        
        <MetricCard 
          label="Discipline Score" 
          value={sessionData?.score_total ? `${sessionData.score_total}/100` : '--'} 
          icon={<Target className="w-4 h-4 text-brand-primary" />}
          linkTo="/score"
          valueColor={sessionData?.score_total && sessionData.score_total > 80 ? 'brand' : 'default'}
        />

        <MetricCard 
          label="Trades Taken" 
          value={`${tradesTaken} / ${maxTrades || '--'}`}
          icon={<Activity className="w-4 h-4 text-muted" />}
          linkTo="/intent"
          valueColor={maxTrades > 0 && tradesTaken >= maxTrades ? 'danger' : 'default'}
        />

        <MetricCard 
          label="Today's P&L" 
          value={realizedPnL === 0 ? '₹0' : realizedPnL > 0 ? `+₹${realizedPnL}` : `-₹${Math.abs(realizedPnL)}`}
          icon={realizedPnL >= 0 ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-danger" />}
          valueColor={realizedPnL > 0 ? 'success' : realizedPnL < 0 ? 'danger' : 'default'}
          linkTo={`/journal/${today}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {contractDone ? (
            <>
              <BudgetBar maxLoss={maxLoss} realizedPnL={realizedPnL} />
              <Card padding="md">
                <h3 className="text-sm font-bold text-white mb-3">Allowed Setups</h3>
                <div className="flex flex-wrap gap-2">
                  {sessionData?.contract_allowed_setup_ids?.map((id: string) => {
                    const setup = allSetups?.find(s => s.id === id);
                    return (
                      <span key={id} className="px-2 py-1 bg-surface-raised text-xs rounded text-white border border-muted/30">
                        {setup?.name || 'Unknown'}
                      </span>
                    );
                  }) || <span className="text-xs text-muted">None allowed</span>}
                </div>
              </Card>
            </>
          ) : (
            <MetricCard 
              label="Daily Budget & Setups" 
              value="Locked" 
              sublabel="Sign your daily contract to unlock."
              linkTo="/contract"
              valueColor="warning"
            />
          )}
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <ScoreChart data={chartData} />
          
          <Card padding="md">
            <h3 className="text-sm font-bold text-white mb-4">Behavioral Events</h3>
            {todayEvents && todayEvents.length > 0 ? (
              <div className="space-y-3">
                {todayEvents.map((event: BehavioralEvent) => (
                  <div key={event.id} className="flex justify-between items-start border-b border-muted/20 pb-2 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-white">{event.event_type}</p>
                      <p className="text-xs text-muted mt-1">{JSON.stringify(event.metadata)}</p>
                    </div>
                    <span className="text-xs text-muted whitespace-nowrap ml-4">
                      {new Date(event.occurred_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted">No events recorded today.</p>
            )}
          </Card>
        </div>
      </div>
      
      {!scoreDone && tradesTaken > 0 && (
        <div className="flex justify-center mt-8">
          <Link href="/score">
            <Button size="lg" className="w-full sm:w-auto">
              Finish Day & Calculate Score
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
