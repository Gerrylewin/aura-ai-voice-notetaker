
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { PenTool, Mail } from 'lucide-react';

interface AccountTypeSettingsProps {
  profile: any;
  upgradeToWriter: () => Promise<void>;
}

export function AccountTypeSettings({ profile, upgradeToWriter }: AccountTypeSettingsProps) {
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgradeToWriter = async () => {
    setUpgrading(true);
    try {
      await upgradeToWriter();
      toast({
        title: 'Account upgraded!',
        description: 'You are now a writer! Please complete your writer profile setup to get started.',
      });
      
      // Redirect to dashboard where onboarding will trigger
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to upgrade account',
        variant: 'destructive',
      });
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <PenTool className="w-5 h-5" />
          Account Type
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Manage your account privileges and access level
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-gray-900 dark:text-white font-medium">Current Role: {profile?.user_role}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {profile?.user_role === 'reader' 
                ? 'You can read and purchase books'
                : profile?.user_role === 'writer'
                ? 'You can read, purchase, and publish books'
                : 'You have full administrative access'
              }
            </p>
          </div>
          
          {profile?.user_role === 'reader' && (
            <Button 
              onClick={handleUpgradeToWriter}
              disabled={upgrading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Mail className="w-4 h-4 mr-2" />
              {upgrading ? 'Upgrading...' : 'Upgrade to Writer'}
            </Button>
          )}

          {profile?.user_role === 'writer' && (
            <div className="text-green-600 dark:text-green-400 font-medium">
              ✓ Writer Access Enabled
            </div>
          )}
        </div>
        
        {profile?.user_role === 'reader' && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <h4 className="text-blue-600 dark:text-blue-400 font-medium mb-2">Become a Writer</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              Upgrade your account to start publishing your own books and earn 90% of every sale. 
              You'll be guided through setting up your writer profile and goals.
            </p>
          </div>
        )}

        {profile?.user_role === 'writer' && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <h4 className="text-green-600 dark:text-green-400 font-medium mb-2">Writer Benefits</h4>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              You now have access to the writer dashboard where you can publish books, 
              set up Stripe payments, and track your earnings.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
