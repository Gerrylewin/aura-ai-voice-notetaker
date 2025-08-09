
import React, { useState, Suspense, lazy } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCleanAccountSetup } from '@/hooks/useCleanAccountSetup';
import { Header } from '@/components/layout/Header';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, PenTool, Sparkles, ExternalLink } from 'lucide-react';
import { ProfileCompletionBanner } from '@/components/notifications/ProfileCompletionBanner';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

// Lazy load dashboard components for better performance
const ReaderDashboard = lazy(() => import('@/components/dashboard/ReaderDashboard').then(module => ({ default: module.ReaderDashboard })));
const WriterDashboard = lazy(() => import('@/components/dashboard/WriterDashboard').then(module => ({ default: module.WriterDashboard })));
const ReaderOnboarding = lazy(() => import('@/components/onboarding/ReaderOnboarding').then(module => ({ default: module.ReaderOnboarding })));
const WriterOnboarding = lazy(() => import('@/components/onboarding/WriterOnboarding').then(module => ({ default: module.WriterOnboarding })));

// Optimized loading component
const DashboardLoadingSpinner = () => (
  <div className="flex items-center justify-center p-12">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
      <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
    </div>
  </div>
);

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'reader' | 'writer'>('reader');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { shouldShowNotification, dismissNotification } = useProfileCompletion();

  console.log('Dashboard: Render state:', { user: !!user, profile: !!profile, loading });

  // Ensure clean account setup for new users
  useCleanAccountSetup();
  
  React.useEffect(() => {
    if (!profile) return;
    console.log('Dashboard: Profile effect:', profile);
    const isWriter = profile.user_role === 'writer' || profile.user_role === 'admin' || profile.user_role === 'moderator';
    if (isWriter) {
      setActiveTab('writer');
    }

    // Check if user needs onboarding
    if (!profile.profile_completed) {
      setShowOnboarding(true);
    }
  }, [profile]);
  
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show loading while auth is loading
  if (loading) {
    console.log('Dashboard: Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-lg sm:text-xl mb-4">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('Dashboard: No user, showing login prompt');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-lg sm:text-xl mb-4 text-gray-900 dark:text-white">Please log in to access the dashboard</div>
          <Button onClick={() => window.location.href = '/'} className="bg-red-600 hover:bg-red-700 text-white">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Show loading while profile is being fetched/created
  if (!profile) {
    console.log('Dashboard: No profile yet, showing profile setup');
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="text-lg sm:text-xl mb-4">Setting up your profile...</div>
        </div>
      </div>
    );
  }
  
  console.log('Dashboard: Profile loaded, showing dashboard for role:', profile.user_role);
  const isReader = profile.user_role === 'reader';
  const isWriter = profile.user_role === 'writer' || profile.user_role === 'admin' || profile.user_role === 'moderator';

  // Show onboarding if profile is not completed
  if (showOnboarding) {
    return (
      <Suspense fallback={<DashboardLoadingSpinner />}>
        {isWriter ? 
          <WriterOnboarding onComplete={handleOnboardingComplete} /> : 
          <ReaderOnboarding onComplete={handleOnboardingComplete} />
        }
      </Suspense>
    );
  }
  
  const seoData = {
    title: `${profile.display_name || user.email?.split('@')[0]}'s Dashboard - Million Dollar eBooks`,
    description: 'Access your personalized dashboard to manage your reading library, writing projects, and connect with the community.',
    url: 'https://milliondollarebooks.com/dashboard',
    type: 'website' as const
  };

  // Platform-wide Version 1.0 announcement banner
  const Version1Banner = () => (
    <div className="mb-8 p-6 bg-gradient-to-r from-emerald-50 via-blue-50 to-purple-50 dark:from-emerald-900/20 dark:via-blue-900/20 dark:to-purple-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="w-7 h-7 text-emerald-600 dark:text-emerald-400 animate-pulse" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          🎉 VERSION 1.0 IS LIVE - The Crypto Publishing Revolution!
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
            ✅ USDC Payments Live on Polygon
          </p>
          <p className="text-blue-700 dark:text-blue-300 font-semibold">
            ✅ 90% Creator Revenue Share Active
          </p>
          <p className="text-purple-700 dark:text-purple-300 font-semibold">
            ✅ Global Payment Access Enabled
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            🌍 World's first production crypto-native book platform
          </p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">
            💰 Creators earn more, readers pay less, everyone wins
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Button
              onClick={() => window.open('/release-notes', '_blank')}
              size="sm"
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Release Notes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Readers see only reader dashboard (no tabs)
  if (isReader) {
    return (
      <>
        <SEOHead seo={seoData} />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
          <Header />
          
          <main className="pt-20 sm:pt-32 pb-6 sm:pb-12">
            <div className="container mx-auto px-3 sm:px-6 max-w-7xl">
              <div className="space-y-4 sm:space-y-8">
                <Version1Banner />
                {shouldShowNotification && <ProfileCompletionBanner onDismiss={dismissNotification} />}
                
                <div className="text-center space-y-2 sm:space-y-4">
                  <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Reader Dashboard
                  </h1>
                  <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 px-4">
                    Welcome back! Continue your reading journey and support creators with crypto.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
                  <Suspense fallback={<DashboardLoadingSpinner />}>
                    <ReaderDashboard />
                  </Suspense>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  // Writers, admins, and moderators see unified dashboard with both tabs
  if (isWriter) {
    return (
      <>
        <SEOHead seo={seoData} />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
          <Header />
          
          <main className="pt-20 sm:pt-32 pb-6 sm:pb-12">
            <div className="container mx-auto px-3 sm:px-6 max-w-7xl">
              <div className="space-y-4 sm:space-y-8">
                <Version1Banner />
                {shouldShowNotification && <ProfileCompletionBanner onDismiss={dismissNotification} />}
                
                <div className="text-center space-y-2 sm:space-y-4">
                  <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Dashboard
                  </h1>
                  <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 px-4">
                    Manage your reading and writing journey while earning crypto from your creations.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
                  <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'reader' | 'writer')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 mb-4 sm:mb-8 h-12 sm:h-auto">
                      <TabsTrigger 
                        value="reader" 
                        className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-3"
                      >
                        <BookOpen className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Reader</span>
                        <span className="xs:hidden">Read</span>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="writer" 
                        className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white text-xs sm:text-sm py-2 sm:py-3"
                      >
                        <PenTool className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden xs:inline">Writer</span>
                        <span className="xs:hidden">Write</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="reader">
                      <Suspense fallback={<DashboardLoadingSpinner />}>
                        <ReaderDashboard />
                      </Suspense>
                    </TabsContent>

                    <TabsContent value="writer">
                      <Suspense fallback={<DashboardLoadingSpinner />}>
                        <WriterDashboard />
                      </Suspense>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  // Fallback - should not reach here but just in case
  return (
    <>
      <SEOHead seo={seoData} />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
        <Header />
        
        <main className="pt-20 sm:pt-32 pb-6 sm:pb-12">
          <div className="container mx-auto px-3 sm:px-6 max-w-7xl">
            <div className="space-y-4 sm:space-y-8">
              <Version1Banner />
              {shouldShowNotification && <ProfileCompletionBanner onDismiss={dismissNotification} />}
              
              <div className="text-center space-y-2 sm:space-y-4">
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 px-4">
                  Welcome back! Continue your reading journey.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-6">
                <Suspense fallback={<DashboardLoadingSpinner />}>
                  <ReaderDashboard />
                </Suspense>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
