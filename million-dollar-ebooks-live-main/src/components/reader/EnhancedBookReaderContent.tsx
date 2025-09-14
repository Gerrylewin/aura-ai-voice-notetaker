import React from 'react';
import { Card } from '@/components/ui/card';

interface EnhancedBookReaderContentProps {
  htmlContent: string;
  currentPage: number;
  totalPages: number;
  selectedFont: string;
  isMobile: boolean;
  chapterTitle?: string;
  isChapterStart: boolean;
  readingTimeMinutes: number;
  isTransitioning?: boolean;
}

export function EnhancedBookReaderContent({
  htmlContent,
  currentPage,
  totalPages,
  selectedFont,
  isMobile,
  chapterTitle,
  isChapterStart,
  readingTimeMinutes,
  isTransitioning = false
}: EnhancedBookReaderContentProps) {
  // Font configuration
  const fontFamily = selectedFont === 'serif' ? 'serif' : 
                    selectedFont === 'mono' ? 'monospace' : 'sans-serif';
  const fontSize = isMobile ? '16px' : '18px';
  const lineHeight = selectedFont === 'mono' ? '1.6' : '1.7';

  return (
    <div className="relative flex flex-col h-full">
      <Card className="flex-1 p-6 md:p-8 shadow-elegant border-border/10 bg-card/95 backdrop-blur-sm overflow-hidden">
        {/* Chapter indicator */}
        {isChapterStart && chapterTitle && (
          <div className="mb-6 pb-4 border-b border-border/20">
            <h2 className="text-lg font-semibold text-foreground/80 mb-1">
              {chapterTitle}
            </h2>
            <div className="text-sm text-muted-foreground">
              {readingTimeMinutes} min read
            </div>
          </div>
        )}

        {/* Main content area */}
        <div 
          className={`
            relative h-full overflow-y-auto
            transition-opacity duration-300 ease-in-out
            ${isTransitioning ? 'opacity-0' : 'opacity-100'}
          `}
          style={{
            fontFamily,
            fontSize,
            lineHeight,
          }}
        >
          {/* Reading content */}
          <div 
            className="prose prose-lg max-w-none dark:prose-invert
                     prose-headings:text-foreground prose-headings:font-semibold
                     prose-p:text-foreground/90 prose-p:leading-relaxed
                     prose-strong:text-foreground prose-em:text-foreground/80
                     prose-blockquote:border-l-primary prose-blockquote:text-foreground/80
                     prose-a:text-primary hover:prose-a:text-primary/80"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Page indicator */}
        <div className="mt-6 pt-4 border-t border-border/20 flex justify-between items-center text-sm text-muted-foreground">
          <div>
            Page {currentPage} of {totalPages}
          </div>
          {!isChapterStart && readingTimeMinutes > 0 && (
            <div>
              ~{readingTimeMinutes} min
            </div>
          )}
        </div>

        {/* Transition overlay */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] 
                        flex items-center justify-center z-10">
            <div className="animate-pulse">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}