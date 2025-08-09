import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ProfileImageUpload } from './ProfileImageUpload';
import { ExternalLinksManager } from './ExternalLinksManager';
import { CheckCircle, User, Globe } from 'lucide-react';

interface ExternalLink {
  id: string;
  title: string;
  url: string;
  type: 'amazon' | 'portfolio' | 'social' | 'other';
}

export function WriterOnboarding() {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    website_url: profile?.website_url || '',
    avatar_url: profile?.avatar_url || null,
  });

  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);

  useEffect(() => {
    if (profile?.external_links) {
      const links = Object.entries(profile.external_links).map(([id, link]: [string, any]) => ({
        id,
        ...link
      }));
      setExternalLinks(links);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Convert external links to object format for database
      const externalLinksObj = externalLinks.reduce((acc, link) => {
        acc[link.id] = {
          title: link.title,
          url: link.url,
          type: link.type
        };
        return acc;
      }, {} as Record<string, any>);

      await updateProfile({
        ...formData,
        external_links: externalLinksObj,
        profile_completed: true
      });

      toast({
        title: 'Profile completed!',
        description: 'Your writer profile has been set up successfully.',
      });

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const isStep1Complete = formData.display_name && formData.bio && formData.avatar_url;
  const isStep2Complete = formData.username;

  if (!user || !profile || profile.user_role !== 'writer') {
    return null;
  }

  if (profile.profile_completed) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6" />
            Complete Your Writer Profile
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Help readers discover and connect with you by completing your profile.
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center space-x-4 pt-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isStep1Complete ? 'bg-red-600 border-red-600 text-white' : 'border-gray-400'}`}>
                {isStep1Complete ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span>Basic Info</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isStep2Complete ? 'bg-red-600 border-red-600 text-white' : 'border-gray-400'}`}>
                {isStep2Complete ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <span>Username</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-gray-400">
                3
              </div>
              <span>External Links</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <ProfileImageUpload
                  userId={user.id}
                  currentImageUrl={formData.avatar_url}
                  onImageUpdated={(url) => setFormData(prev => ({ ...prev, avatar_url: url }))}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="display_name" className="text-gray-900 dark:text-white">Display Name *</Label>
                  <Input
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Your pen name or real name"
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio" className="text-gray-900 dark:text-white">About You *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell readers about yourself, your writing style, and what inspires you..."
                    rows={4}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                  <p className="text-sm text-gray-500 mt-1">This will be displayed on your public profile</p>
                </div>
              </div>
              
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!isStep1Complete}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Continue
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-gray-900 dark:text-white">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Choose a unique username"
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                  <p className="text-sm text-gray-500 mt-1">This will be part of your profile URL</p>
                </div>
                
                <div>
                  <Label htmlFor="website_url" className="text-gray-900 dark:text-white">Personal Website</Label>
                  <Input
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                    placeholder="https://your-website.com"
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!isStep2Complete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <ExternalLinksManager
                links={externalLinks}
                onChange={setExternalLinks}
              />
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {saving ? 'Saving...' : 'Complete Profile'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
