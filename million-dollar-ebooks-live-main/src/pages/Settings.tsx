
import React, { useState, Suspense, lazy } from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Bell, Palette, Target, Shield, Info, Coins, CreditCard } from 'lucide-react';
import { useMobileUtils } from '@/hooks/useMobileUtils';

// Lazy load heavy components to improve initial load time
const ProfileSettings = lazy(() => import('@/components/settings/ProfileSettings').then(module => ({ default: module.ProfileSettings })));
const AccountInformation = lazy(() => import('@/components/settings/AccountInformation').then(module => ({ default: module.AccountInformation })));
const NotificationSettings = lazy(() => import('@/components/settings/NotificationSettings').then(module => ({ default: module.NotificationSettings })));
const AppearanceSettings = lazy(() => import('@/components/settings/AppearanceSettings').then(module => ({ default: module.AppearanceSettings })));
const GoalsSettings = lazy(() => import('@/components/settings/GoalsSettings').then(module => ({ default: module.GoalsSettings })));
const AccountTypeSettings = lazy(() => import('@/components/settings/AccountTypeSettings').then(module => ({ default: module.AccountTypeSettings })));
const CryptoEarningsSettings = lazy(() => import('@/components/settings/CryptoEarningsSettings').then(module => ({ default: module.CryptoEarningsSettings })));
const PaymentSettings = lazy(() => import('@/components/settings/PaymentSettings').then(module => ({ default: module.PaymentSettings })));

// Loading component for better UX
const TabLoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
    <span className="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
  </div>
);

export default function Settings() {
  const { user, profile, loading, upgradeToWriter } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const { isMobile } = useMobileUtils();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-xl">Please sign in to access settings</div>
      </div>
    );
  }

  const isWriter = profile.user_role === 'writer';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Info },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    ...(isWriter ? [{ id: 'crypto', label: 'Crypto Earnings', icon: Coins }] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'account-type', label: 'Account Type', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
      <Header />
      <div className="pt-32 pb-12">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Manage your account preferences and customize your Million Dollar eBooks experience.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {isMobile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                              activeTab === tab.id
                                ? 'border-red-600 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:border-red-300 hover:text-red-500'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-sm font-medium text-center leading-tight">{tab.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <TabsList className={`grid w-full ${isWriter ? 'grid-cols-8' : 'grid-cols-7'} bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600`}>
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger 
                          key={tab.id}
                          value={tab.id} 
                          className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{tab.label}</span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                )}

                <TabsContent value="profile">
                  <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <User className="w-5 h-5" />
                        Profile Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<TabLoadingSpinner />}>
                        <ProfileSettings />
                      </Suspense>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="account">
                  <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Info className="w-5 h-5" />
                        Account Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<TabLoadingSpinner />}>
                        <AccountInformation user={user} profile={profile} />
                      </Suspense>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments">
                  <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <CreditCard className="w-5 h-5" />
                        Payment Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<TabLoadingSpinner />}>
                        <PaymentSettings />
                      </Suspense>
                    </CardContent>
                  </Card>
                </TabsContent>

                {isWriter && (
                  <TabsContent value="crypto">
                    <Suspense fallback={<TabLoadingSpinner />}>
                      <CryptoEarningsSettings />
                    </Suspense>
                  </TabsContent>
                )}

                <TabsContent value="notifications">
                  <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Bell className="w-5 h-5" />
                        Notification Preferences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<TabLoadingSpinner />}>
                        <NotificationSettings />
                      </Suspense>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="appearance">
                  <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Palette className="w-5 h-5" />
                        Appearance Settings
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<TabLoadingSpinner />}>
                        <AppearanceSettings />
                      </Suspense>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="goals">
                  <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Target className="w-5 h-5" />
                        Reading & Writing Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<TabLoadingSpinner />}>
                        <GoalsSettings />
                      </Suspense>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="account-type">
                  <Card className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                        <Shield className="w-5 h-5" />
                        Account Type
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Suspense fallback={<TabLoadingSpinner />}>
                        <AccountTypeSettings profile={profile} upgradeToWriter={upgradeToWriter} />
                      </Suspense>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
