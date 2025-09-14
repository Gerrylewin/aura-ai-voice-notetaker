
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FlagContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
}

export function FlagContentModal({ isOpen, onClose, bookId, bookTitle }: FlagContentModalProps) {
  const [flagType, setFlagType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !flagType) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('content_flags')
        .insert({
          book_id: bookId,
          reporter_id: user.id,
          flag_type: flagType,
          description: description.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Content Flagged',
        description: 'Thank you for reporting this content. We will review it shortly.',
      });

      onClose();
      setFlagType('');
      setDescription('');
    } catch (error) {
      console.error('Error flagging content:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit flag. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle>Flag Content: {bookTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Reason for flagging</label>
            <Select value={flagType} onValueChange={setFlagType}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="inappropriate_content">Inappropriate Content</SelectItem>
                <SelectItem value="copyright_violation">Copyright Violation</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
                <SelectItem value="hate_speech">Hate Speech</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Additional details (optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional context about why you're flagging this content..."
              className="bg-gray-800 border-gray-700"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!flagType || isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Flag'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
