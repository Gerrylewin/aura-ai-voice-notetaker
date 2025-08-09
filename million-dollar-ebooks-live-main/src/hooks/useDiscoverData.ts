
import { useBooks, useBooksByCategory, useBooksByGenre } from '@/hooks/useBooks';
import { useAuthors } from '@/hooks/useAuthors';
import { useStories } from '@/hooks/useStories';

export function useDiscoverData(selectedCategory?: string, selectedGenre?: string) {
  // Book queries
  const { data: allBooks, isLoading: loadingAll } = useBooks();
  const { data: categoryBooks, isLoading: loadingCategory } = useBooksByCategory(selectedCategory);
  const { data: genreBooks, isLoading: loadingGenre } = useBooksByGenre(selectedGenre);

  // Author queries
  const { data: authors, isLoading: loadingAuthors } = useAuthors();

  // Stories queries
  const { stories, loading: loadingStories } = useStories();

  // Determine which books to use based on filters
  let books = allBooks || [];
  let isLoadingBooks = loadingAll;

  if (selectedCategory && categoryBooks) {
    books = categoryBooks;
    isLoadingBooks = loadingCategory;
  } else if (selectedGenre && genreBooks) {
    books = genreBooks;
    isLoadingBooks = loadingGenre;
  }

  return {
    books,
    authors: authors || [],
    stories: stories || [],
    loading: {
      books: isLoadingBooks,
      authors: loadingAuthors,
      stories: loadingStories
    }
  };
}
