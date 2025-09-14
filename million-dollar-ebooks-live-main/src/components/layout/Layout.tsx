import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { MobileBottomNav } from './navigation/MobileBottomNav';
import { useResponsive } from '@/hooks/useResponsive';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { isMobile } = useResponsive();
  
  // Pages that don't need the main layout
  const standalonePages = ['/', '/onboarding', '/auth/google/callback'];
  const isStandalonePage = standalonePages.includes(location.pathname);
  
  // Pages that don't need bottom navigation
  const noBottomNavPages = ['/', '/onboarding', '/auth/google/callback', '/read'];
  const needsBottomNav = isMobile && !noBottomNavPages.some(path => location.pathname.startsWith(path));

  return (
    <div className="min-h-screen bg-background">
      {/* Header - only show on non-standalone pages */}
      {!isStandalonePage && <Header />}
      
      {/* Main content */}
      <main className={`${!isStandalonePage ? 'pt-16' : ''} ${needsBottomNav ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {/* Mobile bottom navigation */}
      {needsBottomNav && <MobileBottomNav />}
    </div>
  );
}
