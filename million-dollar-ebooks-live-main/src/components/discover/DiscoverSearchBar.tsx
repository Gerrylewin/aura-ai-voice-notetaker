
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface DiscoverSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export function DiscoverSearchBar({ 
  searchQuery, 
  setSearchQuery, 
  activeTab, 
  showFilters, 
  setShowFilters 
}: DiscoverSearchBarProps) {
  const getPlaceholder = () => {
    switch (activeTab) {
      case 'books': return "Search books by title, author, or genre...";
      case 'authors': return "Search authors by name or specialty...";
      case 'stories': return "Search stories by title, author, or content...";
      default: return "Search...";
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-4 mb-8">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={getPlaceholder()}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-12 h-12 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 rounded-lg text-lg"
            aria-label={`Search ${activeTab}`}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {activeTab === 'books' && (
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className={`h-12 px-6 ${
              showFilters 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            aria-label="Toggle filters"
          >
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </Button>
        )}
      </div>
      
      {searchQuery && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Tip:</span> Use specific keywords for better results. Try searching by genre, author name, or book title.
        </div>
      )}
    </div>
  );
}
