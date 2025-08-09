import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ReadingPreferences {
  id?: string;
  user_id: string;
  font_family: 'serif' | 'sans-serif' | 'monospace';
  font_size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  line_spacing: 'compact' | 'normal' | 'relaxed';
  theme: 'light' | 'dark' | 'sepia';
  brightness: number;
  margins: 'narrow' | 'normal' | 'wide';
}

export function useReadingPreferences() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['reading-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('reading_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Return default preferences if none exist
      return data || {
        user_id: user.id,
        font_family: 'serif' as const,
        font_size: 'md' as const,
        line_spacing: 'normal' as const,
        theme: 'light' as const,
        brightness: 100,
        margins: 'normal' as const,
      };
    },
    enabled: !!user?.id,
  });
}

export function useUpdateReadingPreferences() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preferences: Partial<ReadingPreferences>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('reading_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reading-preferences'] });
    },
  });
}