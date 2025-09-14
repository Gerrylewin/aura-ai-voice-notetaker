
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Info, Star, DollarSign } from 'lucide-react';

interface BookCarouselsSectionProps {
  genres: any[];
  onBookClick: (book: any) => void;
}

export const BookCarouselsSection = ({ genres, onBookClick }: BookCarouselsSectionProps) => {
  const cleanGenreName = (name: string) => {
    return name.replace(/\s*-\s*\$[\d.]+/g, '').trim();
  };

  return (
    <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl space-y-12">
        {genres.map((genre, genreIndex) => 
          <GenreCarousel 
            key={genre.name} 
            genre={genre} 
            cleanGenreName={cleanGenreName}
            onBookClick={onBookClick}
          />
        )}
      </div>
    </div>
  );
};

interface GenreCarouselProps {
  genre: any;
  cleanGenreName: (name: string) => string;
  onBookClick: (book: any) => void;
}

const GenreCarousel = ({ genre, cleanGenreName, onBookClick }: GenreCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons);
      return () => scrollElement.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = window.innerWidth < 768 ? 280 : 320;
      const targetScroll = direction === 'left' 
        ? scrollRef.current.scrollLeft - scrollAmount
        : scrollRef.current.scrollLeft + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative group">
      {/* Genre Header */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
          <h3 className="text-2xl md:text-3xl font-bold text-white">
            {cleanGenreName(genre.name)}
          </h3>
        </div>
        <p className="text-gray-400 text-sm md:text-base ml-4">
          Discover amazing {cleanGenreName(genre.name).toLowerCase()} stories
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Desktop Navigation Buttons */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/80 backdrop-blur-sm border-gray-700 text-white hover:bg-black/90 transition-all duration-300 ${
            canScrollLeft ? 'opacity-100' : 'opacity-30'
          } hidden md:flex`}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-black/80 backdrop-blur-sm border-gray-700 text-white hover:bg-black/90 transition-all duration-300 ${
            canScrollRight ? 'opacity-100' : 'opacity-30'
          } hidden md:flex`}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Books Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-4 px-2 md:px-12"
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            scrollSnapType: 'x mandatory'
          }}
        >
          {genre.books.map((book: any, index: number) => (
            <CryptoBookCard 
              key={`${book.id}-${index}`}
              book={book}
              onClick={() => onBookClick(book)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

interface CryptoBookCardProps {
  book: any;
  onClick: () => void;
}

const CryptoBookCard = ({ book, onClick }: CryptoBookCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex-none w-[240px] md:w-[280px] group cursor-pointer"
      style={{ scrollSnapAlign: 'start' }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700/50 transition-all duration-500 hover:scale-[1.02] hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20">
        {/* Book Cover Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img 
            src={book.cover} 
            alt={book.title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60"></div>
          <div className={`absolute inset-0 bg-gradient-to-t from-purple-900/40 via-transparent to-blue-900/20 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}></div>
          
          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm border transition-all duration-300 ${
              book.price === 'Free' 
                ? 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-lg shadow-emerald-500/25' 
                : 'bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-white border-yellow-400/50 shadow-lg shadow-yellow-500/25'
            }`}>
              {book.price === 'Free' ? (
                'FREE'
              ) : (
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {book.price.replace('$', '')}
                </span>
              )}
            </div>
          </div>

          {/* Cryptocurrency Theme Element */}
          <div className="absolute top-3 left-3">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse shadow-lg shadow-purple-400/50"></div>
          </div>

          {/* Hover Actions */}
          <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-all duration-300 ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}>
            <Button 
              size="sm" 
              className="bg-white/95 text-black hover:bg-white font-semibold px-4 py-2 rounded-full backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Play className="w-4 h-4 mr-2" />
              Read
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="border-white/80 text-white hover:bg-white/10 font-semibold px-4 py-2 rounded-full backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Info className="w-4 h-4 mr-2" />
              Info
            </Button>
          </div>
        </div>

        {/* Book Info Section */}
        <div className="p-4 space-y-3">
          <div>
            <h4 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-1">
              {book.title}
            </h4>
            <p className="text-gray-300 text-sm font-medium">
              by {book.author}
            </p>
          </div>

          {/* Rating & Stats */}
          {book.rating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-yellow-400 text-sm font-medium">{book.rating}</span>
              </div>
              {book.reviews && (
                <span className="text-gray-400 text-xs">({book.reviews} reviews)</span>
              )}
            </div>
          )}

          {/* Crypto-themed bottom bar */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-700/50">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-gray-400 text-xs">Available Now</span>
            </div>
            <div className="text-purple-400 text-xs font-medium">
              Crypto Publishing
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
