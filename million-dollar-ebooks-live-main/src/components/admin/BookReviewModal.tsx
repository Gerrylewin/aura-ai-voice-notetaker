
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, AlertTriangle, Star, BookOpen } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

interface BookReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Tables<'books'>;
  onStatusUpdate: () => void;
}

interface AIReview {
  overallScore: number;
  recommendation: 'APPROVE' | 'REJECT' | 'NEEDS_REVISION';
  contentQuality: { score: number; analysis: string };
  appropriateness: { score: number; analysis: string };
  originality: { score: number; analysis: string };
  marketability: { score: number; analysis: string };
  technicalQuality: { score: number; analysis: string };
  strengths: string[];
  weaknesses: string[];
  concerns: string[];
  authorFeedback: string;
  adminNotes: string;
}

export function BookReviewModal({ isOpen, onClose, book, onStatusUpdate }: BookReviewModalProps) {
  const [aiReview, setAiReview] = useState<AIReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const { toast } = useToast();

  const generateAIReview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-book-review', {
        body: { bookId: book.id }
      });

      if (error) throw error;

      setAiReview(data.review);
      toast({
        title: 'AI Review Generated',
        description: 'The AI has completed its analysis of the book.',
      });
    } catch (error) {
      console.error('Error generating AI review:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate AI review.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookDecision = async (decision: 'published' | 'archived') => {
    try {
      const { error } = await supabase
        .from('books')
        .update({
          book_status: decision,
          updated_at: new Date().toISOString(),
        })
        .eq('id', book.id);

      if (error) throw error;

      toast({
        title: 'Book Updated',
        description: `Book has been ${decision}.`,
      });

      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating book status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update book status.',
        variant: 'destructive',
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 dark:text-green-400';
    if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'APPROVE':
        return <Badge className="bg-green-600"><CheckCircle className="w-4 h-4 mr-1" />Approve</Badge>;
      case 'REJECT':
        return <Badge className="bg-red-600"><XCircle className="w-4 h-4 mr-1" />Reject</Badge>;
      case 'NEEDS_REVISION':
        return <Badge className="bg-yellow-600"><AlertTriangle className="w-4 h-4 mr-1" />Needs Revision</Badge>;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <BookOpen className="w-5 h-5" />
            Book Review: {book?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Book Info */}
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Book Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-700 dark:text-gray-300"><strong>Title:</strong> {book?.title}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Author:</strong> {book?.author_name}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Status:</strong> {book?.book_status}</p>
              <p className="text-gray-700 dark:text-gray-300"><strong>Description:</strong> {book?.description}</p>
            </CardContent>
          </Card>

          {/* AI Review Section */}
          {!aiReview && (
            <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="pt-6">
                <Button 
                  onClick={generateAIReview}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Generating AI Review...' : 'Generate AI Review'}
                </Button>
              </CardContent>
            </Card>
          )}

          {aiReview && (
            <>
              {/* Overall Score & Recommendation */}
              <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
                    AI Analysis Results
                    {getRecommendationBadge(aiReview.recommendation)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className={`text-2xl font-bold ${getScoreColor(aiReview.overallScore)}`}>
                        {aiReview.overallScore}/10
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Scores */}
              <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries({
                    'Content Quality': aiReview.contentQuality,
                    'Appropriateness': aiReview.appropriateness,
                    'Originality': aiReview.originality,
                    'Marketability': aiReview.marketability,
                    'Technical Quality': aiReview.technicalQuality,
                  }).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-200 dark:border-gray-700 pb-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{key}</h4>
                        <span className={`font-bold ${getScoreColor(value.score)}`}>
                          {value.score}/10
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{value.analysis}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-green-600 dark:text-green-400">Strengths</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {aiReview.strengths.map((strength, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300">• {strength}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Weaknesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {aiReview.weaknesses.map((weakness, index) => (
                        <li key={index} className="text-sm text-gray-700 dark:text-gray-300">• {weakness}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Concerns */}
              {aiReview.concerns.length > 0 && (
                <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Concerns & Red Flags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {aiReview.concerns.map((concern, index) => (
                        <li key={index} className="text-sm text-red-700 dark:text-red-300">⚠️ {concern}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Author Feedback */}
              <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">AI-Generated Author Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{aiReview.authorFeedback}</p>
                </CardContent>
              </Card>
            </>
          )}

          {/* Admin Notes */}
          <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add your notes for the author..."
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Decision Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => handleBookDecision('published')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve Book
            </Button>
            <Button
              onClick={() => handleBookDecision('archived')}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Book
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
