import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { Clock, Activity, Edit2, Archive, BarChart2 } from 'lucide-react';
import { PlaybookSetup } from '@/lib/types';
import { cn } from '@/lib/ui-utils';

interface SetupCardProps {
  setup: PlaybookSetup;
  onEdit: (setup: PlaybookSetup) => void;
  onArchive: (id: string) => void;
  isArchiving?: boolean;
}

export function SetupCard({ setup, onEdit, onArchive, isArchiving }: SetupCardProps) {
  const isLowData = setup.total_trades < 10;
  const winRate = setup.total_trades > 0 
    ? Math.round((setup.winning_trades / setup.total_trades) * 100)
    : 0;

  return (
    <Card className="flex flex-col h-full group" padding="md">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand-primary transition-colors">
            {setup.name}
          </h3>
          <div className="flex items-center space-x-3 text-sm text-muted">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {setup.timeframe}
            </span>
            <span className="flex items-center">
              <Activity className="w-4 h-4 mr-1" />
              Min RR: {setup.min_rr_ratio}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onEdit(setup)}
            className="p-2 bg-surface hover:bg-surface-raised text-muted hover:text-white rounded-md transition-colors"
            title="Edit Setup"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onArchive(setup.id)}
            disabled={isArchiving}
            className="p-2 bg-surface hover:bg-danger/20 text-muted hover:text-danger rounded-md transition-colors disabled:opacity-50"
            title="Archive Setup"
          >
            <Archive className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between p-3 bg-surface rounded-md border border-muted/30">
          <div>
            <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Win Rate</p>
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-lg font-bold",
                winRate >= 50 ? "text-success" : winRate > 0 ? "text-warning" : "text-white"
              )}>
                {setup.total_trades > 0 ? `${winRate}%` : '--'}
              </span>
              {isLowData && (
                <span className="px-2 py-0.5 text-[10px] font-medium bg-warning/20 text-warning rounded-full border border-warning/30">
                  LOW DATA
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Total Trades</p>
            <span className="text-lg font-bold text-white flex items-center justify-end">
              <BarChart2 className="w-4 h-4 mr-1 text-muted" />
              {setup.total_trades}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
