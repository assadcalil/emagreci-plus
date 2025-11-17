-- Migration: Add Community Chat feature and fix side_effects table
-- Execute this in Supabase SQL Editor

-- 1. Add horario column to side_effects (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'side_effects' AND column_name = 'horario'
  ) THEN
    ALTER TABLE side_effects ADD COLUMN horario TIME;
  END IF;
END $$;

-- 2. Create Community Messages Table
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  weight_loss DECIMAL(5,2),
  type TEXT DEFAULT 'message', -- message, result
  likes UUID[] DEFAULT '{}', -- Array of user IDs who liked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies (drop if exists to avoid conflicts)
DROP POLICY IF EXISTS "Authenticated users can view all messages" ON community_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON community_messages;
DROP POLICY IF EXISTS "Users can update own messages" ON community_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON community_messages;

CREATE POLICY "Authenticated users can view all messages" ON community_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert own messages" ON community_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON community_messages
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON community_messages
  FOR DELETE USING (auth.uid() = user_id);

-- 5. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at);

-- 6. Enable real-time for community_messages
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;
