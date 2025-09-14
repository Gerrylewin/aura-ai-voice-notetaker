
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DailyWinner {
  id: string;
  story_id: string;
  author_id: string;
  story_date: string;
  total_score: number;
  heart_count: number;
  shock_count: number;
  thumbs_down_count: number;
  daily_stories: {
    title: string;
    description: string;
  } | null;
  profiles: {
    display_name: string;
    avatar_url?: string;
  } | null;
}

export function useDailyWinner() {
  const [winner, setWinner] = useState<DailyWinner | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDailyWinner = useCallback(async (date?: string) => {
    setLoading(true);
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      console.log('useDailyWinner: Fetching winner for date:', targetDate);
      
      // Get winner data first
      const { data: winnerData, error: winnerError } = await supabase
        .from('daily_story_winners')
        .select('*')
        .eq('story_date', targetDate)
        .single();

      if (winnerData && !winnerError) {
        console.log('useDailyWinner: Found existing winner:', winnerData);
        
        // Then get the story details
        const { data: storyData } = await supabase
          .from('daily_stories')
          .select('title, description')
          .eq('id', winnerData.story_id)
          .single();
        
        // And get the profile details
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', winnerData.author_id)
          .single();

        // Combine the data
        const completeWinner: DailyWinner = {
          ...winnerData,
          daily_stories: storyData || null,
          profiles: profileData || null
        };

        setWinner(completeWinner);
      } else {
        console.log('useDailyWinner: No winner data available for', targetDate);
        setWinner(null);
      }
    } catch (error) {
      console.error('useDailyWinner: Error fetching daily winner:', error);
      setWinner(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateWinnerForDate = useCallback(async (date: string) => {
    try {
      console.log('useDailyWinner: Calculating winner for date:', date);
      
      // First delete any existing winner for this date to prevent duplicates
      await supabase
        .from('daily_story_winners')
        .delete()
        .eq('story_date', date);
      
      const { error } = await supabase.rpc('calculate_daily_story_winner', {
        target_date: date
      });

      if (error) {
        console.error('useDailyWinner: Error in calculation:', error);
        throw error;
      }
      
      console.log('useDailyWinner: Winner calculation completed for', date);
    } catch (error) {
      console.error('useDailyWinner: Error in calculateWinnerForDate:', error);
      throw error;
    }
  }, []);

  return {
    winner,
    loading,
    fetchDailyWinner,
    calculateWinnerForDate,
  };
}
