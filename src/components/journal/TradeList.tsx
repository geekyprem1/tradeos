import * as React from 'react';
import { TradeJournal, PlaybookSetup } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { formatINR, toIST } from '@/lib/utils';
import { PsychTag } from '@/components/journal/PsychTag';
import { Button } from '@/components/ui/Button';
import { Lock, Edit2 } from 'lucide-react';

interface TradeListProps {
  trades: TradeJournal[];
  setups: PlaybookSetup[];
  onEdit?: (trade: TradeJournal) => void;
}

export function TradeList({ trades, setups, onEdit }: TradeListProps) {
  if (trades.length === 0) {
    return (
      <Card padding="lg" className="text-center py-12 border-dashed">
        <p className="text-muted text-sm">No trades logged for this session yet.</p>
      </Card>
    );
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface border-b border-muted">
            <tr>
              <th className="px-4 py-3 font-medium text-muted uppercase tracking-wider text-xs">Time (IST)</th>
              <th className="px-4 py-3 font-medium text-muted uppercase tracking-wider text-xs">Instrument</th>
              <th className="px-4 py-3 font-medium text-muted uppercase tracking-wider text-xs">Setup</th>
              <th className="px-4 py-3 font-medium text-muted uppercase tracking-wider text-xs">Rules Followed</th>
              <th className="px-4 py-3 font-medium text-muted uppercase tracking-wider text-xs">Psychology</th>
              <th className="px-4 py-3 font-medium text-muted uppercase tracking-wider text-xs text-right">P&L</th>
              <th className="px-4 py-3 font-medium text-muted uppercase tracking-wider text-xs text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted/30">
            {trades.map((trade) => {
              const setupName = setups.find(s => s.id === trade.setup_id)?.name || 'Unknown';
              const time = toIST(new Date(trade.logged_at)).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              const isLocked = !!trade.locked_at;

              return (
                <tr key={trade.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{time}</td>
                  <td className="px-4 py-3 font-bold text-white">{trade.instrument || '-'}</td>
                  <td className="px-4 py-3 text-white">{setupName}</td>
                  <td className="px-4 py-3">
                    {trade.rule_followed ? (
                      <span className="text-success text-xs font-semibold px-2 py-1 bg-success/10 rounded">YES</span>
                    ) : (
                      <span className="text-danger text-xs font-semibold px-2 py-1 bg-danger/10 rounded">NO</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <PsychTag tag={trade.psychology_tag} />
                  </td>
                  <td className={`px-4 py-3 text-right font-bold ${trade.pnl_inr >= 0 ? 'text-success' : 'text-danger'}`}>
                    {formatINR(trade.pnl_inr)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isLocked ? (
                      <span title="Journal is locked"><Lock className="w-4 h-4 text-muted mx-auto" /></span>
                    ) : (
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => onEdit && onEdit(trade)}
                        className="py-1 px-2 h-auto"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
