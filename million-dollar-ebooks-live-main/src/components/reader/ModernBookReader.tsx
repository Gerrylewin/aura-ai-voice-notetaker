import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useGestureReader } from '@/hooks/useGestureReader';
import { useReadingPreferences, useUpdateReadingPreferences } from '@/hooks/useReadingPreferences';
import { useUpdateReadingProgress } from '@/hooks/useReadingProgress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useResponsive } from '@/hooks/useResponsive';
import { EnhancedBookPaginator, EnhancedPaginationInfo } from '@/utils/enhancedBookPagination';
import { 
  Settings, 
  BookOpen, 
  ArrowLeft, 
  Sun, 
  Moon, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Type,
  Palette,
  Volume2,
  Bookmark,
  Share2
} from 'lucide-react';

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
  const [isNightMode, setIsNightMode] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [fontFamily, setFontFamily] = useState('serif');
  
  const readerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isMobile } = useResponsive();
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

  // Load saved preferences
  useEffect(() => {
    if (preferences) {
      setIsNightMode(preferences.nightMode || false);
      setFontSize(preferences.fontSize || 18);
      setLineHeight(preferences.lineHeight || 1.6);
      setFontFamily(preferences.fontFamily || 'serif');
    }
  }, [preferences]);

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
        
        // Update reading progress
        if (user && bookId) {
          const progress = (newPage / paginationInfo.totalPages) * 100;
          updateProgress(bookId, progress);
        }
      }, 150);
    });
  }, [currentPage, paginationInfo.totalPages, user, bookId, updateProgress]);

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

  // Settings handlers
  const handleFontSizeChange = useCallback((value: number[]) => {
    const newSize = value[0];
    setFontSize(newSize);
    updatePreferences({ fontSize: newSize });
  }, [updatePreferences]);

  const handleLineHeightChange = useCallback((value: number[]) => {
    const newLineHeight = value[0];
    setLineHeight(newLineHeight);
    updatePreferences({ lineHeight: newLineHeight });
  }, [updatePreferences]);

  const handleFontFamilyChange = useCallback((family: string) => {
    setFontFamily(family);
    updatePreferences({ fontFamily: family });
  }, [updatePreferences]);

  const handleNightModeToggle = useCallback(() => {
    const newNightMode = !isNightMode;
    setIsNightMode(newNightMode);
    updatePreferences({ nightMode: newNightMode });
  }, [isNightMode, updatePreferences]);

  // Gesture handling
  const { attachGestureListeners } = useGestureReader({
    onSwipeLeft: handleNextPage,
    onSwipeRight: handlePreviousPage,
    onTapLeft: handlePreviousPage,
    onTapRight: handleNextPage,
    onTapCenter: handleToggleControls,
    disabled: showSettings
  });

  // Attach gesture listeners
  useEffect(() => {
    if (readerRef.current && isMobile) {
      return attachGestureListeners(readerRef.current);
    }
  }, [attachGestureListeners, isMobile]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (showSettings) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePreviousPage();
          break;
        case 'ArrowRight':
          handleNextPage();
          break;
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          handleToggleControls();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handlePreviousPage, handleNextPage, handleToggleControls, showSettings, onClose]);

  // Font families
  const fontFamilies = [
    { name: 'Serif', value: 'serif', class: 'font-serif' },
    { name: 'Sans', value: 'sans', class: 'font-sans' },
    { name: 'Mono', value: 'mono', class: 'font-mono' }
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading book...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={readerRef}
      className={`fixed inset-0 z-50 transition-colors duration-300 ${
        isNightMode 
          ? 'bg-gray-900 text-gray-100' 
          : 'bg-background text-foreground'
      }`}
    >
      {/* Header */}
      {showControls && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border safe-top">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex-1 min-w-0">
                <h1 className="font-semibold text-sm truncate">{title}</h1>
                <p className="text-xs text-muted-foreground">
                  Page {currentPage} of {paginationInfo.totalPages}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNightModeToggle}
                className="text-muted-foreground hover:text-foreground"
              >
                {isNightMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div 
        className={`h-full overflow-hidden transition-all duration-300 ${
          showControls ? 'pt-16' : 'pt-0'
        }`}
        onClick={handleToggleControls}
      >
        <div className="h-full flex items-center justify-center px-4 py-8">
          <div 
            className={`max-w-4xl mx-auto transition-all duration-300 ${
              isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: lineHeight,
              fontFamily: fontFamily === 'serif' ? 'Playfair Display, serif' : 
                          fontFamily === 'sans' ? 'Inter, sans-serif' : 
                          'JetBrains Mono, monospace'
            }}
          >
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: paginationInfo.pages[currentPage - 1]?.content || '' 
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      {showControls && (
        <>
          {/* Left Navigation */}
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background/90 disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          {/* Right Navigation */}
          <Button
            variant="ghost"
            size="lg"
            onClick={handleNextPage}
            disabled={currentPage === paginationInfo.totalPages}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border border-border hover:bg-background/90 disabled:opacity-50"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Bottom Progress */}
          <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border safe-bottom">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">
                  {Math.round((currentPage / paginationInfo.totalPages) * 100)}% complete
                </span>
                <span className="text-sm text-muted-foreground">
                  {currentPage} / {paginationInfo.totalPages}
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentPage / paginationInfo.totalPages) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm z-20">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Reading Settings</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">
              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Font Size: {fontSize}px
                </label>
                <Slider
                  value={[fontSize]}
                  onValueChange={handleFontSizeChange}
                  min={14}
                  max={24}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Line Height */}
              <div>
                <label className="block text-sm font-medium mb-3">
                  Line Height: {lineHeight.toFixed(1)}
                </label>
                <Slider
                  value={[lineHeight]}
                  onValueChange={handleLineHeightChange}
                  min={1.2}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-sm font-medium mb-3">Font Family</label>
                <div className="grid grid-cols-3 gap-2">
                  {fontFamilies.map((font) => (
                    <Button
                      key={font.value}
                      variant={fontFamily === font.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFontFamilyChange(font.value)}
                      className={font.class}
                    >
                      {font.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Night Mode */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Night Mode</label>
                <Button
                  variant={isNightMode ? "default" : "outline"}
                  size="sm"
                  onClick={handleNightModeToggle}
                >
                  {isNightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
