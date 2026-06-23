import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Target, AlertTriangle, Clock } from 'lucide-react';
import { formatINR, toIST } from '@/lib/utils';
import { PlaybookSetup } from '@/lib/types';

interface ContractSummaryProps {
  maxTrades: number;
  maxLoss: number;
  allowedSetupIds: string[];
  forbiddenConditions?: string;
  signedAt: string;
  setups: PlaybookSetup[];
}

export function ContractSummary({
  maxTrades,
  maxLoss,
  allowedSetupIds,
  forbiddenConditions,
  signedAt,
  setups,
}: ContractSummaryProps) {
  // Map IDs to names
  const allowedSetupNames = allowedSetupIds.map(id => {
    const setup = setups.find(s => s.id === id);
    return setup ? setup.name : 'Unknown Setup';
  });

  const formattedTime = toIST(new Date(signedAt)).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <Card variant="raised" padding="lg">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="bg-success/20 p-4 rounded-full mb-4">
          <Shield className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Contract Locked</h2>
        <p className="text-muted text-sm flex items-center justify-center gap-1.5">
          <Clock className="w-4 h-4" />
          Locked at {formattedTime} IST
        </p>
      </div>

      <div className="space-y-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface p-4 rounded-lg border border-muted/30">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Max Trades</p>
            <p className="text-xl font-bold text-white">{maxTrades}</p>
          </div>
          <div className="bg-surface p-4 rounded-lg border border-muted/30">
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Max Loss</p>
            <p className="text-xl font-bold text-danger">{formatINR(maxLoss)}</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-lg border border-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-brand-accent" />
            <p className="text-sm font-semibold text-white uppercase tracking-wider">Allowed Setups</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {allowedSetupNames.map((name, i) => (
              <span key={i} className="px-3 py-1 bg-surface-raised rounded-full text-sm text-white border border-muted">
                {name}
              </span>
            ))}
          </div>
        </div>

        {forbiddenConditions && (
          <div className="bg-danger/10 p-4 rounded-lg border border-danger/30">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-danger" />
              <p className="text-sm font-semibold text-danger uppercase tracking-wider">Forbidden Conditions</p>
            </div>
            <p className="text-sm text-white">{forbiddenConditions}</p>
          </div>
        )}
      </div>

      <Link href="/intent">
        <Button className="w-full h-12 text-lg font-bold">
          Open Trade Intent Engine &rarr;
        </Button>
      </Link>
    </Card>
  );
}
