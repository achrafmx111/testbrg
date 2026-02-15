-- Create Notifications table
CREATE TABLE IF NOT EXISTS mvp.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'info', 'success', 'warning', 'error'
    read BOOLEAN NOT NULL DEFAULT FALSE,
    action_link TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for Notifications
ALTER TABLE mvp.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON mvp.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
    ON mvp.notifications FOR UPDATE
    USING (auth.uid() = user_id);

-- Create Messages table (Direct Messaging)
CREATE TABLE IF NOT EXISTS mvp.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    thread_type TEXT NOT NULL DEFAULT 'DIRECT', -- 'DIRECT', 'GROUP'
    body TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS for Messages
ALTER TABLE mvp.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages they sent or received"
    ON mvp.messages FOR SELECT
    USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

CREATE POLICY "Users can insert messages"
    ON mvp.messages FOR INSERT
    WITH CHECK (auth.uid() = from_user_id);

-- Grant permissions (assuming public schema usage in client for now)
GRANT ALL ON mvp.notifications TO authenticated;
GRANT ALL ON mvp.messages TO authenticated;
