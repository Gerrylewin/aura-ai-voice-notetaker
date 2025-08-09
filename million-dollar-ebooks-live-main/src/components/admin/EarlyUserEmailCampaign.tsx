
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Users, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendEarlyUserEmails } from '@/utils/emailService';

export function EarlyUserEmailCampaign() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleSendEmails = async () => {
    if (!confirm('This will send emails to eligible users who haven\'t received the early adopter email yet. Continue?')) {
      return;
    }

    setSending(true);
    try {
      const response = await sendEarlyUserEmails();
      setResult(response);
      
      if (response.campaignComplete) {
        toast({
          title: 'Campaign Complete! 🎉',
          description: `Early user campaign finished - all 100 slots filled!`,
        });
      } else if (response.totalSent === 0) {
        toast({
          title: 'No New Users to Email',
          description: response.message,
        });
      } else {
        toast({
          title: 'Emails Sent Successfully!',
          description: `Sent to ${response.totalSent} new users. ${response.newTotalSent}/100 total sent.`,
        });
      }
    } catch (error: any) {
      console.error('Error sending early user emails:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send emails',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Early User Email Campaign
        </CardTitle>
        <CardDescription>
          Send special recognition emails to your first 100 users (prevents duplicates)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
            <Users className="h-4 w-4" />
            First 100 Users Special Status
          </h4>
          <p className="text-red-700 text-sm mb-3">
            This campaign automatically tracks and limits to the first 100 users. It won't send duplicates 
            and includes encouragement to use chat, write stories, and explore all features.
          </p>
          <ul className="text-sm text-red-600 space-y-1 mb-4">
            <li>• Apology for authentication email issues</li>
            <li>• Special member badge and status</li>
            <li>• Encouragement to use chat and write stories</li>
            <li>• Cash rewards for bug reports and feedback</li>
            <li>• Direct developer access</li>
          </ul>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border ${result.campaignComplete ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
            <h4 className={`font-semibold mb-2 flex items-center gap-2 ${result.campaignComplete ? 'text-blue-900' : 'text-green-900'}`}>
              {result.campaignComplete ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Campaign Complete!
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  Campaign Results
                </>
              )}
            </h4>
            <div className={`text-sm ${result.campaignComplete ? 'text-blue-700' : 'text-green-700'}`}>
              <p>Successfully sent to {result.totalSent} new users</p>
              <p>Total users notified: {result.newTotalSent || result.alreadySentCount}/100</p>
              {result.totalFailed > 0 && <p>{result.totalFailed} failed</p>}
              {result.campaignComplete && (
                <p className="font-medium mt-2">🎉 All 100 founding member slots have been filled!</p>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={handleSendEmails}
          disabled={sending || (result?.campaignComplete)}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          {sending ? 'Sending Emails...' : 
           result?.campaignComplete ? 'Campaign Complete (100/100)' :
           'Send Early User Special Emails'}
        </Button>
      </CardContent>
    </Card>
  );
}
