
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { SEOHead } from '@/components/seo/SEOHead';
import { DiscoverHeader } from '@/components/discover/DiscoverHeader';
import { DiscoverSearchBar } from '@/components/discover/DiscoverSearchBar';
import { DiscoverTabs } from '@/components/discover/DiscoverTabs';

export default function Discover() {
  const [searchParams] = useSearchParams();
  const urlSearchQuery = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedGenre, setSelectedGenre] = useState<string>();
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('books');

  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  const handleCategoryChange = (category?: string) => {
    setSelectedCategory(category);
    setSelectedGenre(undefined);
  };

  const handleGenreChange = (genre?: string) => {
    setSelectedGenre(genre);
    setSelectedCategory(undefined);
  };

  const seoData = {
    title: 'Discover Books, Stories & Authors - Million Dollar eBooks',
    description: 'Discover amazing eBooks, daily stories, and talented authors. Browse by category, genre, or search for your next great read. Support indie authors and find fresh voices.',
    keywords: ['discover books', 'ebook discovery', 'indie authors', 'book search', 'genres', 'categories', 'daily stories'],
    url: 'https://dollarebooks.app/discover',
    type: 'website' as const
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Discover Books, Stories & Authors',
    description: 'Browse and discover amazing eBooks, daily stories, and talented authors',
    url: 'https://dollarebooks.app/discover',
    mainEntity: {
      '@type': 'ItemList',
      name: 'Book, Story and Author Collection',
      description: 'A curated collection of eBooks, daily stories, and authors'
    }
  };

  return (
    <>
      <SEOHead 
        seo={seoData}
        structuredData={[structuredData]}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
        <Header />
        <div className="pt-16 sm:pt-20 lg:pt-32 pb-6 sm:pb-12">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="px-2 sm:px-0">
                <DiscoverHeader searchQuery={searchQuery} />
              </div>
              
              <div className="w-full bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2 sm:p-3 lg:p-6 overflow-hidden">
                <div className="space-y-4">
                  <DiscoverSearchBar
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeTab={activeTab}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                  />

                  <DiscoverTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchQuery={searchQuery}
                    selectedCategory={selectedCategory}
                    selectedGenre={selectedGenre}
                    onCategoryChange={handleCategoryChange}
                    onGenreChange={handleGenreChange}
                    showFilters={showFilters}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
