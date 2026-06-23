import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { formatINR } from '@/lib/utils';

interface BudgetBarProps {
  maxLoss: number;
  realizedPnL: number;
}

export function BudgetBar({ maxLoss, realizedPnL }: BudgetBarProps) {
  // Budget Remaining = Max Loss + Realized PnL (where realizedPnL can be negative or positive)
  // Example: maxLoss = 10000. Loss of -2000 -> budget remaining = 8000.
  // Example: maxLoss = 10000. Profit of 5000 -> budget remaining = 15000.
  
  const budgetRemaining = Math.max(0, maxLoss + realizedPnL);
  
  // Cap percentage at 100% for the visual bar (if they are in profit, the bar is full)
  const percentage = Math.min(100, Math.round((budgetRemaining / maxLoss) * 100)) || 0;

  let colorClass = 'bg-success';
  if (percentage < 20) {
    colorClass = 'bg-danger';
  } else if (percentage < 50) {
    colorClass = 'bg-warning';
  }

  return (
    <Card padding="md">
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">Remaining Loss Budget</span>
        <span className={`text-sm font-bold ${percentage < 20 ? 'text-danger' : percentage < 50 ? 'text-warning' : 'text-success'}`}>
          {formatINR(budgetRemaining)}
        </span>
      </div>
      <div className="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-muted flex justify-between">
        <span>Current P&L: <span className={realizedPnL >= 0 ? 'text-success' : 'text-danger'}>{formatINR(realizedPnL)}</span></span>
        <span>Base Limit: {formatINR(maxLoss)}</span>
      </div>
    </Card>
  );
}
