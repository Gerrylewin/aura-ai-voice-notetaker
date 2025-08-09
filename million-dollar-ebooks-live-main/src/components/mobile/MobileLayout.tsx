
import React from 'react';
import { useMobileUtils } from '@/hooks/useMobileUtils';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileLayout({ 
  children, 
  className
}: MobileLayoutProps) {
  const { isMobile } = useMobileUtils();

  if (!isMobile) {
    return <div className={cn("pt-32", className)}>{children}</div>;
  }

  return (
    <div className={cn("w-full pt-16", className)}>
      {children}
    </div>
  );
}
