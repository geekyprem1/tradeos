import * as React from 'react';
import { TradeIntent, PlaybookSetup } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { toIST } from '@/lib/utils';
import { cn } from '@/lib/ui-utils';
import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface IntentHistoryProps {
  intents: TradeIntent[];
  setups: PlaybookSetup[];
}

export function IntentHistory({ intents, setups }: IntentHistoryProps) {
  if (intents.length === 0) {
    return (
      <Card padding="md" className="text-center py-8 border-dashed">
        <p className="text-muted text-sm">No intents submitted today.</p>
      </Card>
    );
  }

  const getResultBadge = (result: string, userProceeded?: boolean) => {
    if (result === 'go') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-success/10 text-success border border-success/20">
          <CheckCircle2 className="w-3 h-3" /> GO
        </span>
      );
    }
    if (result === 'caution') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-warning/10 text-warning border border-warning/20">
          <AlertCircle className="w-3 h-3" /> CAUTION
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-danger/10 text-danger border border-danger/20">
        <ShieldAlert className="w-3 h-3" /> NO-GO
      </span>
    );
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface border-b border-muted">
            <tr>
              <th className="px-4 py-3 font-medium text-muted uppercase tracking-wider text-xs">Time</th>
              <th className="px-4 py-3 font-medium text-muted uppercase tracking-wider text-xs">Setup</th>
              <th className="px-4 py-3 font-medium text-muted uppercase tracking-wider text-xs">Result</th>
              <th className="px-4 py-3 font-medium text-muted uppercase tracking-wider text-xs">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted/30">
            {intents.map((intent) => {
              const setupName = setups.find(s => s.id === intent.setup_id)?.name || 'Unknown';
              const time = toIST(new Date(intent.submitted_at)).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              });

              return (
                <tr key={intent.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-white whitespace-nowrap">{time}</td>
                  <td className="px-4 py-3 text-white font-medium">{setupName}</td>
                  <td className="px-4 py-3">{getResultBadge(intent.validation_result)}</td>
                  <td className="px-4 py-3">
                    {intent.user_proceeded ? (
                      <span className={cn(
                        "text-xs font-semibold px-2 py-1 rounded",
                        intent.override_reason ? "bg-danger/20 text-danger border border-danger/30" : "text-muted"
                      )}>
                        {intent.override_reason ? 'OVERRIDDEN' : 'PROCEEDED'}
                      </span>
                    ) : (
                      <span className="text-xs text-muted">ABORTED</span>
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
