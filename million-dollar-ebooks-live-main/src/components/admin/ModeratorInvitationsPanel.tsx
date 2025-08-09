
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Clock, CheckCircle, XCircle, User, Mail, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ModeratorInvitation {
  id: string;
  user_id: string;
  invited_by: string;
  status: 'pending' | 'accepted' | 'expired';
  invited_at: string;
  accepted_at?: string;
  expires_at: string;
  profiles?: {
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  };
  invited_by_profile?: {
    display_name: string | null;
  };
}

export function ModeratorInvitationsPanel() {
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<ModeratorInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      // For now, since the table doesn't exist in TypeScript types yet, 
      // we'll just show an empty state and inform the user
      console.log('Moderator invitations feature is being set up...');
      setInvitations([]);
      
      toast({
        title: "Info",
        description: "Moderator invitations feature is being set up. Invitations will appear here once the system is fully configured.",
      });
    } catch (error) {
      console.error('Error fetching moderator invitations:', error);
      toast({
        title: "Info",
        description: "Moderator invitations feature is being set up.",
      });
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const resendInvitation = async (invitationId: string) => {
    try {
      toast({
        title: "Info",
        description: "Invitation extension feature is being implemented.",
      });
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast({
        title: "Error",
        description: "Failed to resend invitation.",
        variant: "destructive",
      });
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    try {
      toast({
        title: "Info",
        description: "Invitation revocation feature is being implemented.",
      });
    } catch (error) {
      console.error('Error revoking invitation:', error);
      toast({
        title: "Error",
        description: "Failed to revoke invitation.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string, expiresAt: string) => {
    const isExpired = new Date(expiresAt) < new Date();
    
    if (isExpired && status === 'pending') {
      return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Expired</Badge>;
    }
    
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-red-600"><XCircle className="w-3 h-3 mr-1" />Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading moderator invitations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Moderator Invitations ({invitations.filter(inv => inv.status === 'pending').length} pending)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-4">
            No moderator invitations found. When you promote users to moderator role, they will appear here.
          </p>
        ) : (
          <div className="rounded-md border border-gray-200 dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => {
                  const isExpired = new Date(invitation.expires_at) < new Date();
                  const isPending = invitation.status === 'pending' && !isExpired;
                  
                  return (
                    <TableRow key={invitation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={invitation.profiles?.avatar_url || ''} />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {invitation.profiles?.display_name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              @{invitation.profiles?.username || 'no-username'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {invitation.invited_by_profile?.display_name || 'Unknown Admin'}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        {getStatusBadge(invitation.status, invitation.expires_at)}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(invitation.invited_at).toLocaleDateString()}
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(invitation.expires_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-2">
                          {isPending && (
                            <Button
                              onClick={() => resendInvitation(invitation.id)}
                              size="sm"
                              variant="outline"
                            >
                              Extend
                            </Button>
                          )}
                          {invitation.status === 'pending' && (
                            <Button
                              onClick={() => revokeInvitation(invitation.id)}
                              size="sm"
                              variant="destructive"
                            >
                              Revoke
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
