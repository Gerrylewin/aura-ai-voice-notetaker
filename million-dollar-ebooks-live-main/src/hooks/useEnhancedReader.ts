import { useState, useEffect, useMemo, useCallback } from 'react';
import { EnhancedBookPaginator, EnhancedPaginationInfo } from '@/utils/enhancedBookPagination';

export interface UseEnhancedReaderOptions {
  content: string;
  initialPage?: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

export interface EnhancedReaderState {
  currentPage: number;
  isLoading: boolean;
  isTransitioning: boolean;
  paginationInfo: EnhancedPaginationInfo;
  readingStats: {
    progress: any;
    wordsRead: number;
    wordsRemaining: number;
    readingTime: { formattedTime: string };
    totalWords: number;
    currentChapter?: string;
  } | null;
}

export interface EnhancedReaderActions {
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToChapter: (chapterTitle: string) => void;
  jumpToFirstPage: () => void;
  jumpToLastPage: () => void;
}

export function useEnhancedReader({
  content,
  initialPage = 1,
  autoSave = false,
  autoSaveInterval = 30000
}: UseEnhancedReaderOptions): [EnhancedReaderState, EnhancedReaderActions] {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Enhanced pagination with performance optimization
  const paginationInfo = useMemo(() => {
    console.log('📖 Processing book content with Enhanced Paginator...');
    setIsLoading(true);
    
    const result = EnhancedBookPaginator.paginateContent(content);
    
    console.log('📊 Enhanced pagination complete:', {
      totalPages: result.totalPages,
      totalWords: result.totalWords,
      chapters: result.chapters.length,
      averageWordsPerPage: result.averageWordsPerPage
    });
    
    setIsLoading(false);
    return result;
  }, [content]);

  // Calculate enhanced reading statistics
  const readingStats = useMemo(() => {
    if (!paginationInfo.pages.length) return null;
    
    const progress = EnhancedBookPaginator.calculateReadingProgress(currentPage, paginationInfo.totalPages);
    const currentPageData = paginationInfo.pages[currentPage - 1];
    const wordsRead = paginationInfo.pages
      .slice(0, currentPage - 1)
      .reduce((total, page) => total + page.wordCount, 0);
    const wordsRemaining = paginationInfo.totalWords - wordsRead - (currentPageData?.wordCount || 0);

    return {
      progress,
      wordsRead,
      wordsRemaining,
      readingTime: { formattedTime: `${progress.estimatedTimeRemaining}m` },
      totalWords: paginationInfo.totalWords,
      currentChapter: currentPageData?.chapterTitle
    };
  }, [currentPage, paginationInfo]);

  // Enhanced page transition with smooth animation
  const handlePageTransition = useCallback(async (newPage: number) => {
    if (newPage === currentPage || newPage < 1 || newPage > paginationInfo.totalPages) {
      return;
    }

    setIsTransitioning(true);
    
    // Optimized transition timing
    setTimeout(() => {
      setCurrentPage(newPage);
      setIsTransitioning(false);
    }, 150);
  }, [currentPage, paginationInfo.totalPages]);

  // Navigation actions
  const actions: EnhancedReaderActions = {
    goToPage: useCallback((page: number) => {
      handlePageTransition(page);
    }, [handlePageTransition]),

    nextPage: useCallback(() => {
      if (currentPage < paginationInfo.totalPages) {
        handlePageTransition(currentPage + 1);
      }
    }, [currentPage, paginationInfo.totalPages, handlePageTransition]),

    previousPage: useCallback(() => {
      if (currentPage > 1) {
        handlePageTransition(currentPage - 1);
      }
    }, [currentPage, handlePageTransition]),

    goToChapter: useCallback((chapterTitle: string) => {
      const chapterPage = EnhancedBookPaginator.findPageByChapter(paginationInfo, chapterTitle);
      handlePageTransition(chapterPage);
    }, [paginationInfo, handlePageTransition]),

    jumpToFirstPage: useCallback(() => {
      handlePageTransition(1);
    }, [handlePageTransition]),

    jumpToLastPage: useCallback(() => {
      handlePageTransition(paginationInfo.totalPages);
    }, [paginationInfo.totalPages, handlePageTransition])
  };

  // Auto-save effect (if enabled)
  useEffect(() => {
    if (!autoSave) return;

    const interval = setInterval(() => {
      // Custom auto-save logic can be implemented here
      console.log('📍 Auto-saving reading progress:', {
        page: currentPage,
        totalPages: paginationInfo.totalPages,
        progress: readingStats?.progress?.percentage
      });
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [autoSave, autoSaveInterval, currentPage, paginationInfo.totalPages, readingStats]);

  const state: EnhancedReaderState = {
    currentPage,
    isLoading,
    isTransitioning,
    paginationInfo,
    readingStats
  };

  return [state, actions];
}