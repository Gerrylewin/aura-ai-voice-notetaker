
export interface BookPage {
  pageNumber: number;
  content: string;
  wordCount: number;
  startIndex: number;
  endIndex: number;
}

export interface PaginationInfo {
  pages: BookPage[];
  totalPages: number;
  totalWords: number;
  averageWordsPerPage: number;
}

export class BookPaginator {
  private static readonly WORDS_PER_PAGE = 250;
  private static readonly MIN_WORDS_PER_PAGE = 150;
  private static readonly MAX_WORDS_PER_PAGE = 350;

  static paginateContent(content: string): PaginationInfo {
    if (!content || content.trim().length === 0) {
      return {
        pages: [],
        totalPages: 0,
        totalWords: 0,
        averageWordsPerPage: 0
      };
    }

    // Clean and process the HTML content
    const cleanContent = this.cleanHtmlContent(content);
    const words = this.extractWords(cleanContent);
    const totalWords = words.length;

    if (totalWords === 0) {
      return {
        pages: [],
        totalPages: 0,
        totalWords: 0,
        averageWordsPerPage: 0
      };
    }

    const pages: BookPage[] = [];
    let currentPageStart = 0;
    let pageNumber = 1;

    while (currentPageStart < words.length) {
      const pageWords = words.slice(currentPageStart, currentPageStart + this.WORDS_PER_PAGE);
      const pageContent = this.reconstructPageContent(pageWords, content, currentPageStart, words);
      
      pages.push({
        pageNumber,
        content: pageContent,
        wordCount: pageWords.length,
        startIndex: currentPageStart,
        endIndex: currentPageStart + pageWords.length - 1
      });

      currentPageStart += this.WORDS_PER_PAGE;
      pageNumber++;
    }

    return {
      pages,
      totalPages: pages.length,
      totalWords,
      averageWordsPerPage: Math.round(totalWords / pages.length)
    };
  }

  private static cleanHtmlContent(html: string): string {
    // Remove HTML tags but preserve structure markers
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static extractWords(text: string): string[] {
    return text
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => word.trim());
  }

  private static reconstructPageContent(pageWords: string[], originalContent: string, startIndex: number, allWords: string[]): string {
    // For now, create a simple formatted page content
    // In a more sophisticated version, we could preserve HTML structure better
    const pageText = pageWords.join(' ');
    
    // Look for chapter headings or special formatting in the original content
    const chapterMatch = originalContent.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi);
    let formattedContent = `<div class="book-page">${pageText}</div>`;

    // Add basic paragraph formatting
    formattedContent = formattedContent.replace(/\. ([A-Z])/g, '.</p><p>$1');
    formattedContent = formattedContent.replace(/<div class="book-page">/, '<div class="book-page"><p>');
    formattedContent = formattedContent.replace(/<\/div>$/, '</p></div>');

    return formattedContent;
  }

  static calculateReadingProgress(currentPage: number, totalPages: number): {
    percentage: number;
    pagesRead: number;
    pagesRemaining: number;
  } {
    const pagesRead = Math.max(0, currentPage - 1);
    const percentage = totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0;
    
    return {
      percentage,
      pagesRead,
      pagesRemaining: Math.max(0, totalPages - currentPage)
    };
  }

  static estimateReadingTime(wordsRemaining: number, wordsPerMinute: number = 200): {
    minutes: number;
    hours: number;
    formattedTime: string;
  } {
    const totalMinutes = Math.ceil(wordsRemaining / wordsPerMinute);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    let formattedTime = '';
    if (hours > 0) {
      formattedTime = `${hours}h ${minutes}m`;
    } else {
      formattedTime = `${minutes}m`;
    }

    return {
      minutes: totalMinutes,
      hours,
      formattedTime
    };
  }
}
