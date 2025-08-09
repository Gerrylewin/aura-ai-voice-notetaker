
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Send, Trash2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStoryComments } from '@/hooks/useStoryComments';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface StoryCommentsProps {
  storyId: string;
}

export function StoryComments({ storyId }: StoryCommentsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { comments, loading, fetchComments, addComment, deleteComment } = useStoryComments();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 StoryComments mounted for story:', storyId);
    if (storyId) {
      fetchComments(storyId);
    }
  }, [storyId, fetchComments]);

  const handleSubmitComment = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to comment on stories.',
        variant: 'destructive'
      });
      return;
    }

    if (!newComment.trim()) {
      console.warn('⚠️ Empty comment submitted');
      return;
    }

    console.log('📝 Submitting comment...');
    setIsSubmitting(true);
    
    try {
      await addComment(storyId, newComment.trim());
      setNewComment('');
      console.log('✅ Comment submitted successfully');
      
      toast({
        title: 'Success',
        description: 'Your comment has been posted!',
      });
    } catch (error) {
      console.error('❌ Error submitting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to add comment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to delete comments.',
        variant: 'destructive'
      });
      return;
    }

    console.log('🗑️ Deleting comment:', commentId);
    setDeletingCommentId(commentId);
    
    try {
      await deleteComment(commentId);
      console.log('✅ Comment deleted successfully');
      
      toast({
        title: 'Success',
        description: 'Comment deleted successfully.',
      });
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete comment. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Comments List - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full px-4">
          <div className="space-y-4 py-4">
            {loading && comments.length === 0 ? (
              // Only show loading if we have no comments yet
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">No comments yet</p>
                <p className="text-sm text-gray-400">Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => {
                const isOwnComment = user && comment.user_id === user.id;
                
                return (
                  <div key={comment.id} className="flex space-x-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={comment.profiles?.avatar_url} />
                      <AvatarFallback>
                        {comment.profiles?.display_name?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white text-sm">
                            {comment.profiles?.display_name || 'Anonymous'}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {isOwnComment && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              >
                                <MoreVertical className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleDeleteComment(comment.id)}
                                disabled={deletingCommentId === comment.id}
                                className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {deletingCommentId === comment.id ? 'Deleting...' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Comment Form - Fixed at bottom */}
      <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-white dark:bg-gray-700">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user.email?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isSubmitting}
                  className="min-h-[60px] bg-gray-50 dark:bg-gray-600 border-gray-300 dark:border-gray-500 resize-none text-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">Press Enter to post</p>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isSubmitting ?  (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3 mr-1" />
                        Post
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
              Sign in to join the conversation
            </p>
            <Button variant="outline" size="sm">
              Sign In to Comment
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
