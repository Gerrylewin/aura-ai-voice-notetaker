
import { useState } from 'react';
import JSZip from 'jszip';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EpubParseResult {
  title: string;
  content: string;
  chapters: Chapter[];
  images: EpubImage[];
}

interface Chapter {
  title: string;
  content: string;
  order: number;
}

interface EpubImage {
  originalPath: string;
  blob: Blob;
  mimeType: string;
  fileName: string;
}

export function useEpubImport() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const parseEpubFile = async (file: File): Promise<EpubParseResult> => {
    setIsLoading(true);
    
    try {
      // Create import job for progress tracking
      const { data: importJob, error: jobError } = await supabase
        .from('import_jobs')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          import_type: 'epub',
          status: 'processing',
          total_steps: 7,
          current_step: 'Reading EPUB file...'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Step 1: Read ZIP file
      await updateProgress(importJob.id, 15, 'Extracting EPUB contents...');
      const zip = await JSZip.loadAsync(file);
      
      // Step 2: Parse container.xml to find OPF file
      await updateProgress(importJob.id, 25, 'Parsing EPUB structure...');
      const containerXml = await zip.file('META-INF/container.xml')?.async('text');
      if (!containerXml) throw new Error('Invalid EPUB: Missing container.xml');
      
      const opfPath = extractOpfPath(containerXml);
      const opfContent = await zip.file(opfPath)?.async('text');
      if (!opfContent) throw new Error('Invalid EPUB: Missing OPF file');
      
      // Step 3: Parse OPF to get metadata and spine
      await updateProgress(importJob.id, 40, 'Reading book metadata...');
      const { title, spineItems, manifestItems } = parseOpf(opfContent);
      
      // Step 4: Extract and process chapters
      await updateProgress(importJob.id, 55, 'Processing chapters...');
      const chapters: Chapter[] = [];
      const basePath = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
      
      for (let i = 0; i < spineItems.length; i++) {
        const spineItem = spineItems[i];
        const manifestItem = manifestItems.find(item => item.id === spineItem.idref);
        
        if (manifestItem && manifestItem.mediaType === 'application/xhtml+xml') {
          const chapterPath = basePath + manifestItem.href;
          const chapterContent = await zip.file(chapterPath)?.async('text');
          
          if (chapterContent) {
            const cleanContent = cleanHtmlContent(chapterContent);
            const chapterTitle = extractChapterTitle(cleanContent) || `Chapter ${i + 1}`;
            
            chapters.push({
              title: chapterTitle,
              content: cleanContent,
              order: i
            });
          }
        }
      }
      
      // Step 5: Extract images
      await updateProgress(importJob.id, 70, 'Processing images...');
      const images: EpubImage[] = [];
      
      for (const manifestItem of manifestItems) {
        if (manifestItem.mediaType.startsWith('image/')) {
          const imagePath = basePath + manifestItem.href;
          const imageFile = zip.file(imagePath);
          
          if (imageFile) {
            const imageBlob = await imageFile.async('blob');
            images.push({
              originalPath: manifestItem.href,
              blob: imageBlob,
              mimeType: manifestItem.mediaType,
              fileName: manifestItem.href.split('/').pop() || 'image'
            });
          }
        }
      }
      
      // Step 6: Combine chapters into full content
      await updateProgress(importJob.id, 85, 'Assembling final content...');
      const fullContent = chapters
        .map(chapter => `<h2>${chapter.title}</h2>\n${chapter.content}`)
        .join('\n\n<div class="chapter-break">• • •</div>\n\n');
      
      // Step 7: Complete
      await updateProgress(importJob.id, 100, 'Import completed!');
      await supabase.rpc('complete_import_job', { 
        job_id: importJob.id, 
        success: true 
      });
      
      return {
        title: title || file.name.replace('.epub', ''),
        content: fullContent,
        chapters,
        images
      };
      
    } catch (error) {
      console.error('EPUB parsing error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to parse EPUB file",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = async (jobId: string, progress: number, step: string) => {
    await supabase.rpc('update_import_progress', {
      job_id: jobId,
      new_progress: progress,
      new_step: step,
      increment_completed_steps: true
    });
  };

  const extractOpfPath = (containerXml: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(containerXml, 'text/xml');
    const rootfile = doc.querySelector('rootfile');
    const fullPath = rootfile?.getAttribute('full-path');
    
    if (!fullPath) throw new Error('Invalid EPUB: Cannot find OPF path');
    return fullPath;
  };

  const parseOpf = (opfContent: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(opfContent, 'text/xml');
    
    // Extract title
    const titleElement = doc.querySelector('metadata title');
    const title = titleElement?.textContent?.trim() || '';
    
    // Extract manifest items
    const manifestItems = Array.from(doc.querySelectorAll('manifest item')).map(item => ({
      id: item.getAttribute('id') || '',
      href: item.getAttribute('href') || '',
      mediaType: item.getAttribute('media-type') || ''
    }));
    
    // Extract spine items
    const spineItems = Array.from(doc.querySelectorAll('spine itemref')).map(item => ({
      idref: item.getAttribute('idref') || ''
    }));
    
    return { title, spineItems, manifestItems };
  };

  const cleanHtmlContent = (htmlContent: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Remove script and style tags
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(script => script.remove());
    
    // Get body content or fall back to entire document
    const body = doc.querySelector('body') || doc.documentElement;
    
    // Clean up the HTML
    let cleanContent = body.innerHTML
      .replace(/<head[\s\S]*?<\/head>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleanContent;
  };

  const extractChapterTitle = (content: string): string | null => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Try to find heading tags
    const headings = doc.querySelectorAll('h1, h2, h3, h4, title');
    for (const heading of headings) {
      const text = heading.textContent?.trim();
      if (text && text.length > 0 && text.length < 100) {
        return text;
      }
    }
    
    return null;
  };

  const uploadImages = async (images: EpubImage[], bookId: string, importJobId: string) => {
    const uploadedImages = [];
    
    for (const image of images) {
      try {
        // Upload to Supabase storage
        const fileName = `${bookId}/${Date.now()}-${image.fileName}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('book-covers')
          .upload(fileName, image.blob, {
            contentType: image.mimeType
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('book-covers')
          .getPublicUrl(fileName);

        // Save image record to database
        const { data: imageRecord, error: imageError } = await supabase
          .from('book_images')
          .insert({
            book_id: bookId,
            import_job_id: importJobId,
            original_path: image.originalPath,
            storage_url: publicUrl,
            mime_type: image.mimeType,
            file_size_bytes: image.blob.size
          })
          .select()
          .single();

        if (imageError) throw imageError;

        uploadedImages.push({
          originalPath: image.originalPath,
          newUrl: publicUrl
        });
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }
    
    return uploadedImages;
  };

  return {
    parseEpubFile,
    uploadImages,
    isLoading
  };
}
