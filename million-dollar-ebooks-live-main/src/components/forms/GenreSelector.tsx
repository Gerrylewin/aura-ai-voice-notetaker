
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface GenreSelectorProps {
  selectedGenre?: string;
  onGenreChange: (genreId: string) => void;
}

export function GenreSelector({ selectedGenre, onGenreChange }: GenreSelectorProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreDescription, setNewGenreDescription] = useState('');

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

  const createGenreMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('genres')
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
          slug: name.trim().toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-'),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newGenre) => {
      queryClient.invalidateQueries({ queryKey: ['genres'] });
      onGenreChange(newGenre.id);
      setIsCreating(false);
      setNewGenreName('');
      setNewGenreDescription('');
    },
  });

  const handleCreateGenre = () => {
    if (newGenreName.trim()) {
      createGenreMutation.mutate({
        name: newGenreName,
        description: newGenreDescription,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label className="text-gray-700 dark:text-gray-300">Genre</Label>
        <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-gray-700 dark:text-gray-300">Genre</Label>
        <Select value={selectedGenre} onValueChange={onGenreChange}>
          <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">
            <SelectValue placeholder="Select a genre" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600">
            {genres?.map((genre) => (
              <SelectItem 
                key={genre.id} 
                value={genre.id}
                className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isCreating ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsCreating(true)}
          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Genre
        </Button>
      ) : (
        <div className="space-y-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <h4 className="font-medium text-gray-900 dark:text-white">Create New Genre</h4>
          
          <div>
            <Label className="text-gray-700 dark:text-gray-300 text-sm">Genre Name *</Label>
            <Input
              value={newGenreName}
              onChange={(e) => setNewGenreName(e.target.value)}
              placeholder="e.g., Fantasy, Romance, Thriller"
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <Label className="text-gray-700 dark:text-gray-300 text-sm">Description (Optional)</Label>
            <Input
              value={newGenreDescription}
              onChange={(e) => setNewGenreDescription(e.target.value)}
              placeholder="Brief description of the genre"
              className="bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCreateGenre}
              disabled={!newGenreName.trim() || createGenreMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              {createGenreMutation.isPending ? 'Creating...' : 'Create Genre'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewGenreName('');
                setNewGenreDescription('');
              }}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
