
import { useState } from 'react';
import mammoth from 'mammoth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WordParseResult {
  title: string;
  content: string;
  images: WordImage[];
  wordCount: number;
}

interface WordImage {
  blob: Blob;
  contentType: string;
  fileName: string;
}

export function useWordImport() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const parseWordDocument = async (file: File): Promise<WordParseResult> => {
    setIsLoading(true);
    
    try {
      // Create import job for progress tracking
      const { data: importJob, error: jobError } = await supabase
        .from('import_jobs')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          import_type: 'word',
          status: 'processing',
          total_steps: 5,
          current_step: 'Reading Word document...'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Step 1: Convert file to array buffer
      await updateProgress(importJob.id, 20, 'Processing document structure...');
      const arrayBuffer = await file.arrayBuffer();
      
      // Step 2: Configure mammoth with image handling
      await updateProgress(importJob.id, 40, 'Extracting images and content...');
      const images: WordImage[] = [];
      
      const options = {
        convertImage: mammoth.images.imgElement(async (image: any) => {
          // Extract image data
          const imageBuffer = await image.read();
          const blob = new Blob([imageBuffer], { type: image.contentType || 'image/png' });
          
          // Store image for later upload
          const fileName = `image_${images.length + 1}.${getExtensionFromMimeType(image.contentType)}`;
          images.push({
            blob,
            contentType: image.contentType || 'image/png',
            fileName
          });
          
          // Return a placeholder that we'll replace later
          return { src: `PLACEHOLDER_IMAGE_${images.length}` };
        })
      };
      
      // Step 3: Parse the Word document
      await updateProgress(importJob.id, 60, 'Converting to HTML...');
      const result = await mammoth.convertToHtml({ arrayBuffer }, options);
      
      // Step 4: Clean up the HTML content
      await updateProgress(importJob.id, 80, 'Cleaning up content...');
      let content = result.value;
      
      // Clean up the HTML content
      content = content
        // Remove empty paragraphs
        .replace(/<p><\/p>/g, '')
        .replace(/<p>\s*<\/p>/g, '')
        // Clean up extra whitespace
        .replace(/\s+/g, ' ')
        .trim();

      // Count words
      const wordCount = countWords(content);

      // Extract title from filename if not provided
      const title = file.name.replace(/\.(docx|doc)$/i, '');

      // Step 5: Complete
      await updateProgress(importJob.id, 100, 'Import completed!');
      await supabase.rpc('complete_import_job', { 
        job_id: importJob.id, 
        success: true 
      });

      // Log any warnings
      if (result.messages && result.messages.length > 0) {
        console.warn('Word import warnings:', result.messages);
      }

      return {
        title,
        content,
        images,
        wordCount
      };
    } catch (error) {
      console.error('Error parsing Word document:', error);
      throw new Error('Failed to parse Word document. Please ensure it\'s a valid .docx or .doc file.');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadWordImages = async (images: WordImage[], bookId: string, content: string): Promise<string> => {
    let updatedContent = content;
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      try {
        // Upload to Supabase storage
        const fileName = `${bookId}/${Date.now()}-${image.fileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('book-covers')
          .upload(fileName, image.blob, {
            contentType: image.contentType
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('book-covers')
          .getPublicUrl(fileName);

        // Replace placeholder with actual URL
        updatedContent = updatedContent.replace(
          `PLACEHOLDER_IMAGE_${i + 1}`,
          publicUrl
        );

        // Save image record to database
        await supabase
          .from('book_images')
          .insert({
            book_id: bookId,
            original_path: image.fileName,
            storage_url: publicUrl,
            mime_type: image.contentType,
            file_size_bytes: image.blob.size
          });

      } catch (error) {
        console.error('Image upload error:', error);
        // Remove the placeholder if upload failed
        updatedContent = updatedContent.replace(`src="PLACEHOLDER_IMAGE_${i + 1}"`, '');
      }
    }
    
    return updatedContent;
  };

  const updateProgress = async (jobId: string, progress: number, step: string) => {
    await supabase.rpc('update_import_progress', {
      job_id: jobId,
      new_progress: progress,
      new_step: step,
      increment_completed_steps: true
    });
  };

  const countWords = (text: string): number => {
    // Strip HTML tags and count words
    const plainText = text.replace(/<[^>]*>/g, ' ');
    const words = plainText.trim().split(/\s+/);
    return words.filter(word => word.length > 0).length;
  };

  const getExtensionFromMimeType = (mimeType: string): string => {
    const mimeToExt: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg'
    };
    
    return mimeToExt[mimeType] || 'png';
  };

  return {
    parseWordDocument,
    uploadWordImages,
    isLoading
  };
}
