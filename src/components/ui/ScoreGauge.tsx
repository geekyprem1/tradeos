import * as React from 'react';
import { cn } from '@/lib/ui-utils';

export interface ScoreGaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
}

export const ScoreGauge = React.forwardRef<HTMLDivElement, ScoreGaugeProps>(
  ({ className, score, ...props }, ref) => {
    const clampedScore = Math.max(0, Math.min(100, score));
    const getColorClass = (s: number) => {
      if (s < 40) return 'text-danger';
      if (s < 70) return 'text-yellow-500';
      return 'text-success';
    };

    const colorClass = getColorClass(clampedScore);
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

    return (
      <div ref={ref} className={cn('relative flex flex-col items-center justify-center', className)} {...props}>
        <div className="relative flex items-center justify-center">
          <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              className="text-surface-raised stroke-current"
              strokeWidth="8"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              className={cn('stroke-current transition-all duration-1000 ease-out', colorClass)}
              strokeWidth="8"
              strokeLinecap="round"
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={cn('text-3xl font-bold', colorClass)}>{clampedScore}</span>
            <span className="text-xs uppercase text-muted">Score</span>
          </div>
        </div>
      </div>
    );
  }
);
ScoreGauge.displayName = 'ScoreGauge';
