
import React from 'react';
import { Header } from '@/components/layout/Header';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { MobileLayout } from '@/components/mobile/MobileLayout';
import { useMobileUtils } from '@/hooks/useMobileUtils';

export default function Analytics() {
  const { isMobile } = useMobileUtils();

  const content = (
    <div className="container mx-auto px-6 max-w-7xl">
      <div className="space-y-8">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Track platform performance, user engagement, and content metrics.
            </p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
      <Header />
      {isMobile ? (
        <MobileLayout>
          <div className="pt-32 pb-12">
            {content}
          </div>
        </MobileLayout>
      ) : (
        <div className="pt-32 pb-12">
          {content}
        </div>
      )}
    </div>
  );
}
