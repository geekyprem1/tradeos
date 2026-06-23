import * as React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { todayIST } from '@/lib/utils';

interface DailyLoopProgressProps {
  checkinDone: boolean;
  contractDone: boolean;
  tradesTaken: number;
  scoreDone: boolean;
}

export function DailyLoopProgress({ checkinDone, contractDone, tradesTaken, scoreDone }: DailyLoopProgressProps) {
  const today = todayIST();

  const steps = [
    { 
      id: 'checkin', 
      label: 'Morning Check-in', 
      isDone: checkinDone, 
      isActive: !checkinDone, 
      href: '/checkin' 
    },
    { 
      id: 'contract', 
      label: 'Daily Contract', 
      isDone: contractDone, 
      isActive: checkinDone && !contractDone, 
      href: '/contract' 
    },
    { 
      id: 'trade', 
      label: 'Market Execution', 
      isDone: tradesTaken > 0, 
      isActive: contractDone && tradesTaken === 0, 
      href: '/intent' 
    },
    { 
      id: 'journal', 
      label: 'Trade Journal', 
      isDone: false, // Journal is an ongoing process during the day
      isActive: tradesTaken > 0 && !scoreDone, 
      href: `/journal/${today}` 
    },
    { 
      id: 'score', 
      label: 'Evening Score', 
      isDone: scoreDone, 
      isActive: checkinDone && contractDone && !scoreDone, // Can generate score anytime after contract
      href: '/score' 
    },
  ];

  return (
    <Card padding="md">
      <h3 className="text-sm font-bold text-white mb-4">Daily Discipline Loop</h3>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center relative">
        
        {/* Background connector line (visible on md+) */}
        <div className="hidden sm:block absolute top-1/2 left-0 w-full h-[2px] bg-muted/30 -z-10 -translate-y-1/2" />

        {steps.map((step, idx) => (
          <Link key={step.id} href={step.href} className="group relative z-0 flex items-center sm:flex-col gap-3 sm:gap-2 w-full sm:w-auto mb-4 sm:mb-0">
            {/* Vertical connector line (visible on mobile) */}
            {idx !== steps.length - 1 && (
              <div className="sm:hidden absolute left-[11px] top-6 bottom-[-24px] w-[2px] bg-muted/30 -z-10" />
            )}

            <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-background border-2 transition-colors ${
              step.isDone ? 'border-success text-success' :
              step.isActive ? 'border-brand-primary text-brand-primary' :
              'border-muted text-muted'
            }`}>
              {step.isDone ? <CheckCircle2 className="w-4 h-4 bg-background" /> : 
               step.isActive ? <Clock className="w-3 h-3" /> : 
               <Circle className="w-3 h-3" />}
            </div>
            <span className={`text-xs font-semibold ${
              step.isDone ? 'text-success' :
              step.isActive ? 'text-brand-primary' :
              'text-muted'
            }`}>
              {step.label}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
