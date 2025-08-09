
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function ModerationRequestForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reason.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('moderation_requests')
        .insert({
          user_id: user.id,
          reason: reason.trim()
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "Your moderation request has been submitted for review.",
      });
    } catch (error) {
      console.error('Error submitting moderation request:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show to admins/moderators
  if (profile?.user_role === 'admin' || profile?.user_role === 'moderator') {
    return null;
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Request Submitted
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Your moderation request has been submitted and is being reviewed by our team.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Become a Moderator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Help keep our community safe and welcoming. As a moderator, you'll help review content and ensure our guidelines are followed.
            </p>
            <Textarea
              placeholder="Tell us why you'd like to become a moderator and what experience you have with community management..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
              className="resize-none"
            />
          </div>
          <Button 
            type="submit" 
            disabled={loading || !reason.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
