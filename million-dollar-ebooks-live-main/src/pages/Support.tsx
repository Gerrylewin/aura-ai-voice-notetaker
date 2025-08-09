
import React from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { SupportRequestForm } from '@/components/support/SupportRequestForm';
import { ReleaseNotes } from '@/components/support/ReleaseNotes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HelpCircle, Calendar } from 'lucide-react';

export default function Support() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
      <Header />
      <div className="pt-20 sm:pt-32 pb-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Support & Help
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
                  Get help with your account, submit support requests, and stay updated with release notes.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <Tabs defaultValue="support" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                  <TabsTrigger value="support" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white text-sm">
                    <HelpCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Support Request</span>
                    <span className="sm:hidden">Support</span>
                  </TabsTrigger>
                  <TabsTrigger value="releases" className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white text-sm">
                    <Calendar className="w-4 h-4" />
                    <span className="hidden sm:inline">Release Notes</span>
                    <span className="sm:hidden">Updates</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="support" className="space-y-6">
                  <SupportRequestForm />
                </TabsContent>

                <TabsContent value="releases" className="space-y-6">
                  <ReleaseNotes />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
