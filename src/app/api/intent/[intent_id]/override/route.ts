import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { OverrideReasonSchema } from '@/lib/validations';
import { z } from 'zod';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ intent_id: string }> }
) {
  try {
    const { intent_id } = await params;
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const intentId = intent_id;
    const body = await request.json();
    const parsed = OverrideReasonSchema.parse(body);

    // Verify intent belongs to user and check time
    const { data: intent, error: intentFetchError } = await supabase
      .from('trade_intents')
      .select('user_id, validation_result, session_id, submitted_at')
      .eq('id', intentId)
      .single();

    if (intentFetchError || !intent) {
      return NextResponse.json({ error: 'Intent not found' }, { status: 404 });
    }

    if (intent.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Server-side enforcement of 60s brake
    const submittedTime = new Date(intent.submitted_at).getTime();
    const now = new Date().getTime();
    const diffSeconds = (now - submittedTime) / 1000;

    if (diffSeconds < 60) {
      return NextResponse.json(
        { error: `Psychological brake active. Please wait ${Math.ceil(60 - diffSeconds)} more seconds before overriding.` },
        { status: 429 }
      );
    }

    // Update intent
    const { error: updateError } = await supabase
      .from('trade_intents')
      .update({
        user_proceeded: true,
        override_reason: parsed.reason,
      })
      .eq('id', intentId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Insert behavioral event
    const { error: eventError } = await supabase.from('behavioral_events').insert({
      user_id: session.user.id,
      session_id: intent.session_id,
      event_type: 'intent_override',
      metadata: {
        intent_id: intentId,
        original_result: intent.validation_result,
        reason: parsed.reason,
      },
    });

    if (eventError) {
      return NextResponse.json({ error: `Telemetry Error: ${eventError.message}` }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
