import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { PushSubscriptionSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    
    // Authenticate
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = PushSubscriptionSchema.parse(body);

    const { endpoint, keys: { p256dh, auth } } = validatedData.subscription;
    
    // We should parse the user agent for display or management later
    const userAgent = request.headers.get('user-agent') || 'Unknown Device';

    // UPSERT into push_subscriptions
    // endpoint is unique. Supabase upsert logic should handle this.
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: session.user.id,
        endpoint,
        p256dh_key: p256dh,
        auth_key: auth,
        user_agent: userAgent,
        is_active: true,
      }, { onConflict: 'endpoint' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: err.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
