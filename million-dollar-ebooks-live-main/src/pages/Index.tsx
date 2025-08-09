
import { HeroSection } from "@/components/home/HeroSection";
import { BookCarouselsSection } from "@/components/home/BookCarouselsSection";
import { CallToActionSection } from "@/components/home/CallToActionSection";
import { Header } from "@/components/layout/Header";
import { SEOHead } from "@/components/seo/SEOHead";
import { BookPreviewModal } from "@/components/book/BookPreviewModal";
import { useBooks } from "@/hooks/useBooks";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { featuredBooks, genres as sampleGenres } from "@/data/sampleBooks";

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'reader' | 'writer'>('reader');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showBookPreview, setShowBookPreview] = useState(false);
  const { user } = useAuth();
  const { forceTheme } = useTheme();
  const navigate = useNavigate();

  // Force dark mode on homepage for unauthenticated users
  useEffect(() => {
    if (!user) {
      forceTheme('dark');
    } else {
      forceTheme(null); // Remove forced theme for authenticated users
    }

    // Cleanup: remove forced theme when component unmounts
    return () => {
      forceTheme(null);
    };
  }, [user, forceTheme]);

  // Fetch real books from database
  const { data: realBooks, isLoading, error } = useBooks();

  console.log('📚 Homepage books data:', { 
    realBooksCount: realBooks?.length || 0, 
    sampleBooksCount: featuredBooks?.length || 0,
    isLoading, 
    error,
    realBooks: realBooks?.slice(0, 3) // Log first 3 real books for debugging
  });

  // Transform real books into the format expected by the carousel
  const transformedRealBooks = realBooks?.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author_name,
    cover: book.cover_image_url || '/placeholder.svg',
    price: book.price_cents === 0 ? 'Free' : `$${(book.price_cents / 100).toFixed(2)}`,
    content: book.description || generateSampleContent(book.title, book.author_name),
    isFree: book.price_cents === 0,
    rating: book.rating_average || 0,
    reviews: book.rating_count || 0
  })) || [];

  const allFeaturedBooks = [...featuredBooks, ...transformedRealBooks].slice(0, 15);

  console.log('🎯 Combined featured books:', { 
    total: allFeaturedBooks.length,
    sampleCount: featuredBooks.length,
    realCount: transformedRealBooks.length
  });

  const realBooksByGenre = realBooks?.reduce((acc: any[], book) => {
    if (!book.book_genres?.length) return acc;
    
    book.book_genres.forEach((bookGenre: any) => {
      const genreName = bookGenre.genres?.name;
      if (!genreName) return;
      
      let existingGenre = acc.find(g => g.name === genreName);
      if (!existingGenre) {
        existingGenre = { name: genreName, books: [] };
        acc.push(existingGenre);
      }
      
      existingGenre.books.push({
        id: book.id,
        title: book.title,
        author: book.author_name,
        cover: book.cover_image_url || '/placeholder.svg',
        price: book.price_cents === 0 ? 'Free' : `$${(book.price_cents / 100).toFixed(2)}`,
        content: book.description || generateSampleContent(book.title, book.author_name),
        isFree: book.price_cents === 0
      });
    });
    
    return acc;
  }, []) || [];

  const sampleGenresWithoutBiography = sampleGenres.filter(genre => 
    !genre.name.toLowerCase().includes('biography')
  );

  const realBiographyGenre = realBooksByGenre.find(genre => 
    genre.name.toLowerCase().includes('biography')
  );

  const combinedGenres = [
    ...sampleGenresWithoutBiography,
    ...(realBiographyGenre ? [{
      ...realBiographyGenre,
      name: `${realBiographyGenre.name} - New Releases`
    }] : [])
  ].filter(genre => genre.books && genre.books.length > 0);

  console.log('🎭 Combined genres for carousel:', combinedGenres.map(g => ({ 
    name: g.name, 
    bookCount: g.books.length 
  })));

  const handleGetStarted = (userType: 'reader' | 'writer') => {
    console.log('Get started clicked for userType:', userType);
    if (user) {
      if (userType === 'writer') {
        navigate('/onboarding?type=writer');
      } else {
        navigate('/discover');
      }
    } else {
      setAuthModalType(userType);
      setShowAuthModal(true);
    }
  };

  const handleBookClick = (book: any) => {
    console.log('Book clicked:', book);
    
    const enhancedBook = {
      ...book,
      isFree: book.price === 'Free' || book.price === '$0.00',
      content: book.content || generateSampleContent(book.title, book.author),
    };
    
    setSelectedBook(enhancedBook);
    setShowBookPreview(true);
  };

  const generateSampleContent = (title: string, author: string) => {
    return `Welcome to "${title}" by ${author}

Chapter 1: An Unexpected Beginning

The story unfolds in a world not so different from our own, yet filled with possibilities that stretch beyond the ordinary. Our journey begins here, in this moment, where every word carries weight and every sentence builds toward something greater.

As you turn each page, you'll discover characters who feel like old friends, situations that challenge your perspective, and moments that will stay with you long after you've finished reading. This is more than just a story—it's an experience waiting to be lived.

The morning light filtered through the window, casting dancing shadows across the room. It was in this quiet moment that everything began to change. What started as an ordinary day would soon become the catalyst for an extraordinary adventure.

In the distance, the sound of footsteps echoed down the hallway, each step bringing our protagonist closer to a destiny they never could have imagined. The air seemed to shimmer with anticipation, as if the very universe was holding its breath.

This is where our tale truly begins...

[Continue reading to discover what happens next in this captivating story!]`;
  };

  const seoData = {
    title: "The World's First Decentralized Publishing Platform - Crypto-First eBooks",
    description: "Revolutionary blockchain publishing where creators earn 90% in USDC with instant payouts. Discover amazing stories while supporting authors directly with crypto payments.",
    url: "https://milliondollarebooks.com",
    type: "website" as const
  };

  if (isLoading) {
    return (
      <>
        <SEOHead seo={seoData} />
        <div className="min-h-screen bg-black">
          <Header />
          <main className="pt-20 md:pt-24">
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading the future of publishing...</p>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (error) {
    console.error('❌ Error loading books on homepage:', error);
  }

  return (
    <>
      <SEOHead seo={seoData} />
      <div className="min-h-screen bg-black">
        <Header />
        <main className="pt-20 md:pt-24">
          <HeroSection 
            featuredBooks={allFeaturedBooks}
            currentSlide={currentSlide}
            user={user}
            onGetStarted={handleGetStarted}
          />
          <BookCarouselsSection 
            genres={combinedGenres}
            onBookClick={handleBookClick}
          />
          <CallToActionSection onGetStarted={handleGetStarted} />
        </main>
      </div>
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalType}
      />
      <BookPreviewModal
        book={selectedBook}
        isOpen={showBookPreview}
        onClose={() => setShowBookPreview(false)}
      />
    </>
  );
};

export default Index;
