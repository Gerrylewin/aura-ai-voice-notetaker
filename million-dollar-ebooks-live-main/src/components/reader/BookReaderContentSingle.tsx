
import React, { forwardRef } from 'react';
import { FONTS } from './BookReaderSettings';

interface BookReaderContentSingleProps {
  content: string;
  selectedFont: string;
  isMobile: boolean;
  onChapterClick: (chapterTitle: string) => void;
}

export const BookReaderContentSingle = forwardRef<HTMLDivElement, BookReaderContentSingleProps>(
  ({ content, selectedFont, isMobile, onChapterClick }, ref) => {
    const fontFamily = FONTS[selectedFont as keyof typeof FONTS].family;
    const fontSize = selectedFont === 'cursive' ? (isMobile ? '16px' : '18px') : (isMobile ? '14px' : '16px');
    const lineHeight = selectedFont === 'cursive' ? (isMobile ? '1.7' : '1.8') : (isMobile ? '1.6' : '1.7');

    // Process content to create interactive chapters
    const processContent = (content: string) => {
      if (!content) return '';
      
      // Convert content to HTML with clickable chapter links
      let processedContent = content
        .replace(/CHAPTER \d+[.:]/g, (match) => {
          const chapterTitle = match.trim();
          return `<h2 class="chapter-header cursor-pointer hover:text-amber-600 dark:hover:text-amber-400 transition-colors" data-chapter="${chapterTitle}">${chapterTitle}</h2>`;
        })
        .replace(/\n\n/g, '</p><p>')
        .replace(/^\s*(.+)$/gm, '<p>$1</p>')
        .replace(/<p><\/p>/g, '');

      return `<div class="prose prose-amber dark:prose-invert max-w-none">${processedContent}</div>`;
    };

    const handleContentClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('chapter-header')) {
        const chapterTitle = target.getAttribute('data-chapter');
        if (chapterTitle) {
          onChapterClick(chapterTitle);
        }
      }
    };

    return (
      <div className="flex-1 overflow-hidden">
        <div 
          ref={ref}
          className="h-full overflow-y-auto px-4 lg:px-8 py-6 bg-amber-50 dark:bg-amber-900"
          style={{ 
            fontFamily,
            fontSize,
            lineHeight
          }}
          onClick={handleContentClick}
        >
          <div className="max-w-4xl mx-auto">
            <div 
              className="text-amber-900 dark:text-amber-100 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: processContent(content) }}
            />
          </div>
        </div>
      </div>
    );
  }
);

BookReaderContentSingle.displayName = 'BookReaderContentSingle';
