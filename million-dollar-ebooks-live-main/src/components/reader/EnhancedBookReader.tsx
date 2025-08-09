
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGestureReader } from '@/hooks/useGestureReader';
import { useReadingPreferences, useUpdateReadingPreferences } from '@/hooks/useReadingPreferences';
import { useUpdateReadingProgress } from '@/hooks/useReadingProgress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { EnhancedBookPaginator, EnhancedPaginationInfo } from '@/utils/enhancedBookPagination';
import { Settings, BookOpen, ArrowLeft, Sun, Moon, X, Search, Bookmark, BookmarkPlus, MessageSquare, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedBookReaderProps {
  content: string;
  title: string;
  bookId?: string;
  onClose: () => void;
}

interface Bookmark {
  id: string;
  pageNumber: number;
  title: string;
  content: string;
  createdAt: Date;
}

interface Annotation {
  id: string;
  pageNumber: number;
  text: string;
  note: string;
  createdAt: Date;
}

export function EnhancedBookReader({ content, title, bookId, onClose }: EnhancedBookReaderProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ page: number; text: string; index: number }>>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedText, setSelectedText] = useState('');
  const [showAnnotationModal, setShowAnnotationModal] = useState(false);
  
  const readerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  // Load bookmarks and annotations
  useEffect(() => {
    if (bookId && user) {
      loadBookmarks();
      loadAnnotations();
    }
  }, [bookId, user]);

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

  // Search functionality
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    const results: Array<{ page: number; text: string; index: number }> = [];
    const searchTerm = query.toLowerCase();

    paginationInfo.pages.forEach((page, pageIndex) => {
      const pageContent = page.content.toLowerCase();
      let index = 0;
      
      while ((index = pageContent.indexOf(searchTerm, index)) !== -1) {
        const start = Math.max(0, index - 50);
        const end = Math.min(pageContent.length, index + searchTerm.length + 50);
        const text = pageContent.substring(start, end);
        
        results.push({
          page: pageIndex + 1,
          text: `...${text}...`,
          index: index
        });
        
        index += searchTerm.length;
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(0);
  }, [paginationInfo.pages]);

  const handleSearchResultClick = useCallback((result: { page: number; text: string; index: number }) => {
    handlePageTransition(result.page);
    setShowSearch(false);
  }, [handlePageTransition]);

  // Bookmark functionality
  const handleAddBookmark = useCallback(async () => {
    if (!bookId || !user) return;

    const currentPageData = paginationInfo.pages[currentPage - 1];
    if (!currentPageData) return;

    const bookmark: Omit<Bookmark, 'id' | 'createdAt'> = {
      pageNumber: currentPage,
      title: currentPageData.chapterTitle || `Page ${currentPage}`,
      content: currentPageData.content.substring(0, 200) + '...'
    };

    try {
      const { data, error } = await supabase
        .from('book_bookmarks')
        .insert({
          book_id: bookId,
          user_id: user.id,
          page_number: bookmark.pageNumber,
          title: bookmark.title,
          content: bookmark.content
        })
        .select()
        .single();

      if (error) throw error;

      setBookmarks(prev => [...prev, { ...bookmark, id: data.id, createdAt: new Date() }]);
      
      toast({
        title: "Bookmark Added",
        description: `Bookmark added to page ${currentPage}`,
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to add bookmark",
        variant: "destructive"
      });
    }
  }, [bookId, user, currentPage, paginationInfo.pages, toast]);

  // Annotation functionality
  const handleAddAnnotation = useCallback(async (note: string) => {
    if (!bookId || !user || !selectedText.trim()) return;

    try {
      const { data, error } = await supabase
        .from('book_annotations')
        .insert({
          book_id: bookId,
          user_id: user.id,
          page_number: currentPage,
          selected_text: selectedText,
          note: note
        })
        .select()
        .single();

      if (error) throw error;

      const annotation: Annotation = {
        id: data.id,
        pageNumber: currentPage,
        text: selectedText,
        note: note,
        createdAt: new Date()
      };

      setAnnotations(prev => [...prev, annotation]);
      setSelectedText('');
      setShowAnnotationModal(false);
      
      toast({
        title: "Annotation Added",
        description: "Your annotation has been saved",
      });
    } catch (error) {
      console.error('Error adding annotation:', error);
      toast({
        title: "Error",
        description: "Failed to add annotation",
        variant: "destructive"
      });
    }
  }, [bookId, user, currentPage, selectedText, toast]);

  // Load bookmarks and annotations
  const loadBookmarks = async () => {
    if (!bookId || !user) return;

    try {
      const { data, error } = await supabase
        .from('book_bookmarks')
        .select('*')
        .eq('book_id', bookId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookmarks(data || []);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    }
  };

  const loadAnnotations = async () => {
    if (!bookId || !user) return;

    try {
      const { data, error } = await supabase
        .from('book_annotations')
        .select('*')
        .eq('book_id', bookId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnotations(data || []);
    } catch (error) {
      console.error('Error loading annotations:', error);
    }
  };

  // Gesture handling with settings awareness
  const { attachGestureListeners } = useGestureReader({
    onSwipeLeft: handleNextPage,
    onSwipeRight: handlePreviousPage,
    onTapLeft: handlePreviousPage,
    onTapRight: handleNextPage,
    onTapCenter: handleToggleControls,
    disabled: showSettings || showSearch || showBookmarks || showAnnotations,
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
      if (showSettings || showSearch || showBookmarks || showAnnotations) return;
      
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
          if (showSettings || showSearch || showBookmarks || showAnnotations) {
            setShowSettings(false);
            setShowSearch(false);
            setShowBookmarks(false);
            setShowAnnotations(false);
          } else {
            setShowControls(true);
          }
          break;
        case 'f':
        case 'F':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowSearch(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }
          break;
        case 'b':
        case 'B':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleAddBookmark();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNextPage, handlePreviousPage, showSettings, showSearch, showBookmarks, showAnnotations, handleAddBookmark]);

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
      wordsOnPage: currentPageData?.wordCount || 0
    };
  }, [currentPage, paginationInfo.pages]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      {showControls && (
        <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="font-semibold">{title}</h1>
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {paginationInfo.totalPages}
                {readingStats && ` • ${readingStats.progress.percentage}% complete`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(true)}
              title="Search (Ctrl+F)"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBookmarks(true)}
              title="Bookmarks"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAnnotations(true)}
              title="Annotations"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div 
        ref={readerRef}
        className="flex-1 overflow-hidden relative"
        onClick={handleToggleControls}
      >
        {/* Search Overlay */}
        {showSearch && (
          <div className="absolute top-0 left-0 right-0 bg-background/95 backdrop-blur border-b p-4 z-50">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search in book..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSearch(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.page}-${result.index}`}
                    className={`p-2 cursor-pointer hover:bg-muted rounded ${
                      index === currentSearchIndex ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSearchResultClick(result)}
                  >
                    <div className="text-sm font-medium">Page {result.page}</div>
                    <div className="text-xs text-muted-foreground">{result.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookmarks Overlay */}
        {showBookmarks && (
          <div className="absolute top-0 right-0 w-80 h-full bg-background/95 backdrop-blur border-l p-4 z-50 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Bookmarks</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBookmarks(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {bookmarks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No bookmarks yet. Click the bookmark icon to add one.
              </p>
            ) : (
              <div className="space-y-2">
                {bookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                    onClick={() => {
                      handlePageTransition(bookmark.pageNumber);
                      setShowBookmarks(false);
                    }}
                  >
                    <div className="font-medium">{bookmark.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Page {bookmark.pageNumber}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {bookmark.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Annotations Overlay */}
        {showAnnotations && (
          <div className="absolute top-0 right-0 w-80 h-full bg-background/95 backdrop-blur border-l p-4 z-50 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Annotations</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnnotations(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {annotations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No annotations yet. Select text and click the annotation icon to add one.
              </p>
            ) : (
              <div className="space-y-2">
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                    onClick={() => {
                      handlePageTransition(annotation.pageNumber);
                      setShowAnnotations(false);
                    }}
                  >
                    <div className="font-medium">Page {annotation.pageNumber}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      "{annotation.text}"
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {annotation.note}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Book Content */}
        <div
          className="h-full overflow-y-auto"
          style={themeStyles}
        >
          {paginationInfo.pages[currentPage - 1] && (
            <div
              className={`prose prose-lg max-w-none ${
                isTransitioning ? 'opacity-50 transition-opacity duration-200' : ''
              }`}
              dangerouslySetInnerHTML={{
                __html: paginationInfo.pages[currentPage - 1].htmlContent
              }}
              onMouseUp={() => {
                const selection = window.getSelection();
                if (selection && selection.toString().trim()) {
                  setSelectedText(selection.toString().trim());
                }
              }}
            />
          )}
        </div>

        {/* Navigation Controls */}
        {showControls && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-background/95 backdrop-blur rounded-lg p-2 border">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {currentPage} / {paginationInfo.totalPages}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === paginationInfo.totalPages}
            >
              <ArrowLeft className="h-4 w-4 rotate-180" />
            </Button>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur z-50 flex items-center justify-center">
          <Card className="w-96 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Reader Settings</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Settings content would go here */}
              <p className="text-muted-foreground">
                Reader settings will be implemented here.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Annotation Modal */}
      {showAnnotationModal && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur z-50 flex items-center justify-center">
          <Card className="w-96">
            <div className="p-6">
              <h3 className="font-semibold mb-4">Add Annotation</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Selected Text</label>
                <div className="p-2 bg-muted rounded text-sm">
                  "{selectedText}"
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Note</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Add your note..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      handleAddAnnotation(e.currentTarget.value);
                    }
                  }}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAnnotationModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const textarea = document.querySelector('textarea');
                    if (textarea) {
                      handleAddAnnotation(textarea.value);
                    }
                  }}
                >
                  Add Annotation
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
