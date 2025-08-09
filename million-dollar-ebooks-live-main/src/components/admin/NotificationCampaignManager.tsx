
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Bell, Users, Send } from 'lucide-react';

type UserGroup = 'all' | 'readers' | 'writers' | 'moderators' | 'admins';

interface NotificationForm {
  title: string;
  message: string;
  userGroup: UserGroup;
  sendInApp: boolean;
  sendEmail: boolean;
}

export function NotificationCampaignManager() {
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    message: '',
    userGroup: 'all',
    sendInApp: true,
    sendEmail: true,
  });
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.title.trim() || !form.message.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in both title and message',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-group-notification', {
        body: {
          title: form.title,
          message: form.message,
          userGroup: form.userGroup,
          sendInApp: form.sendInApp,
          sendEmail: form.sendEmail,
        },
      });

      if (error) throw error;

      toast({
        title: 'Notification Sent!',
        description: `Successfully sent to ${data.totalSent} users. ${data.totalFailed || 0} failed.`,
      });

      // Reset form
      setForm({
        title: '',
        message: '',
        userGroup: 'all',
        sendInApp: true,
        sendEmail: true,
      });
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send notification',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getUserGroupDescription = (group: UserGroup) => {
    switch (group) {
      case 'all': return 'All registered users';
      case 'readers': return 'Users with reader role';
      case 'writers': return 'Users with writer role';
      case 'moderators': return 'Users with moderator role';
      case 'admins': return 'Users with admin role';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Group Notification
        </CardTitle>
        <CardDescription>
          Send notifications to specific user groups via in-app notifications and email
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Notification Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter notification title..."
              disabled={sending}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message</label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter your message..."
              rows={4}
              disabled={sending}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Target User Group</label>
            <Select 
              value={form.userGroup} 
              onValueChange={(value: UserGroup) => setForm(prev => ({ ...prev, userGroup: value }))}
              disabled={sending}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="readers">Readers Only</SelectItem>
                <SelectItem value="writers">Writers Only</SelectItem>
                <SelectItem value="moderators">Moderators Only</SelectItem>
                <SelectItem value="admins">Admins Only</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {getUserGroupDescription(form.userGroup)}
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Delivery Methods</label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inApp"
                checked={form.sendInApp}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, sendInApp: !!checked }))}
                disabled={sending}
              />
              <label htmlFor="inApp" className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Send In-App Notification
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="email"
                checked={form.sendEmail}
                onCheckedChange={(checked) => setForm(prev => ({ ...prev, sendEmail: !!checked }))}
                disabled={sending}
              />
              <label htmlFor="email" className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Send Email Notification
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={sending || (!form.sendInApp && !form.sendEmail)}
            className="w-full"
          >
            <Users className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : 'Send Notification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
