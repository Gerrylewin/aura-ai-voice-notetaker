
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface GenreFilterProps {
  selectedGenre?: string;
  onGenreChange: (genre?: string) => void;
}

export function GenreFilter({ selectedGenre, onGenreChange }: GenreFilterProps) {
  const { data: genres, isLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('genres')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="p-4">
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Genres</h3>
        <div className="space-y-1">
          <Button
            variant={!selectedGenre ? "default" : "ghost"}
            size="sm"
            onClick={() => onGenreChange(undefined)}
            className={`w-full justify-start ${!selectedGenre ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
          >
            All Genres
          </Button>
          {genres?.map((genre) => (
            <Button
              key={genre.id}
              variant={selectedGenre === genre.slug ? "default" : "ghost"}
              size="sm"
              onClick={() => onGenreChange(genre.slug)}
              className={`w-full justify-start ${selectedGenre === genre.slug ? 'bg-red-600 hover:bg-red-700 text-white' : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {genre.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
