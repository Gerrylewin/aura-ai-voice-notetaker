
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Book, Search, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Explore Free Classics</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Discover timeless literature at no cost</p>
          <Button 
            onClick={() => navigate('/discover')}
            className="bg-red-600 hover:bg-red-700 w-full text-white"
          >
            <Book className="w-4 h-4 mr-2" />
            Browse Classics
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Find New Authors</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Support indie writers for just $1</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/discover')}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
          >
            <Search className="w-4 h-4 mr-2" />
            Discover Authors
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Reading Insights</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">Track your reading habits and progress</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/analytics')}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            View Stats
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
