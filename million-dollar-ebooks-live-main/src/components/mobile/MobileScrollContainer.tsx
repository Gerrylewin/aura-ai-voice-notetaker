
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useMobileUtils } from '@/hooks/useMobileUtils';
import { cn } from '@/lib/utils';

interface MobileScrollContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileScrollContainer({ 
  children, 
  className
}: MobileScrollContainerProps) {
  const { isMobile } = useMobileUtils();

  if (isMobile) {
    return (
      <div 
        className={cn(
          "w-full overflow-y-auto overflow-x-hidden",
          "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600",
          "scrollbar-track-transparent",
          className
        )}
        style={{
          WebkitOverflowScrolling: 'touch',
          minHeight: 'calc(100vh - 64px)', // Account for header height only
          paddingBottom: '20px'
        }}
      >
        {children}
      </div>
    );
  }

  return (
    <ScrollArea className={cn("flex-1", className)}>
      {children}
    </ScrollArea>
  );
}
