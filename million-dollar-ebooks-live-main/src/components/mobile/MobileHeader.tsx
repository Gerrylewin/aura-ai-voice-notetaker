
import React from 'react';
import { Header } from '@/components/layout/Header';
import { useMobileUtils } from '@/hooks/useMobileUtils';

export function MobileHeader() {
  const { isMobile, safeAreaInsets } = useMobileUtils();

  if (!isMobile) {
    return <Header />;
  }

  return (
    <div 
      style={{ 
        paddingTop: safeAreaInsets.top 
      }}
      className="fixed top-0 w-full z-50"
    >
      <Header />
    </div>
  );
}
