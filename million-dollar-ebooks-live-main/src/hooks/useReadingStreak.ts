
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
}

export function useReadingStreak() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastReadDate: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchStreakData();
  }, [user]);

  const fetchStreakData = async () => {
    if (!user) return;

    try {
      // Get reading progress activity ordered by date
      const { data: readingActivity, error } = await supabase
        .from('reading_progress')
        .select('last_read_at')
        .eq('user_id', user.id)
        .not('last_read_at', 'is', null)
        .order('last_read_at', { ascending: false })
        .limit(365); // Last year of activity

      if (error) {
        console.error('Error fetching reading activity:', error);
        setLoading(false);
        return;
      }

      if (!readingActivity || readingActivity.length === 0) {
        setStreakData({
          currentStreak: 0,
          longestStreak: 0,
          lastReadDate: null
        });
        setLoading(false);
        return;
      }

      // Calculate streak based on consecutive reading days
      const readingDates = readingActivity
        .map(entry => new Date(entry.last_read_at).toDateString())
        .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()); // Sort by most recent

      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();

      // Check if streak is still active (read today or yesterday)
      const isStreakActive = readingDates[0] === today || readingDates[0] === yesterday;

      if (isStreakActive) {
        currentStreak = 1;
        tempStreak = 1;

        // Calculate consecutive days
        for (let i = 1; i < readingDates.length; i++) {
          const currentDate = new Date(readingDates[i]);
          const previousDate = new Date(readingDates[i - 1]);
          const daysDiff = (previousDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000);

          if (daysDiff === 1) {
            currentStreak++;
            tempStreak++;
          } else {
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
            }
            tempStreak = 1;
          }
        }
      }

      // Calculate longest streak from all reading sessions
      tempStreak = 1;
      for (let i = 1; i < readingDates.length; i++) {
        const currentDate = new Date(readingDates[i]);
        const previousDate = new Date(readingDates[i - 1]);
        const daysDiff = (previousDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000);

        if (daysDiff === 1) {
          tempStreak++;
        } else {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }

      setStreakData({
        currentStreak: isStreakActive ? currentStreak : 0,
        longestStreak: Math.max(longestStreak, currentStreak),
        lastReadDate: readingActivity[0]?.last_read_at || null
      });

    } catch (error) {
      console.error('Error calculating reading streak:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    streakData,
    loading,
    refreshStreak: fetchStreakData
  };
}
