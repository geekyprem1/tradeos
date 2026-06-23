'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ContractSchema } from '@/lib/validations';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PlaybookSetup } from '@/lib/types';
import { cn } from '@/lib/ui-utils';
import { Check } from 'lucide-react';

type ContractFormValues = z.infer<typeof ContractSchema>;

interface ContractFormProps {
  defaultValues?: Partial<ContractFormValues>;
  setups: PlaybookSetup[];
  onSubmit: (data: ContractFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function ContractForm({ defaultValues, setups, onSubmit, isLoading }: ContractFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(ContractSchema),
    defaultValues: {
      max_trades: defaultValues?.max_trades || 3,
      max_loss_inr: defaultValues?.max_loss_inr || 1000,
      allowed_setup_ids: defaultValues?.allowed_setup_ids || [],
      forbidden_conditions: defaultValues?.forbidden_conditions || '',
    },
  });

  const selectedSetupIds = watch('allowed_setup_ids');

  const toggleSetup = (id: string) => {
    const current = new Set(selectedSetupIds || []);
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    setValue('allowed_setup_ids', Array.from(current), { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Maximum Trades Allowed"
          type="number"
          min={1}
          {...register('max_trades', { valueAsNumber: true })}
          error={errors.max_trades?.message}
        />

        <Input
          label="Maximum Daily Loss (₹)"
          type="number"
          min={0}
          step={100}
          {...register('max_loss_inr', { valueAsNumber: true })}
          error={errors.max_loss_inr?.message}
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-end">
          <label className="block text-sm font-medium text-white">Allowed Setups</label>
          <span className="text-xs text-muted">Select at least one</span>
        </div>
        
        {setups.length === 0 ? (
          <div className="p-4 rounded-md border border-dashed border-muted text-center text-sm text-muted">
            You don&apos;t have any active setups. Please create one in the Playbook.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {setups.map((setup) => {
              const isSelected = selectedSetupIds?.includes(setup.id);
              return (
                <div
                  key={setup.id}
                  onClick={() => toggleSetup(setup.id)}
                  className={cn(
                    'cursor-pointer flex items-center justify-between p-3 rounded-lg border transition-colors',
                    isSelected 
                      ? 'border-brand-primary bg-brand-primary/10' 
                      : 'border-muted bg-surface hover:border-brand-primary/50'
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-white">{setup.name}</span>
                    <span className="text-xs text-muted">{setup.timeframe} • Min RR: {setup.min_rr_ratio}</span>
                  </div>
                  <div className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border',
                    isSelected ? 'border-brand-primary bg-brand-primary text-white' : 'border-muted'
                  )}>
                    {isSelected && <Check className="h-3 w-3" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {errors.allowed_setup_ids && (
          <p className="text-sm text-danger mt-1">{errors.allowed_setup_ids.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Forbidden Conditions (Optional)</label>
        <p className="text-xs text-muted mb-2">Note specific times or market behaviors you must avoid today.</p>
        <textarea
          className="w-full rounded-md border border-muted bg-surface p-3 text-white outline-none focus:border-brand-primary"
          rows={3}
          placeholder="e.g. No trading during 2 PM FOMC, No reversal trades today..."
          {...register('forbidden_conditions')}
        ></textarea>
      </div>

      <div className="pt-4 border-t border-muted">
        <Button 
          type="submit" 
          className="w-full" 
          isLoading={isLoading} 
          disabled={setups.length === 0 || (selectedSetupIds?.length || 0) === 0}
        >
          Sign & Lock Contract
        </Button>
      </div>
    </form>
  );
}
