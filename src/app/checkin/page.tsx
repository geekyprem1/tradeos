'use client';

import * as React from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { ReadinessSlider } from '@/components/checkin/ReadinessSlider';
import { ReadinessResult } from '@/components/checkin/ReadinessResult';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/ToastContext';
import { computeReadinessScore, toIST, todayIST } from '@/lib/utils';
import { Clock } from 'lucide-react';
import { DailySession } from '@/lib/types';

export default function CheckinPage() {
  const supabase = createBrowserClient();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sessionData, setSessionData] = React.useState<Partial<DailySession> | null>(null);
  const [isWindowClosed, setIsWindowClosed] = React.useState(false);

  // Form states
  const [sleep, setSleep] = React.useState(5);
  const [stress, setStress] = React.useState(5);
  const [energy, setEnergy] = React.useState(5);
  const [focus, setFocus] = React.useState(5);
  const [motivation, setMotivation] = React.useState(5);

  React.useEffect(() => {
    async function initCheckin() {
      // Time gate check (11:00 AM IST)
      const nowIST = toIST(new Date());
      if (nowIST.getHours() >= 11) {
        setIsWindowClosed(true);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Look up today's session
        const today = todayIST();
        const { data, error } = await supabase
          .from('daily_sessions')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('session_date', today)
          .single();

        if (data) {
          setSessionData(data);
        } else if (error && error.code !== 'PGRST116') {
          // PGRST116 is "No rows found", which is fine if it's their first time today.
          showToast({ message: error.message, variant: 'error' });
        }
      }
      setIsLoading(false);
    }
    initCheckin();
  }, [supabase, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const score = computeReadinessScore(sleep, stress, energy, focus, motivation);
    const today = todayIST();
    const now = new Date().toISOString();

    // 1. UPSERT daily_sessions
    const { data: updatedSession, error: upsertError } = await supabase
      .from('daily_sessions')
      .upsert({
        id: sessionData?.id, // include ID if updating existing row created by something else? Usually we use UPSERT on session_date + user_id. 
        user_id: session.user.id,
        session_date: today,
        checkin_sleep: sleep,
        checkin_stress: stress,
        checkin_energy: energy,
        checkin_focus: focus,
        checkin_motivation: motivation,
        readiness_score: score,
        checkin_completed_at: now,
        is_trading_day: true, // by default, if they check in, they intend to trade unless contract says otherwise
      }, { onConflict: 'user_id,session_date' })
      .select()
      .single();

    if (upsertError) {
      showToast({ message: upsertError.message, variant: 'error' });
      setIsSubmitting(false);
      return;
    }

    // 2. INSERT behavioral_events
    const { error: eventError } = await supabase.from('behavioral_events').insert({
      user_id: session.user.id,
      session_id: updatedSession.id,
      event_type: 'checkin_completed',
      metadata: {
        readiness_score: score,
        completed_at_ist: toIST(new Date()).toISOString(),
      },
    });

    if (eventError) {
      throw new Error(`Failed to log telemetry: ${eventError.message}`);
    }

    setSessionData(updatedSession);
    setIsSubmitting(false);
    showToast({ message: 'Morning check-in completed', variant: 'success' });
  };

  if (isLoading) {
    return <div className="p-6 text-white">Loading check-in...</div>;
  }

  // Already completed
  if (sessionData && sessionData.checkin_completed_at) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
        <ReadinessResult 
          score={sessionData.readiness_score || 0} 
          contractSigned={!!sessionData.contract_signed_at} 
        />
      </div>
    );
  }

  // Window closed and not completed
  if (isWindowClosed) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center p-4">
        <Card className="max-w-md text-center p-8">
          <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Check-in Window Closed</h2>
          <p className="text-muted text-sm mb-6">
            The morning check-in window closes strictly at 11:00 AM IST. You can no longer check in or trade today. Disconnect and review your playbook.
          </p>
          <Button variant="secondary" onClick={() => window.location.href = '/'}>
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Show form
  return (
    <div className="mx-auto max-w-xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Morning Check-in</h1>
        <p className="text-muted text-sm mt-1">Assess your physical and mental readiness before looking at the charts.</p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} className="space-y-8">
          <ReadinessSlider
            label="Sleep Quality"
            name="sleep"
            value={sleep}
            onChange={setSleep}
          />
          
          <ReadinessSlider
            label="Stress Levels"
            name="stress"
            value={stress}
            onChange={setStress}
            isInverted={true}
          />

          <ReadinessSlider
            label="Energy"
            name="energy"
            value={energy}
            onChange={setEnergy}
          />

          <ReadinessSlider
            label="Focus / Clarity"
            name="focus"
            value={focus}
            onChange={setFocus}
          />

          <ReadinessSlider
            label="Motivation to Execute Process"
            name="motivation"
            value={motivation}
            onChange={setMotivation}
          />

          <div className="pt-4 border-t border-muted">
            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Complete Check-in
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
