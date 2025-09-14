import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBooks } from '@/hooks/useBooks';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { BookPreviewModal } from '@/components/book/BookPreviewModal';
import { SEOHead } from '@/components/seo/SEOHead';
import { 
  BookOpen, 
  PenTool, 
  Sparkles, 
  TrendingUp, 
  Star,
  Users,
  Zap,
  Globe,
  ArrowRight,
  Play,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ModernHomepage = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'reader' | 'writer'>('reader');
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [showBookPreview, setShowBookPreview] = useState(false);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  
  const { user } = useAuth();
  const { forceTheme } = useTheme();
  const navigate = useNavigate();
  const { data: books, isLoading } = useBooks();

  // Force dark mode for unauthenticated users
  useEffect(() => {
    if (!user) {
      forceTheme('dark');
    } else {
      forceTheme(null);
    }
    return () => forceTheme(null);
  }, [user, forceTheme]);

  // Rotate hero books every 5 seconds
  useEffect(() => {
    if (books && books.length > 0) {
      const interval = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % Math.min(books.length, 5));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [books]);

  const handleGetStarted = (userType: 'reader' | 'writer') => {
    if (user) {
      navigate(userType === 'writer' ? '/dashboard' : '/discover');
    } else {
      setAuthModalType(userType);
      setShowAuthModal(true);
    }
  };

  const handleBookClick = (book: any) => {
    setSelectedBook(book);
    setShowBookPreview(true);
  };

  // Transform books for display
  const featuredBooks = books?.slice(0, 10).map(book => ({
    id: book.id,
    title: book.title,
    author: book.author_name,
    cover: book.cover_image_url || '/placeholder.svg',
    price: book.price_cents === 0 ? 'Free' : '$1.00',
    description: book.description || 'An amazing story waiting to be discovered...',
    rating: book.rating_average || 4.5,
    reviews: book.rating_count || 0,
    isFree: book.price_cents === 0
  })) || [];

  const heroBook = featuredBooks[currentHeroIndex];

  // Group books by categories for carousels
  const trendingBooks = featuredBooks.slice(0, 8);
  const newReleases = featuredBooks.slice(2, 10);
  const freeBooks = featuredBooks.filter(book => book.isFree).slice(0, 8);

  const seoData = {
    title: "The World's First Decentralized Publishing Platform - Million Dollar eBooks",
    description: "Revolutionary blockchain publishing where creators earn 90% in USDC with instant payouts. Discover amazing stories while supporting authors directly with crypto payments.",
    url: "https://milliondollarebooks.com",
    type: "website" as const
  };

  if (isLoading) {
    return (
      <>
        <SEOHead seo={seoData} />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-400">Loading the future of publishing...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead seo={seoData} />
      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background Book Cover */}
          {heroBook && (
            <div className="absolute inset-0">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 blur-sm"
                style={{ backgroundImage: `url(${heroBook.cover})` }}
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>
          )}

          {/* Hero Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            <div className="mb-8">
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Sparkles className="w-4 h-4 mr-2" />
                The World's First Crypto-Native Publishing Platform
              </Badge>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 font-display">
                <span className="text-gradient-primary">Million Dollar</span>
                <br />
                <span className="text-white">eBooks</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Where creators earn <span className="text-accent font-bold">90% in USDC</span> & readers access 
                global literature for just <span className="text-secondary font-bold">$1.00</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={() => handleGetStarted('reader')}
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-4 h-auto"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Start Reading
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleGetStarted('writer')}
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground text-lg px-8 py-4 h-auto"
              >
                <PenTool className="w-5 h-5 mr-2" />
                Start Writing
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">90%</div>
                <div className="text-sm text-gray-400">Creator Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">$1.00</div>
                <div className="text-sm text-gray-400">Max Book Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">180+</div>
                <div className="text-sm text-gray-400">Countries</div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronLeft className="w-6 h-6 rotate-90 text-gray-400" />
          </div>
        </section>

        {/* Featured Book Carousel */}
        {featuredBooks.length > 0 && (
          <section className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Featured Books</h2>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/discover')}
                  className="text-primary hover:text-primary/80"
                >
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {featuredBooks.slice(0, 12).map((book) => (
                  <Card
                    key={book.id}
                    className="group cursor-pointer bg-gray-900 border-gray-800 hover:border-primary/50 transition-all duration-300 hover:scale-105"
                    onClick={() => handleBookClick(book)}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        <div className="absolute top-2 right-2">
                          <Badge variant={book.isFree ? "secondary" : "default"} className="text-xs">
                            {book.price}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm line-clamp-2 mb-1">{book.title}</h3>
                        <p className="text-xs text-gray-400 line-clamp-1">{book.author}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 text-secondary fill-current" />
                          <span className="text-xs text-gray-400">{book.rating}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-gray-900/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose Million Dollar eBooks?</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                The future of publishing is here. Experience the benefits of blockchain technology 
                combined with beautiful, accessible design.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-gray-800 border-gray-700 text-center p-8">
                <CardContent>
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Instant Crypto Payments</h3>
                  <p className="text-gray-300">
                    Authors receive 90% of every sale in USDC instantly. No waiting weeks for payments.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 text-center p-8">
                <CardContent>
                  <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Globe className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Global Accessibility</h3>
                  <p className="text-gray-300">
                    Readers worldwide can access books without traditional banking barriers.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700 text-center p-8">
                <CardContent>
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="w-8 h-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">Community Driven</h3>
                  <p className="text-gray-300">
                    Connect with authors, share reviews, and be part of the publishing revolution.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Join the Revolution?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Whether you're a reader looking for amazing stories or an author ready to earn more, 
              we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => handleGetStarted('reader')}
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-4 h-auto"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Start Reading Today
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => handleGetStarted('writer')}
                className="border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground text-lg px-8 py-4 h-auto"
              >
                <PenTool className="w-5 h-5 mr-2" />
                Publish Your Story
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Modals */}
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

export default ModernHomepage;
