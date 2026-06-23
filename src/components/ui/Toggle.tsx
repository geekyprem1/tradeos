import * as React from 'react';
import { cn } from '@/lib/ui-utils';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className, label, disabled, checked, ...props }, ref) => {
    return (
      <label className={cn('flex cursor-pointer items-center', disabled && 'cursor-not-allowed opacity-50', className)}>
        <div className="relative">
          <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} ref={ref} {...props} />
          <div className={cn("block h-6 w-10 rounded-full transition-colors", checked ? "bg-brand-primary" : "bg-muted")}></div>
          <div className={cn("absolute top-1 h-4 w-4 rounded-full bg-white transition-transform", checked ? "translate-x-4" : "translate-x-0")}></div>
        </div>
        {label && <span className="ml-3 text-sm font-medium text-white">{label}</span>}
      </label>
    );
  }
);
Toggle.displayName = 'Toggle';
