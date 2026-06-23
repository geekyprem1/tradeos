import * as React from 'react';
import { Card } from '@/components/ui/Card';
import { SCORE_WEIGHTS } from '@/lib/constants';

interface ScoreBreakdownProps {
  checkin: number;
  journal: number;
  playbook: number;
  noRevenge: number;
  evening: number;
}

export function ScoreBreakdown({ checkin, journal, playbook, noRevenge, evening }: ScoreBreakdownProps) {
  const pillars = [
    { name: 'Morning Check-in', current: checkin, max: SCORE_WEIGHTS.checkin },
    { name: 'Trade Journaling', current: journal, max: SCORE_WEIGHTS.journal },
    { name: 'Playbook Compliance', current: playbook, max: SCORE_WEIGHTS.playbook },
    { name: 'No Revenge Trading', current: noRevenge, max: SCORE_WEIGHTS.noRevenge },
    { name: 'Evening Planning', current: evening, max: SCORE_WEIGHTS.evening },
  ];

  return (
    <Card padding="lg" className="space-y-6">
      <h3 className="text-lg font-bold text-white mb-4">Pillar Breakdown</h3>
      
      {pillars.map((pillar) => {
        const percentage = Math.round((pillar.current / pillar.max) * 100);
        
        let colorClass = 'bg-success';
        if (percentage < 50) colorClass = 'bg-danger';
        else if (percentage < 80) colorClass = 'bg-warning';

        return (
          <div key={pillar.name} className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-sm font-medium text-white">{pillar.name}</span>
              <span className="text-xs text-muted">
                {pillar.current} / {pillar.max}
              </span>
            </div>
            <div className="h-2 w-full bg-surface-raised rounded-full overflow-hidden">
              <div 
                className={`h-full ${colorClass} transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </Card>
  );
}
