
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { HelpCircle, Clock, CheckCircle, User, Mail, Calendar, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SupportRequest {
  id: string;
  email: string;
  subject: string;
  category: string | null;
  priority: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  resolution_notes: string | null;
  user_id: string | null;
}

export function SupportRequestsPanel() {
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const queryClient = useQueryClient();

  const { data: supportRequests, isLoading } = useQuery({
    queryKey: ['support-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching support requests:', error);
        throw error;
      }

      return data as SupportRequest[];
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: string; status: string; notes?: string }) => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = (await supabase.auth.getUser()).data.user?.id;
      }

      if (notes) {
        updateData.resolution_notes = notes;
      }

      const { error } = await supabase
        .from('support_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-requests'] });
      toast({
        title: "Support Request Updated",
        description: "The support request has been successfully updated.",
      });
      setSelectedRequest(null);
      setResolutionNotes('');
      setNewStatus('');
    },
    onError: (error) => {
      console.error('Error updating support request:', error);
      toast({
        title: "Error",
        description: "Failed to update the support request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateRequest = (request: SupportRequest) => {
    if (!newStatus) {
      toast({
        title: "Missing Status",
        description: "Please select a status for the request.",
        variant: "destructive",
      });
      return;
    }

    updateRequestMutation.mutate({
      requestId: request.id,
      status: newStatus,
      notes: resolutionNotes || undefined,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">Loading support requests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900 dark:text-white">
            <HelpCircle className="w-5 h-5 mr-2" />
            Support Requests ({supportRequests?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supportRequests && supportRequests.length > 0 ? (
              supportRequests.map((request) => (
                <div
                  key={request.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {request.subject}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {request.email}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  
                  {request.category && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Category: {request.category.replace('_', ' ')}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {request.description}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No support requests found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Support Request Detail Modal */}
      {selectedRequest && (
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900 dark:text-white">
              <MessageSquare className="w-5 h-5 mr-2" />
              Support Request Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Request Information</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Subject:</strong> {selectedRequest.subject}</p>
                  <p><strong>Email:</strong> {selectedRequest.email}</p>
                  <p><strong>Category:</strong> {selectedRequest.category || 'Not specified'}</p>
                  <p><strong>Priority:</strong> {selectedRequest.priority}</p>
                  <p><strong>Status:</strong> {selectedRequest.status.replace('_', ' ')}</p>
                  <p><strong>Created:</strong> {new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Update Request</h3>
                <div className="space-y-3">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-800">
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {selectedRequest.description}
                </p>
              </div>
            </div>

            {selectedRequest.resolution_notes && (
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Resolution Notes</h3>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedRequest.resolution_notes}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Resolution Notes</h3>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add notes about how this request was resolved..."
                className="bg-gray-50 dark:bg-gray-800 min-h-[100px]"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => handleUpdateRequest(selectedRequest)}
                disabled={updateRequestMutation.isPending || !newStatus}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {updateRequestMutation.isPending ? 'Updating...' : 'Update Request'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedRequest(null);
                  setResolutionNotes('');
                  setNewStatus('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
