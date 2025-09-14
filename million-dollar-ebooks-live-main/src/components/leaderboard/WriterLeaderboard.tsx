
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { Crown, Trophy, Medal, Star, TrendingUp } from 'lucide-react';

interface WriterLeaderboardEntry {
  id: string;
  display_name: string;
  avatar_url: string;
  author_points: number;
  total_words_written: number;
  books_published: number;
  total_sales: number;
  author_level: number;
}

export function WriterLeaderboard() {
  const [writers, setWriters] = useState<WriterLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWriterLeaderboard();
  }, []);

  const fetchWriterLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('author_progress')
        .select(`
          author_id,
          author_points,
          total_words_written,
          books_published,
          total_sales,
          author_level,
          profiles!inner (
            display_name,
            avatar_url
          )
        `)
        .order('author_points', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching writer leaderboard:', error);
        return;
      }

      const formattedData = data?.map(item => ({
        id: item.author_id,
        display_name: (item.profiles as any)?.display_name || 'Anonymous Writer',
        avatar_url: (item.profiles as any)?.avatar_url || '',
        author_points: item.author_points,
        total_words_written: item.total_words_written,
        books_published: item.books_published,
        total_sales: item.total_sales,
        author_level: item.author_level
      })) || [];

      setWriters(formattedData);
    } catch (error) {
      console.error('Error in fetchWriterLeaderboard:', error);
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
          <CardTitle className="text-gray-900 dark:text-white">Writer Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Writer Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Writer</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Words</TableHead>
              <TableHead>Books</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Level</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {writers.map((writer, index) => (
              <TableRow key={writer.id}>
                <TableCell className="font-medium">
                  {getRankIcon(index + 1)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={writer.avatar_url} />
                      <AvatarFallback>
                        {writer.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-gray-900 dark:text-white">{writer.display_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                    {writer.author_points.toLocaleString()}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">
                  {writer.total_words_written.toLocaleString()}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">
                  {writer.books_published}
                </TableCell>
                <TableCell className="text-gray-600 dark:text-gray-300">
                  {writer.total_sales}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-blue-500 text-blue-600 dark:text-blue-400">
                    Level {writer.author_level}
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
