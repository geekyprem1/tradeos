import * as React from 'react';
import { cn } from '@/lib/ui-utils';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  value: number;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, value, min = 1, max = 10, ...props }, ref) => {
    const uniqueId = React.useId();
    const sliderId = props.id || uniqueId;

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <div className="mb-2 flex justify-between">
            <label htmlFor={sliderId} className="text-sm font-medium text-white">{label}</label>
            <span className="text-sm font-bold text-white">{value}</span>
          </div>
        )}
        <input
          type="range"
          ref={ref}
          id={sliderId}
          value={value}
          min={min}
          max={max}
          className={cn(
            'h-2 w-full cursor-pointer appearance-none rounded-lg bg-surface-raised accent-brand-accent',
          )}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = 'Slider';
