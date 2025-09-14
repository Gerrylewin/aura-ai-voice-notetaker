
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { Bell, Mail, Smartphone, Save, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { NotificationPreferences } from '@/hooks/auth/types';

export function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [appOpen, setAppOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotificationPreferences();
    }
  }, [user]);

  const fetchNotificationPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        // If no preferences exist, create default ones
        if (error.code === 'PGRST116') {
          await createDefaultPreferences();
          return;
        }
        throw error;
      }

      setPreferences(data);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert({ user_id: user?.id })
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error creating default preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [key]: value });
  };

  const savePreferences = async () => {
    if (!preferences || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({
          email_comments: preferences.email_comments,
          email_gifts: preferences.email_gifts,
          email_messages: preferences.email_messages,
          email_new_books_from_favorites: preferences.email_new_books_from_favorites,
          email_new_stories_from_favorites: preferences.email_new_stories_from_favorites,
          email_book_reviews: preferences.email_book_reviews,
          email_marketing: preferences.email_marketing,
          app_comments: preferences.app_comments,
          app_gifts: preferences.app_gifts,
          app_messages: preferences.app_messages,
          app_new_books_from_favorites: preferences.app_new_books_from_favorites,
          app_new_stories_from_favorites: preferences.app_new_stories_from_favorites,
          app_book_reviews: preferences.app_book_reviews,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading notification preferences...</div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Failed to load notification preferences.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Bell className="w-5 h-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Control how and when you receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <Collapsible open={emailOpen} onOpenChange={setEmailOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">Email Notifications</h3>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${emailOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="grid gap-4 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="email_comments" className="text-gray-900 dark:text-white">
                  Comments on my content
                </Label>
                <Switch
                  id="email_comments"
                  checked={preferences.email_comments}
                  onCheckedChange={(checked) => updatePreference('email_comments', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email_gifts" className="text-gray-900 dark:text-white">
                  Book gifts received
                </Label>
                <Switch
                  id="email_gifts"
                  checked={preferences.email_gifts}
                  onCheckedChange={(checked) => updatePreference('email_gifts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email_messages" className="text-gray-900 dark:text-white">
                  Direct messages
                </Label>
                <Switch
                  id="email_messages"
                  checked={preferences.email_messages}
                  onCheckedChange={(checked) => updatePreference('email_messages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email_new_books_from_favorites" className="text-gray-900 dark:text-white">
                  New books from favorite authors
                </Label>
                <Switch
                  id="email_new_books_from_favorites"
                  checked={preferences.email_new_books_from_favorites}
                  onCheckedChange={(checked) => updatePreference('email_new_books_from_favorites', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email_new_stories_from_favorites" className="text-gray-900 dark:text-white">
                  New stories from favorite authors
                </Label>
                <Switch
                  id="email_new_stories_from_favorites"
                  checked={preferences.email_new_stories_from_favorites}
                  onCheckedChange={(checked) => updatePreference('email_new_stories_from_favorites', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email_book_reviews" className="text-gray-900 dark:text-white">
                  Reviews on my books
                </Label>
                <Switch
                  id="email_book_reviews"
                  checked={preferences.email_book_reviews}
                  onCheckedChange={(checked) => updatePreference('email_book_reviews', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="email_marketing" className="text-gray-900 dark:text-white">
                  Marketing and promotional emails
                </Label>
                <Switch
                  id="email_marketing"
                  checked={preferences.email_marketing}
                  onCheckedChange={(checked) => updatePreference('email_marketing', checked)}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* In-App Notifications */}
        <Collapsible open={appOpen} onOpenChange={setAppOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="font-medium text-gray-900 dark:text-white">In-App Notifications</h3>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${appOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="grid gap-4 pl-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="app_comments" className="text-gray-900 dark:text-white">
                  Comments on my content
                </Label>
                <Switch
                  id="app_comments"
                  checked={preferences.app_comments}
                  onCheckedChange={(checked) => updatePreference('app_comments', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="app_gifts" className="text-gray-900 dark:text-white">
                  Book gifts received
                </Label>
                <Switch
                  id="app_gifts"
                  checked={preferences.app_gifts}
                  onCheckedChange={(checked) => updatePreference('app_gifts', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="app_messages" className="text-gray-900 dark:text-white">
                  Direct messages
                </Label>
                <Switch
                  id="app_messages"
                  checked={preferences.app_messages}
                  onCheckedChange={(checked) => updatePreference('app_messages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="app_new_books_from_favorites" className="text-gray-900 dark:text-white">
                  New books from favorite authors
                </Label>
                <Switch
                  id="app_new_books_from_favorites"
                  checked={preferences.app_new_books_from_favorites}
                  onCheckedChange={(checked) => updatePreference('app_new_books_from_favorites', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="app_new_stories_from_favorites" className="text-gray-900 dark:text-white">
                  New stories from favorite authors
                </Label>
                <Switch
                  id="app_new_stories_from_favorites"
                  checked={preferences.app_new_stories_from_favorites}
                  onCheckedChange={(checked) => updatePreference('app_new_stories_from_favorites', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="app_book_reviews" className="text-gray-900 dark:text-white">
                  Reviews on my books
                </Label>
                <Switch
                  id="app_book_reviews"
                  checked={preferences.app_book_reviews}
                  onCheckedChange={(checked) => updatePreference('app_book_reviews', checked)}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Button 
          onClick={savePreferences} 
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}
