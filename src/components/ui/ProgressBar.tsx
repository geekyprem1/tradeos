import * as React from 'react';
import { cn } from '@/lib/ui-utils';

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  label?: string;
  colorClass?: string;
}

export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ className, value, max = 100, label, colorClass = 'bg-brand-primary', ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    return (
      <div className={cn('w-full', className)} ref={ref} {...props}>
        {label && (
          <div className="mb-1 flex justify-between text-sm font-medium text-white">
            <span>{label}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-raised">
          <div
            className={cn('h-full transition-all duration-300 ease-in-out', colorClass)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
ProgressBar.displayName = 'ProgressBar';
