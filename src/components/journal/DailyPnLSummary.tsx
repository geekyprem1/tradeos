import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { formatINR } from '@/lib/utils';
import { TradeJournal } from '@/lib/types';
import { TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';

interface DailyPnLSummaryProps {
  trades: TradeJournal[];
  totalPnL: number;
  tradesTaken: number;
}

export function DailyPnLSummary({ trades, totalPnL, tradesTaken }: DailyPnLSummaryProps) {
  const isProfitable = totalPnL >= 0;
  
  const wins = trades.filter(t => t.pnl_inr > 0).length;
  const losses = trades.filter(t => t.pnl_inr < 0).length;
  const breakeven = trades.filter(t => t.pnl_inr === 0).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card padding="md" className={isProfitable ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}>
        <div className="flex items-center gap-2 mb-2">
          {isProfitable ? <TrendingUp className="w-4 h-4 text-success" /> : <TrendingDown className="w-4 h-4 text-danger" />}
          <p className="text-xs text-muted uppercase tracking-wider">Net P&L</p>
        </div>
        <p className={`text-2xl font-bold ${isProfitable ? 'text-success' : 'text-danger'}`}>
          {formatINR(totalPnL)}
        </p>
      </Card>

      <Card padding="md">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-brand-accent" />
          <p className="text-xs text-muted uppercase tracking-wider">Trades Logged</p>
        </div>
        <p className="text-2xl font-bold text-white">
          {trades.length} <span className="text-sm text-muted font-normal">/ {tradesTaken} total</span>
        </p>
      </Card>

      <Card padding="md">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-success" />
          <p className="text-xs text-muted uppercase tracking-wider">Wins</p>
        </div>
        <p className="text-2xl font-bold text-white">{wins}</p>
      </Card>

      <Card padding="md">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4 text-danger" />
          <p className="text-xs text-muted uppercase tracking-wider">Losses</p>
        </div>
        <p className="text-2xl font-bold text-white">
          {losses} {breakeven > 0 && <span className="text-sm text-muted font-normal">({breakeven} BE)</span>}
        </p>
      </Card>
    </div>
  );
}
