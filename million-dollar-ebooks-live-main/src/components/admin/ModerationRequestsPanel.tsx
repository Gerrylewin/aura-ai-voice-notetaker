
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ModerationRequest } from '@/hooks/auth/types';

export function ModerationRequestsPanel() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<ModerationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState<{[key: string]: string}>({});

  const fetchModerationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('moderation_requests')
        .select(`
          *,
          profiles:user_id (
            display_name,
            username
          )
        `)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching moderation requests:', error);
        throw error;
      }

      // Transform the data to match our interface
      const transformedData: ModerationRequest[] = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        requested_at: item.requested_at,
        status: item.status as 'pending' | 'approved' | 'denied',
        reason: item.reason,
        reviewed_by: item.reviewed_by,
        reviewed_at: item.reviewed_at,
        review_notes: item.review_notes,
        created_at: item.created_at,
        updated_at: item.updated_at,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      })) || [];

      setRequests(transformedData);
    } catch (error) {
      console.error('Error fetching moderation requests:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationRequests();
  }, []);

  const handleReviewRequest = async (requestId: string, decision: 'approved' | 'denied') => {
    try {
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Update the moderation request
      const { error: requestError } = await supabase
        .from('moderation_requests')
        .update({
          status: decision,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes[requestId] || null
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // If approved, update the user's role to moderator
      if (decision === 'approved') {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ user_role: 'moderator' })
          .eq('id', request.user_id);

        if (profileError) throw profileError;
      }

      toast({
        title: "Request Updated",
        description: `Moderation request has been ${decision}.`,
      });

      // Refresh the list
      fetchModerationRequests();
    } catch (error) {
      console.error('Error updating moderation request:', error);
      toast({
        title: "Error",
        description: "Failed to update moderation request.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'denied':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading moderation requests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Moderation Requests
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            No moderation requests found.
          </p>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    {request.profiles?.display_name || request.profiles?.username || 'Unknown User'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Requested: {new Date(request.requested_at).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              {request.reason && (
                <div>
                  <p className="text-sm font-medium mb-1">Reason:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{request.reason}</p>
                </div>
              )}

              {request.status === 'pending' && (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add review notes (optional)..."
                    value={reviewNotes[request.id] || ''}
                    onChange={(e) => setReviewNotes(prev => ({
                      ...prev,
                      [request.id]: e.target.value
                    }))}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReviewRequest(request.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReviewRequest(request.id, 'denied')}
                      variant="destructive"
                      size="sm"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Deny
                    </Button>
                  </div>
                </div>
              )}

              {request.review_notes && (
                <div>
                  <p className="text-sm font-medium mb-1">Review Notes:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{request.review_notes}</p>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
