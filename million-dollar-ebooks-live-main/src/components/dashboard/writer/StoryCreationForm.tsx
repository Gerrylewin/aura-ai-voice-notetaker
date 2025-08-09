
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAuthorGamification } from '@/hooks/useAuthorGamification';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Send, Save, CheckCircle } from 'lucide-react';

export function StoryCreationForm() {
  const { user } = useAuth();
  const { awardStoryPoints } = useAuthorGamification();
  const { toast } = useToast();
  
  // Auto-save form data to localStorage
  const [savedFormData, setSavedFormData, clearSavedFormData] = useLocalStorage('story-creation-draft', {
    title: '',
    content: '',
  });

  const [title, setTitle] = useState(savedFormData.title);
  const [content, setContent] = useState(savedFormData.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (title || content) {
        setSavedFormData({ title, content });
        setLastSaved(new Date());
      }
    }, 1000); // Save after 1 second of no typing

    return () => clearTimeout(saveTimeout);
  }, [title, content, setSavedFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim()) return;

    setIsSubmitting(true);

    try {
      // Submit the story
      const { data: story, error } = await supabase
        .from('daily_stories')
        .insert({
          title: title.trim(),
          content: content.trim(),
          author_id: user.id,
          story_date: new Date().toISOString().split('T')[0],
          is_published: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error submitting story:', error);
        toast({
          title: 'Error',
          description: 'Failed to submit your story. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Award points for story submission (100 points)
      await awardStoryPoints();

      toast({
        title: 'Story Submitted! 🎉',
        description: 'Your story has been published and you earned 100 points!',
      });

      // Reset form and clear saved data
      setTitle('');
      setContent('');
      clearSavedFormData();
      setLastSaved(null);
      setJustSubmitted(true);

      // Reset success state after a few seconds
      setTimeout(() => {
        setJustSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error in story submission:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  if (justSubmitted) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
        <CardHeader>
          <CardTitle className="text-green-900 dark:text-green-100 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Story Successfully Submitted!
          </CardTitle>
          <p className="text-green-700 dark:text-green-300">
            Your story has been published and you earned 100 points! It's now live in the daily stories feed.
          </p>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Submit Today's Story
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400">
          Share your creativity with the community and earn 100 points!
          Your content is automatically saved as you type.
        </p>
        
        {/* Auto-save indicator */}
        {lastSaved && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Save className="w-4 h-4 mr-1" />
            Auto-saved at {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="story-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Story Title
            </label>
            <Input
              id="story-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your story title..."
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
              maxLength={100}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="story-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Story
            </label>
            <Textarea
              id="story-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story here..."
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 min-h-[200px]"
              required
              disabled={isSubmitting}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Word count: {wordCount}
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                Earn 100 points when you submit!
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Story (+100 points)
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
