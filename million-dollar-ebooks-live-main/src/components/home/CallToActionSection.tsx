
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Book, Mail, Wallet, Globe, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface CallToActionSectionProps {
  onGetStarted: (userType: 'reader' | 'writer') => void;
}

export const CallToActionSection = ({ onGetStarted }: CallToActionSectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBrowseBooks = () => {
    if (user) {
      navigate('/discover');
    } else {
      onGetStarted('reader');
    }
  };

  const handlePublishBook = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      onGetStarted('writer');
    }
  };

  const handleNewsletter = () => {
    window.open('https://mail.dollarebooks.app', '_blank');
  };

  return (
    <div className="py-20 px-6 sm:px-8 lg:px-12 text-center bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto max-w-6xl">
        {/* Revolutionary Messaging */}
        <div className="mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-white leading-tight">
            Join the Publishing Revolution
          </h2>
          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed font-light">
            Be part of the first decentralized publishing platform where creators earn 90% in USDC, 
            payments are instant, and literature knows no borders.
          </p>
          
          {/* Revolutionary Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
              <Wallet className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-green-400 mb-2">Crypto-First Earnings</h3>
              <p className="text-gray-300 text-sm">90% revenue in USDC, paid instantly to your wallet</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <Globe className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-blue-400 mb-2">Global Accessibility</h3>
              <p className="text-gray-300 text-sm">Publish from anywhere, sell everywhere, no restrictions</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
              <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-purple-400 mb-2">Instant Transactions</h3>
              <p className="text-gray-300 text-sm">Blockchain-verified payments in under 2 minutes</p>
            </div>
          </div>
        </div>
        
        {/* Enhanced Call to Action Buttons */}
        <div className="flex flex-col lg:flex-row gap-6 justify-center mb-12">
          <Button 
            size="lg" 
            className="w-full lg:w-auto bg-red-600 hover:bg-red-700 text-white px-12 py-6 text-xl font-semibold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
            onClick={handleBrowseBooks}
          >
            <Search className="w-6 h-6 mr-3" />
            Discover Books
          </Button>
          <Button 
            size="lg" 
            className="w-full lg:w-auto bg-green-600 hover:bg-green-700 text-white px-12 py-6 text-xl font-semibold rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
            onClick={handlePublishBook}
          >
            <Book className="w-6 h-6 mr-3" />
            Earn 90% in USDC
          </Button>
        </div>

        {/* Newsletter with enhanced crypto messaging */}
        <div className="mb-20">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Stay Updated on the Revolution</h3>
            <p className="text-gray-300 mb-6">
              Get the latest updates on blockchain publishing, crypto payments, and platform developments
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="neon-border-animation px-10 py-4 text-lg font-semibold text-white bg-transparent hover:bg-white hover:text-gray-900 border-2 border-white"
              onClick={handleNewsletter}
            >
              <Mail className="w-5 h-5 mr-3" />
              Join Newsletter
            </Button>
          </div>
        </div>
        
        {/* Footer content with crypto emphasis */}
        <div className="pt-12 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-gray-400 mb-6">
            <Link to="/privacy" className="hover:text-white transition-colors duration-200 text-sm font-medium">
              Privacy Policy
            </Link>
            <span className="hidden sm:inline text-gray-600">•</span>
            <Link to="/terms" className="hover:text-white transition-colors duration-200 text-sm font-medium">
              Terms of Service
            </Link>
            <span className="hidden sm:inline text-gray-600">•</span>
            <Link to="/support" className="hover:text-white transition-colors duration-200 text-sm font-medium">
              Support
            </Link>
          </div>
          <div className="text-center mb-4">
            <p className="text-gray-500 text-sm mb-2">
              The World's First Decentralized Publishing Platform
            </p>
            <p className="text-gray-600 text-xs">
              © 2024 Million Dollar eBooks. Powered by blockchain technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
