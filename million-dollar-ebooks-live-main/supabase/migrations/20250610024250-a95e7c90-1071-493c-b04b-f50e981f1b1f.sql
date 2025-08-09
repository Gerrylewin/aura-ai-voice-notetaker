
-- Reset today's daily story winner to allow proper competition
DELETE FROM daily_story_winners WHERE story_date = CURRENT_DATE;

-- Reset any submission tracking that might be preventing proper competition
-- This will allow both accounts to be in the same competition pool
UPDATE daily_stories 
SET is_published = true 
WHERE story_date = CURRENT_DATE AND author_id IN (
  SELECT id FROM profiles WHERE display_name IN ('Isaac', 'Safari Wingman')
);

-- Recalculate the daily winner for today to ensure proper competition state
SELECT calculate_daily_story_winner(CURRENT_DATE);
