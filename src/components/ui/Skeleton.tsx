import * as React from 'react';
import { cn } from '@/lib/ui-utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'card' | 'circle';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', ...props }, ref) => {
    const variants = {
      text: 'h-4 w-full rounded-md',
      card: 'h-32 w-full rounded-xl',
      circle: 'h-12 w-12 rounded-full',
    };

    return (
      <div
        ref={ref}
        className={cn('animate-pulse bg-surface-raised', variants[variant], className)}
        {...props}
      />
    );
  }
);
Skeleton.displayName = 'Skeleton';
