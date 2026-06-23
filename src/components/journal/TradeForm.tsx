'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TradeJournalSchema } from '@/lib/validations';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { PlaybookSetup, TradeIntent } from '@/lib/types';
import { PSYCHOLOGY_TAGS } from '@/lib/constants';
import { formatINR } from '@/lib/utils';
import { Toggle } from '@/components/ui/Toggle';

type TradeFormValues = z.infer<typeof TradeJournalSchema>;

interface TradeFormProps {
  setups: PlaybookSetup[];
  defaultIntentId?: string;
  defaultSetupId?: string;
  intentData?: TradeIntent | null; // using proper type
  onSubmit: (data: TradeFormValues) => Promise<void>;
  isLoading?: boolean;
}

export function TradeForm({ setups, defaultIntentId, defaultSetupId, intentData, onSubmit, isLoading }: TradeFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(TradeJournalSchema),
    defaultValues: {
      intent_id: defaultIntentId,
      setup_id: defaultSetupId || '',
      instrument: '',
      entry_price: 0,
      exit_price: 0,
      quantity: 1,
      psychology_tag: 'focus',
      rule_followed: true,
      deviation_note: '',
      notes: '',
    },
  });

  const entry = watch('entry_price') || 0;
  const exit = watch('exit_price') || 0;
  const qty = watch('quantity') || 0;
  const ruleFollowed = watch('rule_followed');

  // Simple long logic calculation: (exit - entry) * qty
  // For shorts, the user would enter exit lower than entry to get profit. Wait, (exit - entry) for shorts is negative. 
  // Let's assume standard P&L calculation here based on direction, but we don't ask for direction.
  // We'll trust user input for negative PnL or we can just ask them to enter final PnL? 
  // PRD: "Auto-computed P&L display: (exit - entry) × qty — live as user types".
  // Note: if user is shorting, they'll need to negate it, but for now we follow PRD strictly.
  const livePnL = (exit - entry) * qty;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Hidden intent ID if passed from intent engine */}
      {defaultIntentId && <input type="hidden" {...register('intent_id')} />}

      {intentData && intentData.validation_result === 'no_go' && intentData.user_proceeded && (
        <div className="bg-danger/10 p-4 rounded-lg border border-danger/30 mb-6">
          <p className="text-sm font-semibold text-danger uppercase tracking-wider mb-2">
            ⚠️ Reflect on your Override
          </p>
          <p className="text-sm text-white mb-2">
            This trade came from a NO-GO override. You justified it with:
          </p>
          <p className="text-sm text-muted italic">&quot;{intentData.override_reason}&quot;</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Instrument / Ticker"
          placeholder="e.g. NIFTY50, RELIANCE"
          {...register('instrument')}
          error={errors.instrument?.message}
        />
        <Select
          label="Setup Used"
          {...register('setup_id')}
          error={errors.setup_id?.message}
        >
          <option value="">-- Select Setup --</option>
          {setups.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Entry Price"
          type="number"
          step="0.05"
          {...register('entry_price', { valueAsNumber: true })}
          error={errors.entry_price?.message}
        />
        <Input
          label="Exit Price"
          type="number"
          step="0.05"
          {...register('exit_price', { valueAsNumber: true })}
          error={errors.exit_price?.message}
        />
        <Input
          label="Quantity"
          type="number"
          {...register('quantity', { valueAsNumber: true })}
          error={errors.quantity?.message}
        />
      </div>

      <div className="p-4 rounded-lg bg-surface border border-muted/30 flex justify-between items-center">
        <span className="text-sm font-medium text-muted uppercase">Computed P&L</span>
        <span className={`text-xl font-bold ${livePnL > 0 ? 'text-success' : livePnL < 0 ? 'text-danger' : 'text-white'}`}>
          {formatINR(livePnL)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <Select
          label="Primary Emotion / Psychology"
          {...register('psychology_tag')}
          error={errors.psychology_tag?.message}
        >
          {PSYCHOLOGY_TAGS.map(tag => (
            <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>
          ))}
        </Select>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white">Did you follow your rules?</label>
          <Toggle
            checked={ruleFollowed}
            onChange={(e: React.ChangeEvent<HTMLInputElement> | boolean) => setValue('rule_followed', typeof e === 'boolean' ? e : e.target.checked)}
            label={ruleFollowed ? 'Yes, strictly' : 'No, I deviated'}
          />
        </div>
      </div>

      {!ruleFollowed && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-danger">Deviation Note (Required)</label>
          <textarea
            className="w-full rounded-md border border-danger/50 bg-danger/5 p-3 text-white outline-none focus:border-danger"
            rows={3}
            placeholder="Explain why you broke your rules..."
            {...register('deviation_note')}
          ></textarea>
          {errors.deviation_note && <p className="text-sm text-danger mt-1">{errors.deviation_note.message}</p>}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">Journal Notes (Optional)</label>
        <textarea
          className="w-full rounded-md border border-muted bg-surface p-3 text-white outline-none focus:border-brand-primary"
          rows={3}
          placeholder="Market context, mistakes, lessons..."
          {...register('notes')}
        ></textarea>
      </div>

      <Button type="submit" className="w-full h-12" isLoading={isLoading}>
        Log Trade to Journal
      </Button>
    </form>
  );
}
