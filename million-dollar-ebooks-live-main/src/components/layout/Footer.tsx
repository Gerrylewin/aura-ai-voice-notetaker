
import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="py-8">
      <div className="container mx-auto px-6 text-center">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-gray-400">
          <Link 
            to="/privacy" 
            className="hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            Privacy Policy
          </Link>
          <span className="hidden sm:inline text-gray-600">•</span>
          <Link 
            to="/terms" 
            className="hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            Terms of Service
          </Link>
          <span className="hidden sm:inline text-gray-600">•</span>
          <Link 
            to="/support" 
            className="hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            Support
          </Link>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          © 2024 Million Dollar eBooks. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
