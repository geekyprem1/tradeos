CREATE POLICY "Users insert own events" ON behavioral_events FOR INSERT WITH CHECK (auth.uid() = user_id);
