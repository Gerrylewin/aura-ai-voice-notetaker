
export function useDiscoverSearch(
  books: any[], 
  authors: any[], 
  stories: any[], 
  searchQuery: string, 
  activeTab: string
) {
  // Enhanced search functionality
  const performAdvancedSearch = (items: any[], query: string) => {
    if (!query.trim()) return items;
    
    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);
    
    return items.filter(item => {
      const searchableText = [
        item.title,
        item.author_name || item.display_name,
        item.description || item.bio || item.content,
        ...(item.book_categories?.map((cat: any) => cat.categories?.name) || []),
        ...(item.book_genres?.map((genre: any) => genre.genres?.name) || []),
        ...(item.profiles?.display_name ? [item.profiles.display_name] : [])
      ].join(' ').toLowerCase();
      
      return searchTerms.every(term => searchableText.includes(term));
    });
  };

  // Apply search filters based on active tab
  const filteredBooks = searchQuery && activeTab === 'books' 
    ? performAdvancedSearch(books, searchQuery) 
    : books;

  const filteredAuthors = searchQuery && activeTab === 'authors' 
    ? performAdvancedSearch(authors, searchQuery) 
    : authors;

  const filteredStories = searchQuery && activeTab === 'stories' 
    ? performAdvancedSearch(stories, searchQuery) 
    : stories;

  return {
    filteredBooks,
    filteredAuthors,
    filteredStories
  };
}
