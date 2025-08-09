import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CategorySelectorProps {
  selectedCategory?: string;
  onCategoryChange: (categoryId: string) => void;
}

export function CategorySelector({ selectedCategory, onCategoryChange }: CategorySelectorProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: name.trim(),
          description: description?.trim() || null,
          slug: 'temp-slug', // Temporary slug that will be overridden by trigger
          created_by: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onCategoryChange(newCategory.id);
      setIsCreating(false);
      setNewCategoryName('');
      setNewCategoryDescription('');
    },
  });

  const handleCreateCategory = () => {
    if (newCategoryName.trim()) {
      createCategoryMutation.mutate({
        name: newCategoryName,
        description: newCategoryDescription,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Label className="text-gray-300">Category</Label>
        <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-gray-300">Category</Label>
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            {categories?.map((category) => (
              <SelectItem 
                key={category.id} 
                value={category.id}
                className="text-white hover:bg-gray-700"
              >
                {category.name}
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
          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Category
        </Button>
      ) : (
        <div className="space-y-3 p-4 border border-gray-600 rounded-lg bg-gray-800/50">
          <h4 className="font-medium text-white">Create New Category</h4>
          
          <div>
            <Label className="text-gray-300 text-sm">Category Name *</Label>
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Science Fiction, Romance, Mystery"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label className="text-gray-300 text-sm">Description (Optional)</Label>
            <Input
              value={newCategoryDescription}
              onChange={(e) => setNewCategoryDescription(e.target.value)}
              placeholder="Brief description of the category"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleCreateCategory}
              disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              {createCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewCategoryName('');
                setNewCategoryDescription('');
              }}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
