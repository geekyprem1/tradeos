import * as React from 'react';
import Link from 'next/link';
import { IntentResponse } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatINR } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { useToast } from '@/components/ui/ToastContext';

interface ValidationResultProps {
  result: IntentResponse;
  intentId: string;
  setupId: string;
  onOverrideComplete: () => void;
  onReset: () => void;
}

export function ValidationResult({ result, intentId, setupId, onOverrideComplete, onReset }: ValidationResultProps) {
  const { showToast } = useToast();
  const [overrideReason, setOverrideReason] = React.useState('');
  const [isOverriding, setIsOverriding] = React.useState(false);
  const [showOverrideInput, setShowOverrideInput] = React.useState(result.result === 'no_go');
  const [hasOverridden, setHasOverridden] = React.useState(false);

  const isGo = result.result === 'go';
  const isCaution = result.result === 'caution';
  const isNoGo = result.result === 'no_go';
  const canProceed = isGo || hasOverridden;

  const [brakeCountdown, setBrakeCountdown] = React.useState(result.requires_brake ? 60 : 0);

  React.useEffect(() => {
    if (brakeCountdown > 0) {
      const timer = setTimeout(() => setBrakeCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [brakeCountdown]);

  const handleOverride = async () => {
    if (overrideReason.length < 10) {
      showToast({ message: 'Reason must be at least 10 characters', variant: 'error' });
      return;
    }

    setIsOverriding(true);
    try {
      const response = await fetch(`/api/intent/${intentId}/override`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: overrideReason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to override');
      }

      showToast({ message: 'Override applied. Extreme caution advised.', variant: 'error' });
      setHasOverridden(true);
      onOverrideComplete();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      showToast({ message: errorMsg, variant: 'error' });
    } finally {
      setIsOverriding(false);
    }
  };

  return (
    <Card 
      variant="raised" 
      padding="lg" 
      className={`border-2 ${
        isGo ? 'border-success bg-success/5' : 
        isCaution ? 'border-warning bg-warning/5' : 
        'border-danger bg-danger/5'
      }`}
    >
      <div className="flex flex-col items-center text-center mb-6">
        {isGo && <CheckCircle2 className="w-16 h-16 text-success mb-4" />}
        {isCaution && <AlertTriangle className="w-16 h-16 text-warning mb-4" />}
        {isNoGo && <XCircle className="w-16 h-16 text-danger mb-4" />}
        
        <h2 className={`text-2xl font-bold mb-2 ${
          isGo && !hasOverridden ? 'text-success' : isCaution && !hasOverridden ? 'text-warning' : 'text-danger'
        }`}>
          {isGo && !hasOverridden && 'ALL CLEAR. EXECUTE.'}
          {isCaution && !hasOverridden && 'CAUTION ADVISED.'}
          {isNoGo && !hasOverridden && 'NO-GO. DO NOT TRADE.'}
          {hasOverridden && 'OVERRIDE ACTIVE. EXTREME CAUTION.'}
        </h2>
      </div>

      {result.reasons.length > 0 && (
        <div className="mb-6 space-y-2">
          {result.reasons.map((r, i) => (
            <p key={i} className="text-sm text-white bg-surface p-3 rounded-lg border border-muted/30">
              {r}
            </p>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-surface p-3 rounded-lg text-center">
          <p className="text-xs text-muted uppercase">Trades Left</p>
          <p className="text-lg font-bold text-white">{result.trades_remaining}</p>
        </div>
        <div className="bg-surface p-3 rounded-lg text-center">
          <p className="text-xs text-muted uppercase">Budget Left</p>
          <p className="text-lg font-bold text-white">{formatINR(result.budget_remaining_inr)}</p>
        </div>
      </div>

      {canProceed ? (
        <div className="space-y-4">
          {hasOverridden && (
             <div className="bg-danger/20 p-3 rounded text-sm text-white border border-danger/50 text-center mb-4">
               Override recorded. Proceeding to log this trade will negatively impact your Discipline Score.
             </div>
          )}
          <Link href={`/journal/new?intent_id=${intentId}&setup_id=${setupId}`}>
            <Button className={`w-full h-12 text-lg ${hasOverridden ? 'bg-danger hover:bg-danger/80 text-white' : ''}`}>
              Proceed & Log Trade <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Button variant="secondary" className="w-full" onClick={onReset}>
            Cancel Intent
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {!showOverrideInput ? (
            <>
              <Button variant="secondary" className="w-full h-12" onClick={onReset}>
                Acknowledge & Cancel
              </Button>
              <button 
                onClick={() => setShowOverrideInput(true)}
                className="w-full text-xs text-muted hover:text-white underline py-2"
              >
                I want to force proceed anyway (Override)
              </button>
            </>
          ) : (
            <div className="space-y-4 bg-surface p-4 rounded-lg border border-danger/30">
              <p className="text-xs text-danger font-medium uppercase tracking-wider">Psychological Friction Check</p>
              <p className="text-sm text-muted">Overriding this validation will negatively impact your Playbook Score. Type your justification below.</p>
              
              <Input
                label="Why are you breaking the rules?"
                placeholder="Must be at least 10 characters..."
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
              />
              
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={onReset}>
                  Abort
                </Button>
                <Button 
                  className="flex-1 bg-danger hover:bg-danger/80 text-white" 
                  onClick={handleOverride}
                  isLoading={isOverriding}
                  disabled={overrideReason.length < 10 || brakeCountdown > 0}
                >
                  {brakeCountdown > 0 ? `Wait ${brakeCountdown}s...` : 'Force Override'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
