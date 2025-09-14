export interface EnhancedBookPage {
  pageNumber: number;
  content: string;
  htmlContent: string;
  wordCount: number;
  startIndex: number;
  endIndex: number;
  chapterTitle?: string;
  isChapterStart: boolean;
  readingTimeMinutes: number;
}

export interface EnhancedPaginationInfo {
  pages: EnhancedBookPage[];
  totalPages: number;
  totalWords: number;
  averageWordsPerPage: number;
  chapters: Array<{
    title: string;
    startPage: number;
    endPage: number;
  }>;
}

export class EnhancedBookPaginator {
  private static readonly TARGET_WORDS_PER_PAGE = 250;
  private static readonly MIN_WORDS_PER_PAGE = 180;
  private static readonly MAX_WORDS_PER_PAGE = 320;
  private static readonly WORDS_PER_MINUTE = 200;

  static paginateContent(content: string): EnhancedPaginationInfo {
    if (!content || content.trim().length === 0) {
      return this.getEmptyPagination();
    }

    // Parse HTML and extract structured content
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Extract chapters and content blocks
    const contentBlocks = this.extractContentBlocks(doc);
    const pages: EnhancedBookPage[] = [];
    const chapters: Array<{ title: string; startPage: number; endPage: number }> = [];
    
    let currentPageContent: string[] = [];
    let currentWordCount = 0;
    let pageNumber = 1;
    let currentChapter: string | undefined;
    let chapterStartPage = 1;

    for (const block of contentBlocks) {
      const blockWords = this.getWordCount(block.textContent);
      
      // Handle chapter breaks
      if (block.isChapter) {
        // Finalize current page if it has content
        if (currentPageContent.length > 0) {
          pages.push(this.createPage(
            pageNumber,
            currentPageContent.join('\n'),
            currentWordCount,
            currentChapter,
            false
          ));
          pageNumber++;
        }

        // Close previous chapter
        if (currentChapter && chapters.length > 0) {
          chapters[chapters.length - 1].endPage = pageNumber - 1;
        }

        // Start new chapter
        currentChapter = block.textContent;
        chapterStartPage = pageNumber;
        chapters.push({
          title: currentChapter,
          startPage: chapterStartPage,
          endPage: 0 // Will be set later
        });

        currentPageContent = [block.htmlContent];
        currentWordCount = blockWords;
        continue;
      }

      // Check if adding this block would exceed page limit
      if (currentWordCount + blockWords > this.MAX_WORDS_PER_PAGE && currentPageContent.length > 0) {
        // Create page and start new one
        pages.push(this.createPage(
          pageNumber,
          currentPageContent.join('\n'),
          currentWordCount,
          currentChapter,
          pageNumber === chapterStartPage
        ));
        pageNumber++;
        currentPageContent = [block.htmlContent];
        currentWordCount = blockWords;
      } else {
        // Add to current page
        currentPageContent.push(block.htmlContent);
        currentWordCount += blockWords;
      }

      // Create page if we've reached target words
      if (currentWordCount >= this.TARGET_WORDS_PER_PAGE) {
        pages.push(this.createPage(
          pageNumber,
          currentPageContent.join('\n'),
          currentWordCount,
          currentChapter,
          pageNumber === chapterStartPage
        ));
        pageNumber++;
        currentPageContent = [];
        currentWordCount = 0;
      }
    }

    // Handle remaining content
    if (currentPageContent.length > 0) {
      pages.push(this.createPage(
        pageNumber,
        currentPageContent.join('\n'),
        currentWordCount,
        currentChapter,
        pageNumber === chapterStartPage
      ));
    }

    // Close last chapter
    if (chapters.length > 0) {
      chapters[chapters.length - 1].endPage = pages.length;
    }

    const totalWords = pages.reduce((sum, page) => sum + page.wordCount, 0);

    return {
      pages,
      totalPages: pages.length,
      totalWords,
      averageWordsPerPage: Math.round(totalWords / pages.length),
      chapters
    };
  }

