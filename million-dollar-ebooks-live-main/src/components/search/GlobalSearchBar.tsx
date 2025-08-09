
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useBooks } from '@/hooks/useBooks';

const searchPlaceholders = [
  "Search for romance books...",
  "Search for biblical literature...",
  "Search for history books...",
  "Search for science fiction...",
  "Search for mystery novels...",
  "Search for self-help books..."
];

export function GlobalSearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const navigate = useNavigate();
  const { data: books = [] } = useBooks();

  // Cycle through placeholders every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to discover page with search query
      navigate(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={searchPlaceholders[placeholderIndex]}
            className="pl-10 pr-16 py-3 w-full border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
            aria-label="Search books, authors, and topics"
          />
          <Button
            type="submit"
            variant="ghost"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 px-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
