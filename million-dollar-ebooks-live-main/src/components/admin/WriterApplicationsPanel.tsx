import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, User, FileText, Check, X, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface WriterApplication {
  id: string;
  display_name: string;
  email: string;
  bio: string;
  writing_samples: string[];
  previous_publications: string | null;
  writing_genres: string[];
  social_media_links: string | null;
  status: string;
  created_at: string;
  review_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
}

export function WriterApplicationsPanel() {
  const [applications, setApplications] = useState<WriterApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<WriterApplication | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('author_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        throw error;
      }

      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch applications.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewApplication = async (applicationId: string, status: 'approved' | 'denied') => {
    setProcessing(applicationId);
    
    try {
      const application = applications.find(app => app.id === applicationId);
      if (!application) return;

      // Update application status
      const { error: updateError } = await supabase
        .from('author_applications')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // If approved, find the user and upgrade to writer role
      if (status === 'approved') {
        try {
          // Get all users using the admin API
          const { data: authData, error: userError } = await supabase.auth.admin.listUsers();
          
          if (userError) {
            console.error('Error fetching users:', userError);
            // Continue with the rest of the flow even if user upgrade fails
          } else if (authData && authData.users) {
            const user = authData.users.find((u: any) => u.email === application.email);
            
            if (user) {
              // Update the user's role in the profiles table
              const { error: roleUpdateError } = await supabase
                .from('profiles')
                .update({ user_role: 'writer' })
                .eq('id', user.id);

              if (roleUpdateError) {
                console.error('Error updating user role:', roleUpdateError);
                // Don't throw error, just log it
              }
            }
          }
        } catch (authError) {
          console.error('Auth admin error:', authError);
          // Continue with the rest of the flow
        }
      }

      toast({
        title: 'Success',
        description: `Application ${status} successfully.`,
      });

      // Refresh applications
      await fetchApplications();
      setReviewNotes('');
      setSelectedApplication(null);
    } catch (error: any) {
      console.error('Error reviewing application:', error);
      toast({
        title: 'Error',
        description: `Failed to ${status} application.`,
        variant: 'destructive',
      });
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'denied':
        return <Badge variant="destructive">Denied</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading applications...</p>
        </div>
      </div>
    );
  }

  const pendingApplications = applications.filter(app => app.status === 'pending');
  const reviewedApplications = applications.filter(app => app.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Writer Applications</h2>
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Pending: {pendingApplications.length}</span>
          <span>Total: {applications.length}</span>
        </div>
      </div>

      {/* Pending Applications */}
      {pendingApplications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending Review</h3>
          {pendingApplications.map((application) => (
            <Card key={application.id} className="border-l-4 border-l-yellow-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{application.display_name}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{application.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(application.status)}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Review Application - {application.display_name}</DialogTitle>
                        </DialogHeader>
                        
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium">Email</label>
                              <p className="text-sm text-gray-600">{application.email}</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Applied</label>
                              <p className="text-sm text-gray-600">
                                {new Date(application.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Bio</label>
                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {application.bio}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium">Writing Genres</label>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {application.writing_genres.map((genre, index) => (
                                <Badge key={index} variant="secondary">{genre}</Badge>
                              ))}
                            </div>
                          </div>

                          {application.previous_publications && (
                            <div>
                              <label className="text-sm font-medium">Previous Publications</label>
                              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {application.previous_publications}
                              </p>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium">Writing Samples</label>
                            <div className="mt-2 space-y-3">
                              {application.writing_samples.map((sample, index) => (
                                <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                  <h4 className="text-sm font-medium mb-2">Sample {index + 1}</h4>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                    {sample.substring(0, 500)}
                                    {sample.length > 500 && '...'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {application.social_media_links && (
                            <div>
                              <label className="text-sm font-medium">Social Media Links</label>
                              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                {application.social_media_links}
                              </p>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium">Review Notes</label>
                            <Textarea
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              placeholder="Add notes about your decision..."
                              className="mt-1"
                            />
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={() => handleReviewApplication(application.id, 'approved')}
                              disabled={processing === application.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              {processing === application.id ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button
                              onClick={() => handleReviewApplication(application.id, 'denied')}
                              disabled={processing === application.id}
                              variant="destructive"
                            >
                              <X className="w-4 h-4 mr-1" />
                              {processing === application.id ? 'Processing...' : 'Deny'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Applied {new Date(application.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span>{application.writing_samples.length} writing samples</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {application.bio}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reviewed Applications */}
      {reviewedApplications.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recently Reviewed</h3>
          {reviewedApplications.slice(0, 5).map((application) => (
            <Card key={application.id} className="opacity-75">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{application.display_name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{application.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(application.status)}
                    <span className="text-xs text-gray-500">
                      {application.reviewed_at && new Date(application.reviewed_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {application.review_notes && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                    {application.review_notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {applications.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Applications Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Writer applications will appear here when users submit them.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
