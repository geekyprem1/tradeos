import * as React from 'react';
import { cn } from '@/lib/ui-utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', size = 'sm', ...props }, ref) => {
    const variants = {
      success: 'bg-success/20 text-success',
      warning: 'bg-yellow-500/20 text-yellow-500',
      danger: 'bg-danger/20 text-danger',
      neutral: 'bg-muted/20 text-gray-300',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn('inline-flex items-center rounded-full font-medium', variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
