
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface AccountInformationProps {
  user: any;
  profile: any;
}

export function AccountInformation({ user, profile }: AccountInformationProps) {
  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Account Information</CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Your account details and verification status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-gray-600 dark:text-gray-400">Email Address</Label>
            <p className="text-gray-900 dark:text-white">{user.email}</p>
          </div>
          <div>
            <Label className="text-gray-600 dark:text-gray-400">Account Status</Label>
            <p className="text-gray-900 dark:text-white">
              {profile?.is_verified ? 'Verified' : 'Unverified'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
