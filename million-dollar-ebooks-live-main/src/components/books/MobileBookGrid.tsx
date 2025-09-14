import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  Heart, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author_name: string;
  cover_image_url?: string;
  price_cents: number;
  rating_average?: number;
  rating_count?: number;
  description?: string;
  tags?: string[];
}

interface MobileBookGridProps {
  books: Book[];
  title?: string;
  showViewAll?: boolean;
  onBookClick?: (book: Book) => void;
  onViewAll?: () => void;
  className?: string;
}

export function MobileBookGrid({ 
  books, 
  title, 
  showViewAll = false, 
  onBookClick, 
  onViewAll,
  className = ''
}: MobileBookGridProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkScrollButtons = () => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowScrollButtons(scrollWidth > clientWidth);
      }
    };

    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [books]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      const newPosition = direction === 'left' 
        ? scrollPosition - scrollAmount 
        : scrollPosition + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  const handleBookClick = (book: Book) => {
    if (onBookClick) {
      onBookClick(book);
    } else {
      // Default behavior - navigate to book
      window.location.href = `/read/${book.id}`;
    }
  };

  const formatPrice = (cents: number) => {
    if (cents === 0) return 'Free';
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (!books || books.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        {title && (
          <div className="flex items-center justify-between px-4">
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        )}
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No books available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {(title || showViewAll) && (
        <div className="flex items-center justify-between px-4">
          {title && (
            <h2 className="text-lg font-semibold">{title}</h2>
          )}
          {showViewAll && onViewAll && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewAll}
              className="text-primary hover:text-primary/80"
            >
              View All
            </Button>
          )}
        </div>
      )}

      {/* Scroll Container */}
      <div className="relative">
        {/* Scroll Buttons */}
        {showScrollButtons && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </>
        )}

        {/* Books Grid */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.map((book) => (
            <Card
              key={book.id}
              className="group cursor-pointer bg-card border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 flex-shrink-0 w-32"
              onClick={() => handleBookClick(book)}
            >
              <CardContent className="p-0">
                {/* Book Cover */}
                <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                  <img
                    src={book.cover_image_url || '/placeholder.svg'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  
                  {/* Price Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge 
                      variant={book.price_cents === 0 ? "secondary" : "default"} 
                      className="text-xs"
                    >
                      {formatPrice(book.price_cents)}
                    </Badge>
                  </div>

                  {/* Rating Overlay */}
                  {book.rating_average && book.rating_average > 0 && (
                    <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-secondary fill-current" />
                        <span className="text-xs font-medium">{book.rating_average.toFixed(1)}</span>
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>

                {/* Book Info */}
                <div className="p-2">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1 leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {book.author_name}
                  </p>
                  
                  {/* Tags */}
                  {book.tags && book.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {book.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                      {book.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          +{book.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mobile-specific enhancements */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Compact version for smaller spaces
export function CompactBookGrid({ books, onBookClick }: { books: Book[], onBookClick?: (book: Book) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {books.slice(0, 6).map((book) => (
        <Card
          key={book.id}
          className="group cursor-pointer bg-card border-border hover:border-primary/50 transition-all duration-300"
          onClick={() => onBookClick?.(book)}
        >
          <CardContent className="p-0">
            <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
              <img
                src={book.cover_image_url || '/placeholder.svg'}
                alt={book.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-2 right-2">
                <Badge 
                  variant={book.price_cents === 0 ? "secondary" : "default"} 
                  className="text-xs"
                >
                  {book.price_cents === 0 ? 'Free' : '$1.00'}
                </Badge>
              </div>
            </div>
            <div className="p-2">
              <h3 className="font-medium text-sm line-clamp-2 mb-1">{book.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{book.author_name}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
