
import React from 'react';
import { Button } from '@/components/ui/button';
import { Book, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <Book className="w-24 h-24 mx-auto mb-8 text-red-600" />
        <h1 className="text-6xl font-bold mb-4 text-gray-900 dark:text-white">404</h1>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/')}
            className="bg-red-600 hover:bg-red-700 text-white w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="border-gray-300 dark:border-white text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-white dark:hover:text-black w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
