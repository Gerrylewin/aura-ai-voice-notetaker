
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Calendar,
  Shield,
  CheckCircle,
  AlertTriangle,
  Edit,
  Save,
  X
} from 'lucide-react';

interface UserWithAuth {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  user_role: string;
  is_verified: boolean;
  profile_completed: boolean;
  email_confirmed_at: string | null;
  requires_authentication: boolean;
  created_at: string;
  email?: string;
  is_authenticated?: boolean;
}

interface UserOverviewTabProps {
  user: UserWithAuth;
  onUserUpdated: () => void;
}

export function UserOverviewTab({ user, onUserUpdated }: UserOverviewTabProps) {
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEditUsername = () => {
    setNewUsername(user.username || '');
    setEditingUsername(true);
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      toast({
        title: 'Error',
        description: 'Username cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Username updated successfully.',
      });
      
      setEditingUsername(false);
      onUserUpdated();
    } catch (error: any) {
      console.error('Error updating username:', error);
      toast({
        title: 'Error',
        description: 'Failed to update username.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingUsername(false);
    setNewUsername('');
  };

  return (
    <div className="space-y-4">
      {editingUsername && (
        <div className="bg-blue-50 p-4 rounded-lg border">
          <Label htmlFor="username" className="text-sm font-medium">
            Edit Username
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Input
              id="username"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Enter new username"
              className="flex-1"
            />
            <Button
              size="sm"
              onClick={handleSaveUsername}
              disabled={loading}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelEdit}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-medium text-sm text-gray-500 mb-2">Account Status</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {user.is_authenticated ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Authenticated</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-orange-600">Needs Authentication</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Shield className={`h-4 w-4 ${user.is_verified ? 'text-green-500' : 'text-gray-400'}`} />
              <span>{user.is_verified ? 'Verified' : 'Unverified'}</span>
            </div>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-sm text-gray-500 mb-2">Profile</h3>
          <div className="space-y-1 text-sm">
            <div>Profile: {user.profile_completed ? 'Complete' : 'Incomplete'}</div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Joined: {new Date(user.created_at).toLocaleDateString()}
            </div>
            {user.email_confirmed_at && (
              <div>Confirmed: {new Date(user.email_confirmed_at).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </div>
      
      {user.bio && (
        <div>
          <h3 className="font-medium text-sm text-gray-500 mb-2">Bio</h3>
          <p className="text-sm bg-gray-50 p-3 rounded">{user.bio}</p>
        </div>
      )}

      {!editingUsername && (
        <div className="flex justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEditUsername}
            className="flex items-center gap-2"
          >
            <Edit className="h-3 w-3" />
            Edit Username
          </Button>
        </div>
      )}
    </div>
  );
}
