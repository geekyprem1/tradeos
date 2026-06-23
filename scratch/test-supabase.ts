import { createBrowserClient } from '../src/lib/supabase/client';
import { createServerClient } from '../src/lib/supabase/server';
import { createAdminClient } from '../src/lib/supabase/admin';
import { createMiddlewareClient } from '../src/lib/supabase/middleware';

// Throwaway file to verify Phase 04 gate
function test() {
  const browserClient = createBrowserClient();
  const serverClient = createServerClient();
  const adminClient = createAdminClient();
  // middlewareClient takes a request, just verifying the import here
}
