import React from 'react';
import { BookCard } from './BookCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star, TrendingUp, Clock, Heart, Play, Info } from 'lucide-react';
import { BookModal } from '@/components/book/BookModal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Book {
  id: string;
  title: string;
  author_name: string;
  author_id: string;
  description?: string;
  cover_image_url?: string;
  price_cents?: number;
  rating_average?: number;
  rating_count?: number;
  view_count?: number;
  download_count?: number;
  created_at?: string;
  book_categories?: Array<{ category_id: string; categories: { name: string; slug: string } }>;
  book_genres?: Array<{ genre_id: string; genres: { name: string; slug: string } }>;
}

interface VirtualizedBookGridProps {
  books: Book[];
  loading?: boolean;
}

interface BookCarouselProps {
  title: string;
  books: Book[];
  icon?: React.ReactNode;
}

function BookCarousel({ title, books, icon }: BookCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBook(null);
  };

  if (books.length === 0) return null;

  return (
    <>
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('left')}
              className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll('right')}
              className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {books.map((book) => (
            <div key={book.id} className="flex-none w-72">
              <NetflixBookCard book={book} onClick={() => handleBookClick(book)} />
            </div>
          ))}
        </div>
      </div>

      {selectedBook && (
        <BookModal
          isOpen={showModal}
          onClose={handleCloseModal}
          book={selectedBook}
          onRead={() => {
            if (selectedBook) {
              navigate(`/book/${selectedBook.id}`);
            }
            handleCloseModal();
          }}
        />
      )}
    </>
  );
}

function NetflixBookCard({ book, onClick }: { book: Book; onClick: () => void }) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10 rounded-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Book Cover */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-lg">
        <img
          src={book.cover_image_url || '/placeholder.svg'}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Simple bottom overlay with just title and author */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
          <h3 className="font-bold text-white text-sm mb-1 line-clamp-2 leading-tight">
            {book.title}
          </h3>
          <p className="text-gray-300 text-xs font-medium">
            by {book.author_name}
          </p>
        </div>

        {/* Top corner badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
          <div className="flex gap-1">
            {book.price_cents === 0 && (
              <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                Free
              </div>
            )}
            {book.book_categories?.length && (
              <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                {book.book_categories[0].categories.name}
              </div>
            )}
          </div>
        </div>

        {/* Hover overlay with actions */}
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="flex gap-3">
            <Button size="sm" className="bg-white text-black hover:bg-gray-200 font-semibold">
              <Play className="w-4 h-4 mr-2" />
              Read
            </Button>
            <Button size="sm" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold">
              <Info className="w-4 h-4 mr-2" />
              Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturedBook({ book, onClick }: { book: Book; onClick: () => void }) {
  return (
    <div className="relative mb-12 rounded-2xl overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-red-800 min-h-[500px]">
      <div className="absolute inset-0 bg-black/40" />
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: `url(${book.cover_image_url || '/placeholder.svg'})`
        }}
      />
      
      <div className="relative z-10 p-8 md:p-12 lg:p-16 flex items-center min-h-[500px]">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Featured
            </div>
            {book.rating_average && (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-white text-sm font-medium">{book.rating_average.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
            {book.title}
          </h1>
          
          <p className="text-xl text-gray-200 mb-2">by {book.author_name}</p>
          
          {book.description && (
            <p className="text-lg text-gray-300 mb-8 max-w-2xl line-clamp-3">
              {book.description}
            </p>
          )}
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={onClick}
              className="bg-white text-black hover:bg-gray-200 font-semibold px-8 py-3 text-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Read Now
            </Button>
            <Button 
              onClick={onClick}
              variant="outline" 
              className="border-white text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg"
            >
              <Info className="w-5 h-5 mr-2" />
              More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VirtualizedBookGrid({ books, loading }: VirtualizedBookGridProps) {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleBookClick = (book: Book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBook(null);
  };

  if (loading) {
    return (
      <div className="space-y-12">
        {/* Featured skeleton */}
        <div className="h-[500px] bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
        
        {/* Carousel skeletons */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="flex-none w-72 aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No books found. Be the first to publish a book!</p>
      </div>
    );
  }

  // Sort and categorize books
  const featuredBook = books.find(book => book.rating_average && book.rating_average > 4.5) || books[0];
  const trendingBooks = books
    .filter(book => book.view_count && book.view_count > 100)
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 10);
  
  const topRatedBooks = books
    .filter(book => book.rating_average && book.rating_average > 4.0)
    .sort((a, b) => (b.rating_average || 0) - (a.rating_average || 0))
    .slice(0, 10);
  
  const recentBooks = books
    .filter(book => book.created_at)
    .sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
    .slice(0, 10);
  
  const freeBooks = books
    .filter(book => book.price_cents === 0)
    .slice(0, 10);

  return (
    <>
      <div className="space-y-8">
        {/* Featured Book Hero */}
        <FeaturedBook book={featuredBook} onClick={() => handleBookClick(featuredBook)} />
        
        {/* Book Carousels */}
        {trendingBooks.length > 0 && (
          <BookCarousel
            title="Trending Now"
            books={trendingBooks}
            icon={<TrendingUp className="w-6 h-6 text-red-500" />}
          />
        )}
        
        {topRatedBooks.length > 0 && (
          <BookCarousel
            title="Top Rated"
            books={topRatedBooks}
            icon={<Star className="w-6 h-6 text-yellow-500" />}
          />
        )}
        
        {recentBooks.length > 0 && (
          <BookCarousel
            title="New Releases"
            books={recentBooks}
            icon={<Clock className="w-6 h-6 text-blue-500" />}
          />
        )}
        
        {freeBooks.length > 0 && (
          <BookCarousel
            title="Free to Read"
            books={freeBooks}
            icon={<Heart className="w-6 h-6 text-green-500" />}
          />
        )}
        
        {/* All Books Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Books</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {books.map((book) => (
              <div key={book.id} onClick={() => handleBookClick(book)}>
                <BookCard book={book} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shared Modal */}
      {selectedBook && (
        <BookModal
          isOpen={showModal}
          onClose={handleCloseModal}
          book={selectedBook}
          onRead={() => {
            if (selectedBook) {
              navigate(`/book/${selectedBook.id}`);
            }
            handleCloseModal();
          }}
        />
      )}
    </>
  );
}