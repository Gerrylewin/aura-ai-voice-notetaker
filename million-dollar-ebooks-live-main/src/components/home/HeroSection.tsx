
import React from 'react';
import { Button } from '@/components/ui/button';
import { Book, Zap, Globe, Shield, Sparkles } from 'lucide-react';
import { ProductHuntBadge } from './ProductHuntBadge';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  featuredBooks: any[];
  currentSlide: number;
  user: any;
  onGetStarted: (userType: 'reader' | 'writer') => void;
}

export const HeroSection = ({
  featuredBooks,
  currentSlide,
  user,
  onGetStarted
}: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12 pb-16 sm:pb-24 bg-black">
        {/* Background Books with enhanced crypto-themed overlay */}
        <div className="absolute inset-0 overflow-hidden">
          {featuredBooks.slice(0, 5).map((book, index) => (
            <div
              key={book.id}
              className={`absolute transition-all duration-1000 ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-20 scale-95'
              }`}
              style={{
                left: `${10 + index * 20}%`,
                top: `${5 + index % 2 * 15}%`,
                transform: `rotate(${-10 + index * 5}deg)`
              }}
            >
              <img 
                src={book.cover} 
                alt={book.title} 
                className="w-20 h-32 sm:w-24 sm:h-36 md:w-32 md:h-48 object-cover rounded-lg shadow-2xl" 
              />
            </div>
          ))}
        </div>

        {/* Enhanced Gradient Overlay with crypto elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent">
          {/* Floating geometric shapes for crypto aesthetic */}
          <div className="absolute top-1/4 left-10 w-16 h-16 border border-blue-500/30 rounded-lg rotate-45 animate-pulse"></div>
          <div className="absolute bottom-1/3 right-20 w-8 h-8 border border-green-500/30 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/4 w-12 h-12 border border-purple-500/30 rounded-lg rotate-12 animate-pulse"></div>
        </div>
        
        {/* Revolutionary Hero Content */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
          {/* Product Hunt Badge */}
          <ProductHuntBadge />
          
          <div className="mb-12 sm:mb-16">
            <Book className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 mx-auto mb-6 sm:mb-8 text-red-600" />
            
            {/* Revolutionary Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent leading-tight">
              The World's First
            </h1>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight text-white">
              Decentralized Publishing
            </h2>
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 sm:mb-10 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent leading-tight">
              Platform
            </h3>
          </div>
          
          {/* Crypto-First Value Proposition */}
          <p className="text-xl sm:text-2xl md:text-3xl mb-8 sm:mb-10 text-gray-300 max-w-4xl mx-auto leading-relaxed font-light">
            Where Creators Earn <span className="text-green-400 font-bold">90% in USDC</span> & Readers Access Global Literature
          </p>
          
          {/* Technology Badge */}
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8 sm:mb-12">
            <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 px-4 py-2 rounded-full">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-medium">Powered by Thirdweb</span>
            </div>
            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/30 px-4 py-2 rounded-full">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-medium">USDC Payments</span>
            </div>
            <div className="flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 px-4 py-2 rounded-full">
              <Globe className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-medium">Instant Payouts</span>
            </div>
          </div>
          
          {/* Enhanced Description */}
          <p className="text-lg sm:text-xl mb-12 sm:mb-16 text-gray-400 max-w-4xl mx-auto leading-relaxed px-4">
            The revolutionary blockchain-powered platform where authors keep 90% of earnings in USDC, 
            payments arrive in under 2 minutes, and readers discover incredible stories from anywhere in the world. 
            No banks, no borders, no delays.
          </p>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col items-center gap-6 px-4">
            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => onGetStarted('reader')} 
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-12 sm:px-16 py-4 sm:py-5 text-xl sm:text-2xl font-semibold rounded-lg transform hover:scale-105 transition-all duration-300 shadow-2xl border border-red-500/50"
              >
                Start Reading
                <Book className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => onGetStarted('writer')} 
                className="w-full sm:w-auto border-2 border-green-400 px-12 sm:px-16 py-4 sm:py-5 text-xl sm:text-2xl font-semibold rounded-lg transform hover:scale-105 transition-all duration-300 text-green-400 bg-transparent hover:bg-green-400 hover:text-black"
              >
                Earn 90% in USDC
                <Zap className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Animated Learn More Button */}
            <div className="glow-button">
              <div 
                className="glow-button-inner cursor-pointer"
                onClick={() => navigate('/crypto-publishing')}
              >
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white font-semibold text-lg">Learn More</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};
