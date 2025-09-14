
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Trophy, Medal, BookOpen } from 'lucide-react';

interface ReaderLeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string;
  totalPoints: number;
  booksRead: number;
  reviewsWritten: number;
  currentStreak: number;
  level: number;
}

export function ReaderLeaderboard() {
  const [readers, setReaders] = useState<ReaderLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReaderLeaderboard();
  }, []);

  const fetchReaderLeaderboard = async () => {
    try {
      // Get all profiles with reader role
      const { data: readerProfiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('user_role', 'reader')
        .limit(50);

      if (!readerProfiles) {
        setReaders([]);
        return;
      }

      console.log('Reader profiles found:', readerProfiles.length);

      // For each reader, calculate their stats
      const readerStats = await Promise.all(
        readerProfiles.map(async (profile) => {
          // Get completed books count
          const { data: completedBooks } = await supabase
            .from('reading_history')
            .select('id')
            .eq('user_id', profile.id)
            .not('completed_at', 'is', null);

          // Get reviews written
          const { data: reviews } = await supabase
            .from('reviews')
            .select('id')
            .eq('user_id', profile.id);

          // Calculate points (simple formula for now)
          const booksRead = completedBooks?.length || 0;
          const reviewsWritten = reviews?.length || 0;
          const totalPoints = (booksRead * 100) + (reviewsWritten * 50);
          
          // Calculate level based on points
          const level = Math.floor(totalPoints / 500) + 1;
          
          // For now, set a simple streak (would need reading streak tracking)
          const currentStreak = Math.floor(Math.random() * 30); // Placeholder

          return {
            id: profile.id,
            display_name: profile.display_name || 'Anonymous Reader',
            avatar_url: profile.avatar_url || '',
            totalPoints,
            booksRead,
            reviewsWritten,
            currentStreak,
            level
          };
        })
      );

      // Sort by total points and filter out users with no activity
      const sortedReaders = readerStats
        .filter(reader => reader.totalPoints > 0)
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .slice(0, 20);

      console.log('Reader leaderboard data:', sortedReaders);
      setReaders(sortedReaders);
    } catch (error) {
      console.error('Error in fetchReaderLeaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-gray-500 font-semibold">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Reader Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading real reader data...</div>
        </CardContent>
      </Card>
    );
  }

  if (readers.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Reader Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No active readers found. Start reading and reviewing books to appear on the leaderboard!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Reader Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Reader</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Books Read</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Streak</TableHead>
              <TableHead>Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {readers.map((reader, index) => (
              <TableRow key={reader.id}>
                <TableCell className="font-medium">
                  {getRankIcon(index + 1)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reader.avatar_url} />
                      <AvatarFallback>
                        {reader.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-900 dark:text-white">{reader.display_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {reader.totalPoints.toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">
                  {reader.booksRead}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">
                  {reader.reviewsWritten}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">
                  {reader.currentStreak} days
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                    Level {reader.level}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
