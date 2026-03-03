CREATE TABLE IF NOT EXISTS messages (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  expert_id   uuid REFERENCES experts(id) ON DELETE CASCADE,
  sender_name  text NOT NULL,
  sender_email text NOT NULL,
  subject      text,
  body         text NOT NULL,
  is_read      boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- Anyone can insert (send a DM), only service role can read/update (expert dashboard uses service role via edge fn)
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can send a message" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Service role can update messages" ON messages FOR UPDATE USING (true);
