
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGestureReader } from '@/hooks/useGestureReader';
import { useReadingPreferences, useUpdateReadingPreferences } from '@/hooks/useReadingPreferences';
import { useUpdateReadingProgress } from '@/hooks/useReadingProgress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { EnhancedBookPaginator, EnhancedPaginationInfo } from '@/utils/enhancedBookPagination';
import { Settings, BookOpen, ArrowLeft, Sun, Moon, X } from 'lucide-react';

interface EnhancedBookReaderProps {
  content: string;
  title: string;
  bookId?: string;
  onClose: () => void;
}

export function EnhancedBookReader({ content, title, bookId, onClose }: EnhancedBookReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const readerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const updateProgress = useUpdateReadingProgress();
  const { data: preferences } = useReadingPreferences();
  const updatePreferences = useUpdateReadingPreferences();

  // Enhanced pagination with performance optimization
  const paginationInfo: EnhancedPaginationInfo = useMemo(() => {
    console.log('📖 Processing book content with Enhanced Paginator...');
    setIsLoading(true);
    const result = EnhancedBookPaginator.paginateContent(content);
    console.log('📊 Enhanced pagination complete:', {
      totalPages: result.totalPages,
      totalWords: result.totalWords,
      averageWordsPerPage: result.averageWordsPerPage,
      chapters: result.chapters.length
    });
    setIsLoading(false);
    return result;
  }, [content]);

  // Page transition with smooth animation
  const handlePageTransition = useCallback(async (newPage: number) => {
    if (newPage === currentPage || newPage < 1 || newPage > paginationInfo.totalPages) {
      return;
    }

    setIsTransitioning(true);
    
    // Use requestAnimationFrame for smooth transitions
    requestAnimationFrame(() => {
      setTimeout(() => {
        setCurrentPage(newPage);
        setIsTransitioning(false);
      }, 100);
    });
  }, [currentPage, paginationInfo.totalPages]);

  // Navigation handlers
  const handleNextPage = useCallback(() => {
    if (currentPage < paginationInfo.totalPages) {
      handlePageTransition(currentPage + 1);
    }
  }, [currentPage, paginationInfo.totalPages, handlePageTransition]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageTransition(currentPage - 1);
    }
  }, [currentPage, handlePageTransition]);

  const handleToggleControls = useCallback(() => {
    setShowControls(!showControls);
    
    // Auto-hide controls after 3 seconds
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    if (!showControls) {
      const timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
      setControlsTimeout(timeout);
    }
  }, [showControls, controlsTimeout]);

  // Gesture handling with settings awareness
  const { attachGestureListeners } = useGestureReader({
    onSwipeLeft: handleNextPage,
    onSwipeRight: handlePreviousPage,
    onTapLeft: handlePreviousPage,
    onTapRight: handleNextPage,
    onTapCenter: handleToggleControls,
    disabled: showSettings, // Disable gestures when settings are open
  });

  // Attach gesture listeners
  useEffect(() => {
    if (readerRef.current) {
      return attachGestureListeners(readerRef.current);
    }
  }, [attachGestureListeners]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showSettings) return;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          handlePreviousPage();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
          e.preventDefault();
          handleNextPage();
          break;
        case 'Escape':
          e.preventDefault();
          if (showSettings) {
            setShowSettings(false);
          } else {
            setShowControls(true);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNextPage, handlePreviousPage, showSettings]);

  // Auto-save progress every 15 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (bookId && user && currentPage > 0 && paginationInfo.totalPages > 0) {
        const progressData = EnhancedBookPaginator.calculateReadingProgress(currentPage, paginationInfo.totalPages);
        updateProgress.mutate({ bookId, percentage: progressData.percentage });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [bookId, user, currentPage, paginationInfo.totalPages, updateProgress]);

  // Theme and styling
  const themeStyles = useMemo(() => {
    if (!preferences) return {};
    
    const fontSizes = {
      xs: '14px',
      sm: '16px',
      md: '18px',
      lg: '20px',
      xl: '24px'
    };

    const lineSpacings = {
      compact: '1.4',
      normal: '1.6',
      relaxed: '1.8'
    };

    const margins = {
      narrow: '1rem',
      normal: '2rem',
      wide: '3rem'
    };

    return {
      fontFamily: preferences.font_family === 'serif' ? 'Georgia, serif' : 
                  preferences.font_family === 'monospace' ? 'Monaco, monospace' : 
                  'system-ui, sans-serif',
      fontSize: fontSizes[preferences.font_size],
      lineHeight: lineSpacings[preferences.line_spacing],
      padding: `2rem ${margins[preferences.margins]}`,
    };
  }, [preferences]);

  // Reading statistics
  const readingStats = useMemo(() => {
    if (!paginationInfo.pages.length) return null;
    
    const progress = EnhancedBookPaginator.calculateReadingProgress(currentPage, paginationInfo.totalPages);
    const currentPageData = paginationInfo.pages[currentPage - 1];
    
    return {
      progress,
      currentChapter: currentPageData?.chapterTitle,
      readingTime: currentPageData?.readingTimeMinutes || 0,
    };
  }, [currentPage, paginationInfo]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Preparing your reading experience...</p>
        </div>
      </div>
    );
  }

  const currentPageContent = paginationInfo.pages[currentPage - 1];

  return (
    <div 
      ref={readerRef}
      className={`fixed inset-0 z-50 overflow-hidden transition-colors duration-300 ${
        preferences?.theme === 'dark' ? 'bg-gray-900' : 
        preferences?.theme === 'sepia' ? 'bg-amber-50' : 'bg-white'
      }`}
    >
      {/* Header Controls */}
      <div className={`absolute top-0 left-0 right-0 z-10 transition-transform duration-300 ${
        showControls ? 'translate-y-0' : '-translate-y-full'
      }`}>
        <div className="bg-background/95 backdrop-blur-sm border-b border-border/20 p-4" data-interactive="true">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onClose} data-interactive="true">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-lg font-semibold text-foreground truncate">{title}</h1>
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {paginationInfo.totalPages}
                {readingStats?.progress && (
                  <span className="ml-2">• {readingStats.progress.percentage}%</span>
                )}
              </p>
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSettings(!showSettings)}
              data-interactive="true"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Panel with event isolation */}
      {showSettings && (
        <div 
          className="absolute top-0 right-0 z-20 w-80 h-full bg-background/95 backdrop-blur-sm border-l border-border/20 overflow-y-auto"
          data-interactive="true"
          onClick={(e) => e.stopPropagation()} // Prevent event bubbling
          onTouchStart={(e) => e.stopPropagation()} // Prevent gesture capture
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <div className="p-6" data-interactive="true">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Reading Settings</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
                className="h-8 w-8 p-0"
                data-interactive="true"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Font Size */}
            <div className="mb-6" data-interactive="true">
              <label className="text-sm font-medium mb-2 block">Font Size</label>
              <div className="flex gap-1">
                {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
                  <Button
                    key={size}
                    variant={preferences?.font_size === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updatePreferences.mutate({ font_size: size })}
                    data-interactive="true"
                  >
                    {size.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Font Family */}
            <div className="mb-6" data-interactive="true">
              <label className="text-sm font-medium mb-2 block">Font</label>
              <div className="flex gap-1">
                {(['serif', 'sans-serif', 'monospace'] as const).map((family) => (
                  <Button
                    key={family}
                    variant={preferences?.font_family === family ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updatePreferences.mutate({ font_family: family })}
                    data-interactive="true"
                  >
                    {family === 'serif' ? 'Serif' : family === 'sans-serif' ? 'Sans' : 'Mono'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Line Spacing */}
            <div className="mb-6" data-interactive="true">
              <label className="text-sm font-medium mb-2 block">Line Spacing</label>
              <div className="flex gap-1">
                {(['compact', 'normal', 'relaxed'] as const).map((spacing) => (
                  <Button
                    key={spacing}
                    variant={preferences?.line_spacing === spacing ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updatePreferences.mutate({ line_spacing: spacing })}
                    data-interactive="true"
                  >
                    {spacing}
                  </Button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div className="mb-6" data-interactive="true">
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="flex gap-1">
                <Button
                  variant={preferences?.theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePreferences.mutate({ theme: 'light' })}
                  data-interactive="true"
                >
                  <Sun className="h-4 w-4 mr-1" />
                  Light
                </Button>
                <Button
                  variant={preferences?.theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePreferences.mutate({ theme: 'dark' })}
                  data-interactive="true"
                >
                  <Moon className="h-4 w-4 mr-1" />
                  Dark
                </Button>
                <Button
                  variant={preferences?.theme === 'sepia' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => updatePreferences.mutate({ theme: 'sepia' })}
                  data-interactive="true"
                >
                  Sepia
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with gesture zone restriction */}
      <div className={`h-full pt-20 pb-16 px-4 ${showSettings ? 'pr-84' : ''}`}>
        <Card className={`h-full transition-opacity duration-200 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}>
          <div className="h-full overflow-y-auto" style={themeStyles}>
            {/* Chapter indicator */}
            {currentPageContent?.isChapterStart && currentPageContent?.chapterTitle && (
              <div className="mb-8 pb-4 border-b border-border/20">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  {currentPageContent.chapterTitle}
                </h2>
                {readingStats?.readingTime && (
                  <div className="text-sm text-muted-foreground">
                    {readingStats.readingTime} min read
                  </div>
                )}
              </div>
            )}

            {/* Page content */}
            <div 
              className={`prose prose-lg max-w-none transition-opacity duration-200 ${
                preferences?.theme === 'dark' ? 'prose-invert' : ''
              } ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
              dangerouslySetInnerHTML={{ __html: currentPageContent?.htmlContent || '' }}
            />
          </div>
        </Card>
      </div>

      {/* Footer Controls */}
      <div className={`absolute bottom-0 left-0 right-0 z-10 transition-transform duration-300 ${
        showControls ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-background/95 backdrop-blur-sm border-t border-border/20 p-4" data-interactive="true">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              data-interactive="true"
            >
              Previous
            </Button>
            
            {readingStats && (
              <div className="text-center text-sm text-muted-foreground">
                {readingStats.progress.percentage}% complete
                {readingStats.currentChapter && (
                  <div className="text-xs">{readingStats.currentChapter}</div>
                )}
              </div>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleNextPage}
              disabled={currentPage === paginationInfo.totalPages}
              data-interactive="true"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Tap zones indicator (only show briefly on first load) - hidden when settings open */}
      {!showSettings && (
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="h-full w-[30%] border-r border-primary/20" />
          <div className="absolute top-0 right-0 h-full w-[30%] border-l border-primary/20" />
        </div>
      )}
    </div>
  );
}
