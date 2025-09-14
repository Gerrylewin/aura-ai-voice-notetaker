
-- Fix the duplicate key violations by updating the upsert logic
-- The issue is that the current code tries to insert when records already exist
-- We need to ensure proper conflict resolution

-- First, let's add a proper unique constraint to prevent duplicates if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reading_progress_user_book_unique'
    ) THEN
        ALTER TABLE reading_progress 
        ADD CONSTRAINT reading_progress_user_book_unique 
        UNIQUE (user_id, book_id);
    END IF;
END $$;

-- Also ensure reading_history has proper unique constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'reading_history_user_book_unique'
    ) THEN
        ALTER TABLE reading_history 
        ADD CONSTRAINT reading_history_user_book_unique 
        UNIQUE (user_id, book_id);
    END IF;
END $$;

-- Add indexes for better performance on reading operations
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_book_id ON reading_progress(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_user_id ON reading_history(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_history_book_id ON reading_history(book_id);

-- Create a table for storing user reading preferences
CREATE TABLE IF NOT EXISTS reading_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    font_family TEXT NOT NULL DEFAULT 'serif',
    font_size TEXT NOT NULL DEFAULT 'medium',
    line_spacing TEXT NOT NULL DEFAULT 'normal',
    theme TEXT NOT NULL DEFAULT 'light',
    brightness INTEGER NOT NULL DEFAULT 100,
    margins TEXT NOT NULL DEFAULT 'normal',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS on reading_preferences
ALTER TABLE reading_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for reading_preferences
CREATE POLICY "Users can manage their own reading preferences"
    ON reading_preferences
    FOR ALL
    USING (auth.uid() = user_id);
