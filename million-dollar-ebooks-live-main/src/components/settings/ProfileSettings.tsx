
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { ProfileService } from '@/services/profileService';
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';
import { useWriterContent } from '@/hooks/useWriterContent';

export function ProfileSettings() {
  const { user, profile, refreshProfile } = useAuth();
  const { books, stories } = useWriterContent();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    bio: profile?.bio || '',
    website_url: profile?.website_url || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await ProfileService.updateProfile(user.id, formData);
      await refreshProfile();
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully!',
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpdated = async (url: string | null) => {
    await refreshProfile();
  };

  if (!user || !profile) {
    return <div>Loading...</div>;
  }

  const isWriter = profile?.user_role === 'writer' || profile?.user_role === 'admin' || profile?.user_role === 'moderator';

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <ProfileImageUpload
              userId={user.id}
              currentImageUrl={profile.avatar_url}
              onImageUpdated={handleImageUpdated}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_name">Display Name</Label>
                <Input
                  id="display_name"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleInputChange}
                  placeholder="Your display name"
                />
              </div>
              
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profile.username || ''}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contact support to change your username
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                name="website_url"
                type="url"
                value={formData.website_url}
                onChange={handleInputChange}
                placeholder="https://your-website.com"
              />
            </div>

            <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>

          {isWriter && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Content Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{books.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Books</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stories.length}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Stories</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
