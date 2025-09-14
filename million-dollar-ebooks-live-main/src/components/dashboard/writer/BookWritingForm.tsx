import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { BookMetadataForm } from './form/BookMetadataForm';
import { BookContentEditor } from './form/BookContentEditor';
import { BookCoverUpload } from './form/BookCoverUpload';
import { BookPricingAndTags } from './form/BookPricingAndTags';
import { BookFormActions } from './form/BookFormActions';
import { BookPreview } from './form/BookPreview';
import { ContentImport } from './ContentImport';

interface BookData {
  title: string;
  description: string;
  content: string;
  price_cents: number;
  tags: string[];
  cover_image_url?: string;
  series_name?: string;
  series_price_cents?: number;
  category_id?: string;
  genre_id?: string;
  is_part_of_series?: boolean;
  is_last_in_series?: boolean;
}

interface BookWritingFormProps {
  editingBook?: any;
  onEditComplete?: () => void;
}

export function BookWritingForm({ editingBook, onEditComplete }: BookWritingFormProps) {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { createBookUpdateNotification } = useAdminNotifications();
  
  const [bookData, setBookData] = useState<BookData>({
    title: '',
    description: '',
    content: '',
    price_cents: 50, // Default to $0.50
    tags: [],
    is_part_of_series: false,
    is_last_in_series: false,
  });
  
  const [activeTab, setActiveTab] = useState('metadata');
  const [isLoading, setIsLoading] = useState(false);
  const [showImport, setShowImport] = useState(false);

  useEffect(() => {
    if (editingBook) {
      console.log('BookWritingForm: Loading editing book:', editingBook);
      setBookData({
        title: editingBook.title || '',
        description: editingBook.description || '',
        content: editingBook.preview_text || '',
        price_cents: editingBook.price_cents || 50,
        tags: editingBook.tags || [],
        cover_image_url: editingBook.cover_image_url,
        series_name: editingBook.series_name,
        series_price_cents: editingBook.series_price_cents,
        category_id: editingBook.category_id,
        genre_id: editingBook.genre_id,
        is_part_of_series: !!editingBook.series_name,
        is_last_in_series: false,
      });
    }
  }, [editingBook]);

  const updateBookData = (field: keyof BookData, value: any) => {
    setBookData(prev => ({ ...prev, [field]: value }));
  };

  const handleImport = (title: string, content: string) => {
    setBookData(prev => ({
      ...prev,
      title: title || prev.title,
      content: content
    }));
    setShowImport(false);
    toast({
      title: 'Content Imported',
      description: 'Your content has been imported successfully.',
    });
  };

  const handleCoverUpload = (imageUrl: string) => {
    updateBookData('cover_image_url', imageUrl);
  };

  const handleCoverRemove = () => {
    updateBookData('cover_image_url', undefined);
  };

  const calculateWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSave = async (isDraft = true) => {
    if (!user?.id || !profile) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save a book.',
        variant: 'destructive',
      });
      return;
    }

    if (!bookData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a book title.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const wordCount = calculateWordCount(bookData.content);
      
      const isAdminOrModerator = profile.user_role === 'admin' || profile.user_role === 'moderator';
      
      // Determine book status based on editing state and user role
      let bookStatus: 'draft' | 'published' | 'archived' = 'draft';
      
      if (!isDraft) {
        if (editingBook?.id && editingBook.book_status === 'published') {
          // For published book updates, set to draft for admin review unless user is admin/moderator
          bookStatus = isAdminOrModerator ? 'published' : 'draft';
        } else {
          // For new books or draft books
          bookStatus = isAdminOrModerator ? 'published' : 'draft';
        }
      }
      
      const bookDataToSave = {
        title: bookData.title,
        description: bookData.description,
        preview_text: bookData.content,
        price_cents: bookData.price_cents,
        tags: bookData.tags,
        cover_image_url: bookData.cover_image_url,
        series_name: bookData.is_part_of_series ? bookData.series_name : null,
        series_price_cents: bookData.is_part_of_series && bookData.is_last_in_series ? bookData.series_price_cents : null,
        author_id: user.id,
        author_name: profile.display_name || profile.username || 'Unknown Author',
        book_status: bookStatus,
        word_count: wordCount,
        page_count: Math.ceil(wordCount / 250),
        publication_date: bookStatus === 'published' ? new Date().toISOString().split('T')[0] : null,
      };

      console.log('📚 Saving book with status:', bookStatus, 'Is editing:', !!editingBook?.id);

      let result;
      if (editingBook?.id) {
        result = await supabase
          .from('books')
          .update(bookDataToSave)
          .eq('id', editingBook.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('books')
          .insert(bookDataToSave)
          .select()
          .single();
      }

      if (result.error) {
        console.error('❌ Error saving book:', result.error);
        throw result.error;
      }

      // Handle category and genre associations
      const bookId = result.data.id;

      if (bookData.category_id) {
        await supabase
          .from('book_categories')
          .delete()
          .eq('book_id', bookId);
        
        await supabase
          .from('book_categories')
          .insert({
            book_id: bookId,
            category_id: bookData.category_id,
          });
      }

      if (bookData.genre_id) {
        await supabase
          .from('book_genres')
          .delete()
          .eq('book_id', bookId);
        
        await supabase
          .from('book_genres')
          .insert({
            book_id: bookId,
            genre_id: bookData.genre_id,
          });
      }

      // Notify admins for published book updates (if user is not admin/moderator)
      if (editingBook?.id && editingBook.book_status === 'published' && !isAdminOrModerator && !isDraft) {
        console.log('📢 Notifying admins of book update for review');
        try {
          createBookUpdateNotification(
            bookId,
            bookData.title,
            profile.display_name || profile.username || 'Unknown Author',
            user.id
          );
        } catch (notificationError) {
          console.error('⚠️ Failed to send admin notification:', notificationError);
          // Don't fail the whole operation for notification errors
        }
      }

      // Update user role if needed
      if (profile.user_role === 'reader') {
        const { error: roleUpdateError } = await supabase
          .from('profiles')
          .update({ user_role: 'writer' })
          .eq('id', user.id);

        if (roleUpdateError) {
          console.error('Error updating author role:', roleUpdateError);
        }
      }

      // Generate success message
      let successMessage = '';
      if (editingBook?.id) {
        if (editingBook.book_status === 'published' && !isAdminOrModerator && !isDraft) {
          successMessage = `Book "${bookData.title}" updates have been submitted for review and will be live after approval.`;
        } else {
          successMessage = `Book "${bookData.title}" has been updated successfully.`;
        }
      } else if (isAdminOrModerator && !isDraft) {
        successMessage = `Book "${bookData.title}" has been published successfully.`;
      } else if (isDraft) {
        successMessage = `Book "${bookData.title}" has been saved as draft.`;
      } else {
        successMessage = `Book "${bookData.title}" has been submitted for review and will be published once approved.`;
      }

      toast({
        title: 'Success',
        description: successMessage,
      });

      if (onEditComplete) {
        onEditComplete();
      } else {
        setBookData({
          title: '',
          description: '',
          content: '',
          price_cents: 50,
          tags: [],
          is_part_of_series: false,
          is_last_in_series: false,
        });
        setActiveTab('metadata');
      }

    } catch (error) {
      console.error('❌ Error saving book:', error);
      toast({
        title: 'Error',
        description: `Failed to save book: ${error.message}. Please try again.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showImport) {
    return (
      <ContentImport
        onImport={handleImport}
        onCancel={() => setShowImport(false)}
      />
    );
  }

  const isAdminOrModerator = profile?.user_role === 'admin' || profile?.user_role === 'moderator';

  return (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            {editingBook ? 'Edit Book' : 'Create New Book'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-6 bg-gray-100 dark:bg-gray-800">
              <TabsTrigger value="metadata" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Details
              </TabsTrigger>
              <TabsTrigger value="content" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Content
              </TabsTrigger>
              <TabsTrigger value="cover" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Cover
              </TabsTrigger>
              <TabsTrigger value="pricing" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Pricing
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Preview
              </TabsTrigger>
              <TabsTrigger value="actions" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Publish
              </TabsTrigger>
            </TabsList>

            <TabsContent value="metadata">
              <BookMetadataForm
                title={bookData.title}
                description={bookData.description}
                seriesName={bookData.series_name}
                selectedCategory={bookData.category_id}
                selectedGenre={bookData.genre_id}
                isPartOfSeries={bookData.is_part_of_series}
                onTitleChange={(title) => updateBookData('title', title)}
                onDescriptionChange={(description) => updateBookData('description', description)}
                onSeriesNameChange={(seriesName) => updateBookData('series_name', seriesName)}
                onCategoryChange={(categoryId) => updateBookData('category_id', categoryId)}
                onGenreChange={(genreId) => updateBookData('genre_id', genreId)}
                onIsPartOfSeriesChange={(isPartOfSeries) => updateBookData('is_part_of_series', isPartOfSeries)}
                onShowImport={() => setShowImport(true)}
              />
            </TabsContent>

            <TabsContent value="content">
              <BookContentEditor
                content={bookData.content}
                onChange={(content) => updateBookData('content', content)}
              />
            </TabsContent>

            <TabsContent value="cover">
              <BookCoverUpload
                bookId={editingBook?.id}
                currentCover={bookData.cover_image_url}
                onCoverChange={handleCoverUpload}
              />
            </TabsContent>

            <TabsContent value="pricing">
              <BookPricingAndTags
                priceCents={bookData.price_cents}
                tags={bookData.tags}
                seriesPriceCents={bookData.series_price_cents}
                isPartOfSeries={bookData.is_part_of_series}
                isLastInSeries={bookData.is_last_in_series}
                onPriceChange={(price) => updateBookData('price_cents', price)}
                onTagsChange={(tags) => updateBookData('tags', tags)}
                onSeriesPriceChange={(price) => updateBookData('series_price_cents', price)}
                onIsLastInSeriesChange={(isLast) => updateBookData('is_last_in_series', isLast)}
              />
            </TabsContent>

            <TabsContent value="preview">
              <BookPreview
                title={bookData.title}
                description={bookData.description}
                content={bookData.content}
                coverImageUrl={bookData.cover_image_url}
                priceCents={bookData.price_cents}
                tags={bookData.tags}
              />
            </TabsContent>

            <TabsContent value="actions">
              <BookFormActions
                onSaveDraft={() => handleSave(true)}
                onPublish={() => handleSave(false)}
                isLoading={isLoading}
                isEditing={!!editingBook}
                bookTitle={bookData.title || 'Untitled Book'}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
