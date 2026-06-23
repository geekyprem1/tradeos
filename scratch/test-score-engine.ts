import { deriveScore } from '../src/lib/score-engine';
import { createAdminClient } from '../src/lib/supabase/admin';
import { todayIST } from '../src/lib/utils';

async function runTest() {
  const supabase = createAdminClient();
  
  // Get first user
  const { data: users, error: userError } = await supabase.auth.admin.listUsers();
  if (userError || !users.users.length) {
    console.error('No users found in database.', userError);
    return;
  }
  
  const userId = users.users[0].id;
  const today = todayIST();

  console.log(`Running score engine for user: ${userId} on date: ${today}`);

  try {
    const result = await deriveScore(userId, today);
    console.log('--- SCORE RESULT ---');
    console.log(JSON.stringify(result, null, 2));
    console.log('--------------------');
    console.log('Success!');
  } catch (err) {
    console.error('Error running score engine:', err);
  }
}

runTest();
