
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useStories } from '@/hooks/useStories';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { PenTool, Calendar, AlertCircle, Save, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WordCounter } from '@/components/writer/WordCounter';

interface StorySubmissionFormProps {
  onStorySubmitted: () => void;
}

export function StorySubmissionForm({ onStorySubmitted }: StorySubmissionFormProps) {
  const { user } = useAuth();
  const { submitStory, loading, hasSubmittedToday, checkTodaySubmission } = useStories();
  const { toast } = useToast();
  
  // Auto-save form data to localStorage
  const [savedFormData, setSavedFormData, clearSavedFormData] = useLocalStorage('story-submission-draft', {
    title: '',
    description: '',
    content: '',
  });

  const [formData, setFormData] = useState(savedFormData);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (formData.title || formData.description || formData.content) {
        setSavedFormData(formData);
        setLastSaved(new Date());
      }
    }, 1000); // Save after 1 second of no typing

    return () => clearTimeout(saveTimeout);
  }, [formData, setSavedFormData]);

  // Calculate word count
  const wordCount = formData.content.trim() ? formData.content.trim().split(/\s+/).length : 0;

  useEffect(() => {
    if (user) {
      console.log('Checking submission status for user:', user.id);
      checkTodaySubmission();
    }
  }, [user, checkTodaySubmission]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in the title and content.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting story...');
      await submitStory(formData);
      
      // Clear form and saved data after successful submission
      setFormData({ title: '', description: '', content: '' });
      clearSavedFormData();
      setLastSaved(null);
      setJustSubmitted(true);
      
      // Refresh the submission check
      await checkTodaySubmission();
      
      // Show success state briefly before calling onStorySubmitted
      setTimeout(() => {
        onStorySubmitted();
      }, 1500);
      
      toast({
        title: "Story submitted! 🎉",
        description: "Your story has been published and is now live in the feed.",
      });
    } catch (error) {
      console.error('Story submission error:', error);
      
      // Handle specific constraint violation
      if (error instanceof Error && error.message.includes('daily_stories_author_id_story_date_key')) {
        toast({
          title: "Already submitted today",
          description: "You have already submitted a story for today. Come back tomorrow!",
          variant: "destructive",
        });
        await checkTodaySubmission();
        return;
      }
      
      toast({
        title: "Submission failed",
        description: "There was an error submitting your story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (hasSubmittedToday) {
    return (
      <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <Calendar className="h-4 w-4" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          You've already submitted a story today! Come back tomorrow to submit another story.
        </AlertDescription>
      </Alert>
    );
  }

  if (justSubmitted) {
    return (
      <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <strong>Success!</strong> Your story has been submitted and is now live in the feed. Thank you for sharing your creativity!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <WordCounter wordCount={wordCount} target={0} />
      
      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Save className="w-4 h-4 mr-1" />
          Auto-saved at {lastSaved.toLocaleTimeString()}
        </div>
      )}
      
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            <PenTool className="w-5 h-5 mr-2" />
            Submit Today's Story
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Share your creativity! Submit one story per day to compete for 1000 points.
            Your content is automatically saved as you type.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-gray-900 dark:text-white">
                Story Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter an engaging title for your story..."
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                maxLength={100}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-900 dark:text-white">
                Short Description
              </Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description or hook for your story..."
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                maxLength={200}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="content" className="text-gray-900 dark:text-white">
                Story Content *
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Write your story here... Let your creativity flow!"
                className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 min-h-[300px] resize-none"
                rows={12}
                disabled={isSubmitting}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.content.length} characters
              </p>
            </div>

            <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>Competition Rules:</strong> You can submit one story per day. Stories are ranked by reactions: 
                Hearts (3 points), Shock (2 points), minus Thumbs-down (1 point). Daily winner gets 1000 author points!
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Story'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