  private static extractContentBlocks(doc: Document): Array<{
    htmlContent: string;
    textContent: string;
    isChapter: boolean;
  }> {
    const blocks: Array<{
      htmlContent: string;
      textContent: string;
      isChapter: boolean;
    }> = [];

    // Get all meaningful content elements
    const walker = doc.createTreeWalker(
      doc.body || doc,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node: Node) => {
          const element = node as Element;
          const tagName = element.tagName?.toLowerCase();
          
          // Skip script, style, and other non-content elements
          if (['script', 'style', 'meta', 'link', 'title'].includes(tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Accept content elements
          if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article', 'blockquote'].includes(tagName)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      const element = node as Element;
      const textContent = element.textContent?.trim() || '';
      
      if (textContent.length < 10) continue; // Skip very short content
      
      const tagName = element.tagName.toLowerCase();
      const isChapter = ['h1', 'h2', 'h3'].includes(tagName);
      
      // Clean up the HTML content
      const htmlContent = this.cleanElementHtml(element);
      
      blocks.push({
        htmlContent,
        textContent,
        isChapter
      });
    }

    return blocks;
  }

  private static cleanElementHtml(element: Element): string {
    // Clone the element to avoid modifying the original
    const clone = element.cloneNode(true) as Element;
    
    // Remove problematic attributes but keep structure
    const removeAttributes = ['id', 'class', 'style', 'onclick', 'onload'];
    removeAttributes.forEach(attr => {
      clone.removeAttribute(attr);
      clone.querySelectorAll(`[${attr}]`).forEach(el => el.removeAttribute(attr));
    });
    
    // Remove empty elements
    clone.querySelectorAll('*').forEach(el => {
      if (!el.textContent?.trim() && !['img', 'br', 'hr'].includes(el.tagName.toLowerCase())) {
        el.remove();
      }
    });
    
    return clone.outerHTML;
  }

  private static createPage(
    pageNumber: number,
    htmlContent: string,
    wordCount: number,
    chapterTitle?: string,
    isChapterStart: boolean = false
  ): EnhancedBookPage {
    const textContent = this.stripHtml(htmlContent);
    const readingTimeMinutes = Math.ceil(wordCount / this.WORDS_PER_MINUTE);
    
    return {
      pageNumber,
      content: textContent,
      htmlContent: this.formatPageHtml(htmlContent),
      wordCount,
      startIndex: 0, // Will be calculated if needed
      endIndex: 0,   // Will be calculated if needed
      chapterTitle,
      isChapterStart,
      readingTimeMinutes
    };
  }

  private static formatPageHtml(content: string): string {
    // Wrap content in a proper page structure
    return `<div class="book-page-content">
      ${content}
    </div>`;
  }

  private static stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  private static getWordCount(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  private static getEmptyPagination(): EnhancedPaginationInfo {
    return {
      pages: [],
      totalPages: 0,
      totalWords: 0,
      averageWordsPerPage: 0,
      chapters: []
    };
  }

  static calculateReadingProgress(currentPage: number, totalPages: number): {
    percentage: number;
    pagesRead: number;
    pagesRemaining: number;
    estimatedTimeRemaining: number;
  } {
    const pagesRead = Math.max(0, currentPage - 1);
    const percentage = totalPages > 0 ? Math.round((pagesRead / totalPages) * 100) : 0;
    const pagesRemaining = Math.max(0, totalPages - currentPage);
    const estimatedTimeRemaining = Math.ceil((pagesRemaining * this.TARGET_WORDS_PER_PAGE) / this.WORDS_PER_MINUTE);
    
    return {
      percentage,
      pagesRead,
      pagesRemaining,
      estimatedTimeRemaining
    };
  }

  static findPageByChapter(pagination: EnhancedPaginationInfo, chapterTitle: string): number {
    const chapter = pagination.chapters.find(ch => 
      ch.title.toLowerCase().includes(chapterTitle.toLowerCase())
    );
    return chapter?.startPage || 1;
  }
}
