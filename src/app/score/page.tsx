'use client';

import * as React from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { todayIST } from '@/lib/utils';
import { ScoreResult } from '@/lib/types';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { ScoreBreakdown } from '@/components/score/ScoreBreakdown';
import { ScoreChart } from '@/components/score/ScoreChart';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContext';
import { RefreshCw } from 'lucide-react';

export default function ScorePage() {
  const supabase = createBrowserClient();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCalculating, setIsCalculating] = React.useState(false);
  
  const [todayScore, setTodayScore] = React.useState<ScoreResult | null>(null);
  const [historicalData, setHistoricalData] = React.useState<{date: string, score: number}[]>([]);

  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const today = todayIST();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Fetch history
    const { data: history } = await supabase
      .from('daily_sessions')
      .select('session_date, score_total, score_checkin_pillar, score_journal_pillar, score_playbook_pillar, score_no_revenge_pillar, score_evening_pillar, score_derived_at, score_algorithm_version')
      .eq('user_id', session.user.id)
      .gte('session_date', thirtyDaysAgoStr)
      .not('score_total', 'is', null)
      .order('session_date', { ascending: true });

    if (history) {
      const chartData = history.map(h => ({
        date: h.session_date,
        score: h.score_total || 0,
      }));
      setHistoricalData(chartData);

      // Check if today is in history
      const todaySession = history.find(h => h.session_date === today && h.score_derived_at);
      if (todaySession) {
        setTodayScore({
          total: todaySession.score_total || 0,
          checkin: todaySession.score_checkin_pillar || 0,
          journal: todaySession.score_journal_pillar || 0,
          playbook: todaySession.score_playbook_pillar || 0,
          noRevenge: todaySession.score_no_revenge_pillar || 0,
          evening: todaySession.score_evening_pillar || 0,
          algorithmVersion: todaySession.score_algorithm_version || 'v1.0',
        });
      }
    }

    setIsLoading(false);
  }, [supabase]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch('/api/score/calculate', { method: 'POST' });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to calculate score');
      }

      showToast({ message: 'Score successfully calculated!', variant: 'success' });
      
      // Update local state immediately
      setTodayScore(data);
      
      // Optionally reload history to add today's point to the chart
      loadData();
    } catch (err: any) {
      showToast({ message: err.message, variant: 'error' });
    } finally {
      setIsCalculating(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-white">Loading Score Hub...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Daily Discipline Score</h1>
        <p className="text-muted text-sm mt-1">
          Your trading performance is measured by how well you follow your rules, not your P&L.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score Area */}
        <div className="lg:col-span-1">
          {todayScore ? (
            <Card padding="lg" className="flex flex-col items-center justify-center text-center h-full">
              <h2 className="text-lg font-bold text-white mb-6">Today's Score</h2>
              <div className="mb-6 transform scale-110">
                <ScoreGauge score={todayScore.total} />
              </div>
              <p className="text-xs text-muted mb-4">Algorithm {todayScore.algorithmVersion}</p>
              <Button variant="secondary" size="sm" onClick={handleCalculate} isLoading={isCalculating}>
                <RefreshCw className="w-3 h-3 mr-2" /> Recalculate
              </Button>
            </Card>
          ) : (
            <Card padding="lg" className="flex flex-col items-center justify-center text-center h-full border-dashed border-brand-primary/50 bg-brand-primary/5">
              <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center mb-4">
                <span className="text-2xl">?</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Score Not Generated</h2>
              <p className="text-sm text-muted mb-6">
                Your score will be automatically calculated at 5:00 PM IST. Or, you can calculate it manually now.
              </p>
              <Button onClick={handleCalculate} isLoading={isCalculating} className="w-full">
                Calculate Now
              </Button>
            </Card>
          )}
        </div>

        {/* Breakdown Area */}
        <div className="lg:col-span-2">
          {todayScore ? (
            <ScoreBreakdown {...todayScore} />
          ) : (
            <Card padding="lg" className="h-full flex flex-col justify-center border-dashed">
              <div className="space-y-6 opacity-30 pointer-events-none grayscale">
                <ScoreBreakdown checkin={0} journal={0} playbook={0} noRevenge={0} evening={0} />
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Chart Area */}
      <div>
        <ScoreChart data={historicalData} />
      </div>
    </div>
  );
}
