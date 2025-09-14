
import React from 'react';
import { Header } from '@/components/layout/Header';
import { MobileScrollContainer } from '@/components/mobile/MobileScrollContainer';
import { useMobileUtils } from '@/hooks/useMobileUtils';
import { SupportRequestForm } from '@/components/support/SupportRequestForm';

export default function SupportForm() {
  const { isMobile } = useMobileUtils();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white">
      <Header />
      
      {isMobile ? (
        <div className="pt-16">
          <MobileScrollContainer className="min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    Get Support
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Need help? Submit a support request and we'll get back to you quickly.
                  </p>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <SupportRequestForm />
                </div>
              </div>
            </div>
          </MobileScrollContainer>
        </div>
      ) : (
        <main className="pt-32 pb-16">
          <div className="container mx-auto px-6 max-w-2xl">
            <div className="space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                  Get Support
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Need help? Submit a support request and we'll get back to you quickly.
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <SupportRequestForm />
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
