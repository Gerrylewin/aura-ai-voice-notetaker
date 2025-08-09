import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, Image, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { queryClient } from '@/providers/ReactQueryProvider';

interface BookCoverUploadProps {
  bookId?: string;
  currentCover?: string;
  onCoverChange: (coverUrl: string) => void;
}

export function BookCoverUpload({ bookId, currentCover, onCoverChange }: BookCoverUploadProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { createBookUpdateNotification } = useAdminNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentCover || null);
  const [isDragActive, setIsDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, GIF, or WebP)';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: 'Invalid File',
        description: validationError,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create preview URL immediately
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrl(previewUrl);

      // Generate unique filename for book-files/covers folder
      const fileExt = file.name.split('.').pop();
      const fileName = `covers/cover-${bookId || 'temp'}-${Date.now()}.${fileExt}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      // Upload to book-files bucket in covers folder
      const { error: uploadError } = await supabase.storage
        .from('book-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (uploadError) {
        console.error('❌ Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('book-files')
        .getPublicUrl(fileName);

      console.log('✅ Cover uploaded successfully:', publicUrl);

      // Update the parent component
      onCoverChange(publicUrl);

      if (bookId) {
        // Check if this is an existing published book
        const { data: bookData } = await supabase
          .from('books')
          .select('book_status, title, author_name')
          .eq('id', bookId)
          .single();

        if (bookData) {
          // If it's a published book, change status to draft for re-approval
          let shouldChangeStatus = false;
          if (bookData.book_status === 'published') {
            shouldChangeStatus = true;
            console.log('📝 Changing published book status to draft for cover re-approval');
          }

          // Update book with new cover and potentially new status
          const updateData: any = {
            cover_image_url: publicUrl,
            updated_at: new Date().toISOString()
          };

          if (shouldChangeStatus) {
            updateData.book_status = 'draft';
          }

          const { error: updateError } = await supabase
            .from('books')
            .update(updateData)
            .eq('id', bookId);

          if (updateError) {
            console.error('❌ Error updating book:', updateError);
            throw updateError;
          }

          // Create admin notification for book cover update with current timestamp
          if (profile) {
            try {
              await createBookUpdateNotification(
                bookId,
                bookData.title,
                bookData.author_name,
                profile.id
              );
              console.log('✅ Admin notification created for book cover update');
            } catch (notificationError) {
              console.error('❌ Failed to create admin notification:', notificationError);
              // Don't fail the upload for notification errors
            }
          }

          // Invalidate React Query caches for immediate UI updates
          console.log('🔄 Invalidating caches after cover upload');
          queryClient.invalidateQueries({ queryKey: ['books'] });
          queryClient.invalidateQueries({ queryKey: ['user-books'] });
          queryClient.invalidateQueries({ queryKey: ['admin-data'] });
          queryClient.invalidateQueries({ queryKey: ['user-content'] });

          if (shouldChangeStatus) {
            toast({
              title: 'Cover Updated & Submitted for Review',
              description: 'Your book cover has been updated and submitted for admin review.',
            });
          } else {
            toast({
              title: 'Success',
              description: 'Book cover uploaded successfully',
            });
          }
        }
      } else {
        toast({
          title: 'Success',
          description: 'Book cover uploaded successfully',
        });
      }

    } catch (error) {
      console.error('❌ Error uploading cover:', error);
      setPreviewUrl(currentCover || null);
      toast({
        title: 'Upload Error',
        description: error instanceof Error ? error.message : 'Failed to upload book cover',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragActive(false);
  };

  const removeCover = () => {
    setPreviewUrl(null);
    onCoverChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Book Cover
      </label>
      
      {previewUrl ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="relative group">
              <img
                src={previewUrl}
                alt="Book cover preview"
                className="w-full max-w-md mx-auto object-cover rounded-lg"
              />
              
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <div className="text-sm">Uploading... {uploadProgress}%</div>
                    <div className="w-32 bg-gray-600 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={removeCover}
                  className="h-8 w-8 p-0"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-8">
            <div className="text-center">
              <Upload className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload Book Cover
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop your cover image here, or click to browse
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  JPG, PNG, GIF, WebP
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Max 5MB
                </div>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </CardContent>
        </Card>
      )}
      
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Recommended size: 400x600px or similar 2:3 aspect ratio for best results
      </div>
    </div>
  );
}
