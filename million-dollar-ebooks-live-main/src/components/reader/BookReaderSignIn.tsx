import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function BookReaderSignIn() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sign In Required</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Please sign in to read this book.</p>
        <Button onClick={() => navigate('/')} className="bg-red-600 hover:bg-red-700 text-white">
          Go to Home Page
        </Button>
      </div>
    </div>
  );
}
