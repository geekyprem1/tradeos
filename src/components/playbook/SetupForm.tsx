'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PlaybookSetupSchema } from '@/lib/validations';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TIMEFRAMES } from '@/lib/constants';

type SetupFormValues = z.infer<typeof PlaybookSetupSchema>;

interface SetupFormProps {
  defaultValues?: Partial<SetupFormValues>;
  onSubmit: (data: SetupFormValues) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  onCancel?: () => void;
}

export function SetupForm({ defaultValues, onSubmit, isLoading, submitLabel = 'Save Setup', onCancel }: SetupFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SetupFormValues>({
    resolver: zodResolver(PlaybookSetupSchema),
    defaultValues: {
      name: defaultValues?.name || '',
      entry_conditions: defaultValues?.entry_conditions || '',
      timeframe: (defaultValues?.timeframe as SetupFormValues['timeframe']) || '15min',
      min_rr_ratio: defaultValues?.min_rr_ratio || 2.0,
      notes: defaultValues?.notes || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Setup Name"
        placeholder="e.g. Bull Flag Breakout"
        {...register('name')}
        error={errors.name?.message}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Entry Conditions</label>
        <textarea
          className="w-full rounded-md border border-muted bg-surface p-2 text-white outline-none focus:border-brand-primary"
          rows={3}
          placeholder="List exact rules for entry..."
          {...register('entry_conditions')}
        ></textarea>
        {errors.entry_conditions && (
          <p className="text-sm text-danger">{errors.entry_conditions.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Timeframe</label>
        <div className="flex flex-wrap gap-2">
          {TIMEFRAMES.map((tf) => (
            <label key={tf} className="cursor-pointer">
              <input 
                type="radio" 
                value={tf} 
                className="peer sr-only" 
                {...register('timeframe')} 
              />
              <span className="block rounded-full border border-muted bg-surface px-3 py-1.5 text-sm text-muted transition-colors peer-checked:border-brand-primary peer-checked:bg-brand-primary/20 peer-checked:text-brand-accent peer-focus-visible:ring-2 peer-focus-visible:ring-brand-accent">
                {tf}
              </span>
            </label>
          ))}
        </div>
        {errors.timeframe && (
          <p className="text-sm text-danger">{errors.timeframe.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Min Risk:Reward"
          type="number"
          step="0.1"
          {...register('min_rr_ratio', { valueAsNumber: true })}
          error={errors.min_rr_ratio?.message}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Additional Notes</label>
        <textarea
          className="w-full rounded-md border border-muted bg-surface p-2 text-white outline-none focus:border-brand-primary"
          rows={2}
          placeholder="Optional notes or variations..."
          {...register('notes')}
        ></textarea>
      </div>

      <div className="flex gap-4 pt-4">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
