
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BookContent {
  id?: string;
  bookId: string;
  fullContent: string;
  previewContent?: string;
  chapterData?: any[];
  wordCount?: number;
  contentType?: 'html' | 'markdown' | 'plain';
}

interface CreateBookWithContentParams {
  title: string;
  description?: string;
  authorName: string;
  content: string;
  chapters?: any[];
  tags?: string[];
  coverImageUrl?: string;
  importJobId?: string;
}

export function useContentStorage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createBookWithContent = async (params: CreateBookWithContentParams) => {
    setIsLoading(true);
    
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('User not authenticated');

      // Calculate word count
      const wordCount = countWords(params.content);
      
      // Generate preview content (first 500 words)
      const previewContent = generatePreview(params.content, 500);

      // Create the book record first
      const { data: book, error: bookError } = await supabase
        .from('books')
        .insert({
          title: params.title,
          description: params.description || '',
          author_name: params.authorName,
          author_id: user.data.user.id,
          word_count: wordCount,
          tags: params.tags || [],
          cover_image_url: params.coverImageUrl,
          book_status: 'draft'
        })
        .select()
        .single();

      if (bookError) throw bookError;

      // Create the book content record
      const { data: content, error: contentError } = await supabase
        .from('book_content')
        .insert({
          book_id: book.id,
          full_content: params.content,
          preview_content: previewContent,
          chapter_data: params.chapters || [],
          word_count: wordCount,
          content_type: 'html'
        })
        .select()
        .single();

      if (contentError) throw contentError;

      // Update import job if provided
      if (params.importJobId) {
        await supabase
          .from('import_jobs')
          .update({ book_id: book.id })
          .eq('id', params.importJobId);
      }

      toast({
        title: "Book Created Successfully",
        description: `"${params.title}" has been created with ${wordCount} words`,
      });

      return { book, content };

    } catch (error) {
      console.error('Error creating book with content:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create book",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookContent = async (bookId: string, newContent: string, chapters?: any[]) => {
    setIsLoading(true);
    
    try {
      const wordCount = countWords(newContent);
      const previewContent = generatePreview(newContent, 500);

      const { data, error } = await supabase
        .from('book_content')
        .update({
          full_content: newContent,
          preview_content: previewContent,
          chapter_data: chapters || [],
          word_count: wordCount,
          updated_at: new Date().toISOString()
        })
        .eq('book_id', bookId)
        .select()
        .single();

      if (error) throw error;

      // Also update word count in books table
      await supabase
        .from('books')
        .update({ word_count: wordCount })
        .eq('id', bookId);

      toast({
        title: "Content Updated",
        description: `Book content updated with ${wordCount} words`,
      });

      return data;

    } catch (error) {
      console.error('Error updating book content:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update content",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getBookContent = async (bookId: string) => {
    try {
      const { data, error } = await supabase
        .from('book_content')
        .select('*')
        .eq('book_id', bookId)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error fetching book content:', error);
      return null;
    }
  };

  const getBookPreview = async (bookId: string) => {
    try {
      const { data, error } = await supabase
        .from('book_content')
        .select('preview_content, word_count, chapter_data')
        .eq('book_id', bookId)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error fetching book preview:', error);
      return null;
    }
  };

  const countWords = (text: string): number => {
    // Strip HTML tags and count words
    const plainText = text.replace(/<[^>]*>/g, ' ');
    const words = plainText.trim().split(/\s+/);
    return words.filter(word => word.length > 0).length;
  };

  const generatePreview = (content: string, maxWords: number): string => {
    // Strip HTML tags
    const plainText = content.replace(/<[^>]*>/g, ' ');
    const words = plainText.trim().split(/\s+/);
    
    if (words.length <= maxWords) {
      return content;
    }
    
    // Find the cut-off point in the original HTML
    let wordCount = 0;
    let position = 0;
    
    for (let i = 0; i < content.length; i++) {
      if (content[i] === '<') {
        // Skip HTML tags
        while (i < content.length && content[i] !== '>') {
          i++;
        }
      } else if (/\s/.test(content[i])) {
        wordCount++;
        if (wordCount >= maxWords) {
          position = i;
          break;
        }
      }
    }
    
    return content.substring(0, position) + '...';
  };

  return {
    createBookWithContent,
    updateBookContent,
    getBookContent,
    getBookPreview,
    isLoading
  };
}
