import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IntentRequestSchema } from '@/lib/validations';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PlaybookSetup, IntentResponse } from '@/lib/types';
import { formatINR, todayIST } from '@/lib/utils';
import { useToast } from '@/components/ui/ToastContext';

type IntentFormValues = Omit<z.infer<typeof IntentRequestSchema>, 'session_date'>;

interface IntentFormProps {
  contractSetups: PlaybookSetup[];
  budgetRemaining: number;
  onResult: (result: IntentResponse, intentId: string) => void;
}

export function IntentForm({ contractSetups, budgetRemaining, onResult }: IntentFormProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IntentFormValues>({
    resolver: zodResolver(IntentRequestSchema.omit({ session_date: true })),
    defaultValues: {
      setup_id: contractSetups[0]?.id || '',
      risk_amount_inr: 0,
      rr_ratio: 2.0,
    },
  });

  const onSubmit = async (data: IntentFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/intent/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          session_date: todayIST(),
        }),
      });

      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.error || 'Failed to validate intent');
      }

      onResult(resultData as IntentResponse, resultData.intent_id);
    } catch (err: any) {
      showToast({ message: err.message, variant: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Select
        label="Select Setup"
        {...register('setup_id')}
        error={errors.setup_id?.message}
      >
        <option value="">-- Choose a setup --</option>
        {contractSetups.map(setup => (
          <option key={setup.id} value={setup.id}>{setup.name}</option>
        ))}
      </Select>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label="Risk Amount (₹)"
            type="number"
            min={0}
            step={100}
            {...register('risk_amount_inr', { valueAsNumber: true })}
            error={errors.risk_amount_inr?.message}
          />
          <p className="text-xs text-muted mt-1">
            Budget left: <span className={budgetRemaining < 500 ? 'text-danger' : 'text-success'}>{formatINR(budgetRemaining)}</span>
          </p>
        </div>

        <Input
          label="Target R:R Ratio"
          type="number"
          step="0.1"
          min={0.1}
          {...register('rr_ratio', { valueAsNumber: true })}
          error={errors.rr_ratio?.message}
        />
      </div>

      <Button type="submit" className="w-full h-12 text-lg" isLoading={isLoading}>
        Validate Intent
      </Button>
    </form>
  );
}
