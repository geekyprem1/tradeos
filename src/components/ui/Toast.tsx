'use client';

import * as React from 'react';
import { cn } from '@/lib/ui-utils';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = 'info', message, onClose, duration = 3000, ...props }, ref) => {
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
      success: <CheckCircle className="h-5 w-5 text-success" />,
      error: <AlertTriangle className="h-5 w-5 text-danger" />,
      info: <Info className="h-5 w-5 text-brand-primary" />,
    };

    const borders = {
      success: 'border-l-4 border-success',
      error: 'border-l-4 border-danger',
      info: 'border-l-4 border-brand-primary',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'pointer-events-auto flex w-full max-w-sm items-center justify-between space-x-4 rounded-lg bg-surface-raised p-4 shadow-lg ring-1 ring-black/5',
          borders[variant],
          className
        )}
        {...props}
      >
        <div className="flex items-center space-x-3">
          {icons[variant]}
          <p className="text-sm font-medium text-white">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-muted transition-colors hover:bg-surface hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
);
Toast.displayName = 'Toast';
