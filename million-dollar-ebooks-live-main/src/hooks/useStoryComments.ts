
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface StoryComment {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string;
    avatar_url?: string;
  } | null;
}

export function useStoryComments() {
  const { user } = useAuth();
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async (storyId: string) => {
    console.log('🔄 Fetching comments for story:', storyId);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('story_comments')
        .select(`
          id,
          story_id,
          user_id,
          content,
          created_at
        `)
        .eq('story_id', storyId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching comments:', error);
        throw error;
      }

      console.log('✅ Raw comments data:', data);
      
      // Fetch profiles separately for each comment to avoid relation issues
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, avatar_url')
            .eq('id', comment.user_id)
            .single();

          return {
            ...comment,
            profiles: profile || { display_name: 'Anonymous', avatar_url: null }
          };
        })
      );

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('❌ Error fetching comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = async (storyId: string, content: string) => {
    if (!user) {
      console.error('❌ User not authenticated for adding comment');
      throw new Error('User not authenticated');
    }

    console.log('📝 Adding comment:', { storyId, content: content.substring(0, 50) + '...', userId: user.id });

    try {
      // First insert the comment
      const { data: insertData, error: insertError } = await supabase
        .from('story_comments')
        .insert({
          story_id: storyId,
          user_id: user.id,
          content: content.trim(),
        })
        .select('id')
        .single();

      if (insertError) {
        console.error('❌ Error adding comment:', insertError);
        throw insertError;
      }

      console.log('✅ Comment inserted with ID:', insertData.id);

      // Fetch the user's profile for the new comment
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

      const newComment = {
        id: insertData.id,
        story_id: storyId,
        user_id: user.id,
        content: content.trim(),
        created_at: new Date().toISOString(),
        profiles: profileData || { display_name: 'You', avatar_url: user.user_metadata?.avatar_url }
      };

      console.log('✅ Comment added successfully:', newComment);
      setComments(prevComments => [...prevComments, newComment]);
      return newComment;
    } catch (error) {
      console.error('❌ Failed to add comment:', error);
      throw error;
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user) {
      console.error('❌ User not authenticated for deleting comment');
      throw new Error('User not authenticated');
    }

    console.log('🗑️ Deleting comment:', commentId, 'by user:', user.id);

    try {
      const { error } = await supabase
        .from('story_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id); // Ensure user can only delete their own comments

      if (error) {
        console.error('❌ Error deleting comment:', error);
        throw error;
      }

      console.log('✅ Comment deleted successfully:', commentId);
      
      // Remove the comment from the local state
      setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      
    } catch (error) {
      console.error('❌ Failed to delete comment:', error);
      throw error;
    }
  };

  return {
    comments,
    loading,
    fetchComments,
    addComment,
    deleteComment,
  };
}
