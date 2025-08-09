
import React from 'react';
import { Card } from '@/components/ui/card';
import { FONTS } from './BookReaderSettings';

interface BookReaderContentPaginatedProps {
  content: string;
  currentPage: number;
  totalPages: number;
  selectedFont: string;
  isMobile: boolean;
}

export function BookReaderContentPaginated({
  content,
  currentPage,
  totalPages,
  selectedFont,
  isMobile
}: BookReaderContentPaginatedProps) {
  const fontFamily = FONTS[selectedFont as keyof typeof FONTS].family;
  const fontSize = selectedFont === 'cursive' ? (isMobile ? '16px' : '18px') : (isMobile ? '14px' : '16px');
  const lineHeight = selectedFont === 'cursive' ? (isMobile ? '1.7' : '1.8') : (isMobile ? '1.6' : '1.7');

  // Process and format content for book display
  const formatPageContent = (content: string) => {
    if (!content) return '';
    
    // Clean and format the content for display
    let processedContent = content
      .replace(/<div class="book-page">/, '')
      .replace(/<\/div>$/, '')
      .replace(/\n\s*\n/g, '</p><p>')
      .trim();

    // Ensure proper paragraph wrapping
    if (!processedContent.startsWith('<p>')) {
      processedContent = '<p>' + processedContent;
    }
    if (!processedContent.endsWith('</p>')) {
      processedContent = processedContent + '</p>';
    }

    return processedContent;
  };

  return (
    <div className="flex-1 flex items-center justify-center p-2 lg:p-8 overflow-hidden">
      <div className="relative w-full h-full flex items-center justify-center max-w-4xl">
        {/* Book Shadow Effect */}
        <div className="absolute inset-2 lg:inset-0 bg-amber-800 dark:bg-amber-950 rounded-lg transform translate-x-1 translate-y-1 lg:translate-x-2 lg:translate-y-2" />
        
        {/* Book Page Container */}
        <Card className="relative bg-white dark:bg-amber-50 border-2 border-amber-300 dark:border-amber-600 shadow-2xl w-full h-full overflow-hidden">
          <div className="h-full p-6 lg:p-12 flex flex-col">
            {/* Page Content */}
            <div 
              className="flex-1 text-amber-900 dark:text-amber-800 overflow-y-auto"
              style={{ 
                fontFamily,
                fontSize,
                lineHeight
              }}
            >
              <div 
                className="prose prose-amber dark:prose-amber max-w-none leading-relaxed text-justify"
                dangerouslySetInnerHTML={{ __html: formatPageContent(content) }}
              />
            </div>
            
            {/* Page Number */}
            <div className="text-center text-sm text-amber-600 dark:text-amber-700 mt-6 pt-4 border-t border-amber-200 dark:border-amber-300 flex-shrink-0">
              <span className="font-medium">{currentPage}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
