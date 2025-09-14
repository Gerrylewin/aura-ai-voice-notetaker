
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SocialShareButton } from './SocialShareButton';
import { TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export function ReadingStatsShare() {
  const { user } = useAuth();

  // Fetch user's reading statistics
  const { data: readingStats, isLoading } = useQuery({
    queryKey: ['reading-stats-share', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const currentYear = new Date().getFullYear();
      const yearStart = `${currentYear}-01-01`;
      const yearEnd = `${currentYear}-12-31`;

      // Get completed books this year
      const { data: completedBooks } = await supabase
        .from('reading_history')
        .select('id, book_id, completed_at, books(title, book_genres(genre_id, genres(name)))')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .gte('completed_at', yearStart)
        .lte('completed_at', yearEnd);

      // Get user's reading goal
      const { data: userGoals } = await supabase
        .from('user_goals')
        .select('monthly_reading_target')
        .eq('user_id', user.id)
        .maybeSingle();

      // Calculate reading streak
      const { data: readingActivity } = await supabase
        .from('reading_progress')
        .select('last_read_at')
        .eq('user_id', user.id)
        .not('last_read_at', 'is', null)
        .order('last_read_at', { ascending: false })
        .limit(30);

      // Calculate current streak
      let currentStreak = 0;
      if (readingActivity && readingActivity.length > 0) {
        const readingDates = readingActivity
          .map(entry => new Date(entry.last_read_at).toDateString())
          .filter((date, index, arr) => arr.indexOf(date) === index)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
        
        if (readingDates[0] === today || readingDates[0] === yesterday) {
          currentStreak = 1;
          for (let i = 1; i < readingDates.length; i++) {
            const currentDate = new Date(readingDates[i]);
            const previousDate = new Date(readingDates[i - 1]);
            const daysDiff = (previousDate.getTime() - currentDate.getTime()) / (24 * 60 * 60 * 1000);
            
            if (daysDiff === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
      }

      // Extract favorite genres from completed books
      const genreCount: Record<string, number> = {};
      completedBooks?.forEach(book => {
        book.books?.book_genres?.forEach(bg => {
          if (bg.genres?.name) {
            genreCount[bg.genres.name] = (genreCount[bg.genres.name] || 0) + 1;
          }
        });
      });

      const favoriteGenres = Object.entries(genreCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => genre);

      const monthlyTarget = userGoals?.monthly_reading_target || 1;
      const yearlyGoal = monthlyTarget * 12;

      return {
        booksRead: completedBooks?.length || 0,
        readingGoal: yearlyGoal,
        favoriteGenres,
        readingStreak: currentStreak
      };
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-red-600" />
        </CardContent>
      </Card>
    );
  }

  if (!readingStats) {
    return null;
  }

  const { booksRead, readingGoal, favoriteGenres, readingStreak } = readingStats;

  const generateShareText = () => {
    const year = new Date().getFullYear();
    let text = `📚 My ${year} reading stats on Million Dollar eBooks:\n`;
    text += `• ${booksRead} books read`;
    
    if (readingGoal) {
      const percentage = Math.round((booksRead / readingGoal) * 100);
      text += ` (${percentage}% of my goal!)`;
    }
    
    if (readingStreak && readingStreak > 0) {
      text += `\n• ${readingStreak} day reading streak 🔥`;
    }
    
    if (favoriteGenres.length > 0) {
      text += `\n• Favorite genres: ${favoriteGenres.slice(0, 3).join(', ')}`;
    }
    
    text += '\n\nJoin me in discovering amazing books! 📖';
    
    return text;
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Share Your Reading Journey
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Preview */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{booksRead}</div>
              <div className="text-sm text-gray-400">Books Read</div>
            </div>
            {readingGoal && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {Math.round((booksRead / readingGoal) * 100)}%
                </div>
                <div className="text-sm text-gray-400">Goal Progress</div>
              </div>
            )}
          </div>
          
          {readingStreak && readingStreak > 0 && (
            <div className="text-center mt-4">
              <div className="text-lg font-bold text-orange-400">{readingStreak} days</div>
              <div className="text-sm text-gray-400">Reading Streak 🔥</div>
            </div>
          )}
          
          {favoriteGenres.length > 0 && (
            <div className="mt-4">
              <div className="text-sm text-gray-400 mb-2">Favorite Genres:</div>
              <div className="flex flex-wrap gap-2">
                {favoriteGenres.slice(0, 3).map((genre) => (
                  <span key={genre} className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <SocialShareButton
            title="Check out my reading stats!"
            description={generateShareText()}
            platform="twitter"
            size="sm"
          />
          <SocialShareButton
            title="Check out my reading stats!"
            description={generateShareText()}
            platform="facebook"
            size="sm"
          />
          <SocialShareButton
            title="Check out my reading stats!"
            description={generateShareText()}
            platform="native"
            size="sm"
          />
        </div>
      </CardContent>
    </Card>
  );
}
