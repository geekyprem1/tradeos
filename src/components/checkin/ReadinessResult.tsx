import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { ScoreGauge } from '@/components/ui/ScoreGauge';
import { Button } from '@/components/ui/Button';

interface ReadinessResultProps {
  score: number;
  contractSigned: boolean;
}

export function ReadinessResult({ score, contractSigned }: ReadinessResultProps) {
  let message = '';
  let subMessage = '';

  if (score >= 80) {
    message = 'Optimal Readiness';
    subMessage = 'You are in an excellent state of mind. Trust your edge and execute without hesitation.';
  } else if (score >= 60) {
    message = 'Adequate Readiness';
    subMessage = 'You are cleared to trade, but remain vigilant. Stick strictly to your playbook.';
  } else {
    message = 'Low Readiness';
    subMessage = 'Trading is NOT recommended today. Consider taking a break or reducing your risk size significantly.';
  }

  return (
    <Card variant="raised" padding="lg" className="flex flex-col items-center text-center">
      <h2 className="mb-6 text-xl font-bold text-white">Today's Readiness</h2>
      
      <div className="mb-6">
        <ScoreGauge score={score} />
      </div>

      <div className="mb-8 max-w-sm">
        <h3 className="mb-2 text-lg font-bold text-white">{message}</h3>
        <p className="text-muted text-sm">{subMessage}</p>
      </div>

      <div className="w-full max-w-xs">
        {contractSigned ? (
          <Link href="/">
            <Button className="w-full">View Dashboard &rarr;</Button>
          </Link>
        ) : (
          <Link href="/contract">
            <Button className="w-full">Sign Today's Contract &rarr;</Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
