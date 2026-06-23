'use client';

import * as React from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';
import { TradeJournal, PlaybookSetup } from '@/lib/types';
import { DailyPnLSummary } from '@/components/journal/DailyPnLSummary';
import { TradeList } from '@/components/journal/TradeList';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import { use } from 'react';

export default function JournalDatePage({ params }: { params: Promise<{ date: string }> }) {
  const { date: initialDate } = use(params);
  const supabase = createBrowserClient();
  const [dateStr, setDateStr] = React.useState<string>(initialDate);
  
  const [isLoading, setIsLoading] = React.useState(true);
  const [trades, setTrades] = React.useState<TradeJournal[]>([]);
  const [setups, setSetups] = React.useState<PlaybookSetup[]>([]);
  
  // Daily session stats
  const [tradesTaken, setTradesTaken] = React.useState(0);
  const [realizedPnL, setRealizedPnL] = React.useState(0);

  React.useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Fetch Session
      const { data: sessionData } = await supabase
        .from('daily_sessions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('session_date', dateStr)
        .single();

      if (sessionData) {
        setTradesTaken(sessionData.trades_taken || 0);
        setRealizedPnL(sessionData.realized_pnl_inr || 0);
      }

      // 2. Fetch Setups (for mapping IDs to names)
      const { data: setupsData } = await supabase
        .from('playbook_setups')
        .select('*')
        .eq('user_id', session.user.id);

      if (setupsData) {
        setSetups(setupsData);
      }

      // 3. Fetch Trades for the date
      if (sessionData) {
        const { data: tradesData } = await supabase
          .from('trade_journal')
          .select('*')
          .eq('session_id', sessionData.id)
          .order('logged_at', { ascending: false });

        if (tradesData) {
          setTrades(tradesData);
        }
      }

      setIsLoading(false);
    }
    loadData();
  }, [supabase, dateStr]);

  // Date Navigation
  const dateObj = new Date(dateStr);
  
  const prevDate = new Date(dateObj);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevStr = prevDate.toISOString().split('T')[0];
  
  const nextDate = new Date(dateObj);
  nextDate.setDate(nextDate.getDate() + 1);
  const nextStr = nextDate.toISOString().split('T')[0];

  const handleEdit = (trade: TradeJournal) => {
    // In a full implementation, this would open a modal with TradeForm pre-filled.
    // For now, alerting or simple UI.
    alert('Edit flow is conceptualized. Modal would open here.');
  };

  if (isLoading) {
    return <div className="p-6 text-white">Loading journal...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/journal/${prevStr}`}>
            <Button variant="secondary" size="sm" className="px-2">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-white">Journal: {dateStr}</h1>
          <Link href={`/journal/${nextStr}`}>
            <Button variant="secondary" size="sm" className="px-2">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>

        <Link href="/journal/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Log New Trade
          </Button>
        </Link>
      </div>

      <DailyPnLSummary 
        trades={trades} 
        totalPnL={realizedPnL} 
        tradesTaken={tradesTaken} 
      />

      <TradeList 
        trades={trades} 
        setups={setups} 
        onEdit={handleEdit} 
      />
    </div>
  );
}
