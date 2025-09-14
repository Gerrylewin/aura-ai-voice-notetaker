
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDailyWinnerCalculation() {
  const triggerDailyWinnerCalculation = useCallback(async (date: string) => {
    try {
      console.log('Triggering daily winner calculation for date:', date);
      const { error } = await supabase.rpc('calculate_daily_story_winner', {
        target_date: date
      });
      
      if (error) {
        console.error('Error calculating daily winner:', error);
      } else {
        console.log('Daily winner calculation completed for', date);
      }
    } catch (error) {
      console.error('Error in triggerDailyWinnerCalculation:', error);
    }
  }, []);

  return {
    triggerDailyWinnerCalculation
  };
}
