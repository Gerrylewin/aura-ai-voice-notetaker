import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileImportResult {
  title: string;
  content: string;
  wordCount: number;
  chapters?: Array<{
    title: string;
    content: string;
    order: number;
  }>;
  images?: Array<{
    originalPath: string;
    blob: string;
    mimeType: string;
    fileName: string;
  }>;
}

interface FileImportProgress {
  progress: number;
  currentStep: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export function useFileImport() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<FileImportProgress>({
    progress: 0,
    currentStep: '',
    status: 'pending'
  });
  const { toast } = useToast();

  const importFile = async (file: File, bookId?: string): Promise<FileImportResult> => {
    setIsLoading(true);
    setProgress({
      progress: 0,
      currentStep: 'Starting import...',
      status: 'processing'
    });

    try {
      // Validate file type
      const fileType = getFileType(file.name);
      if (!fileType) {
        throw new Error('Unsupported file type. Please upload a PDF, EPUB, TXT, or DOCX file.');
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File size too large. Please upload a file smaller than 50MB.');
      }

      setProgress({
        progress: 10,
        currentStep: 'Reading file...',
        status: 'processing'
      });

      // Convert file to base64
      const fileContent = await fileToBase64(file);

      setProgress({
        progress: 30,
        currentStep: 'Uploading to server...',
        status: 'processing'
      });

      // Call the server-side processing function
      const { data, error } = await supabase.functions.invoke('process-file-import', {
        body: {
          fileType,
          fileName: file.name,
          fileContent,
          bookId
        }
      });

      if (error) {
        throw new Error(`Import failed: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Import failed');
      }

      setProgress({
        progress: 100,
        currentStep: 'Import completed!',
        status: 'completed'
      });

      // Return the processed content
      return {
        title: data.title || file.name.replace(/\.[^/.]+$/, ''),
        content: data.content || '',
        wordCount: data.wordCount || 0,
        chapters: data.chapters || [],
        images: data.images || []
      };

    } catch (error) {
      console.error('File import error:', error);
      setProgress({
        progress: 0,
        currentStep: 'Import failed',
        status: 'failed'
      });

      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import file",
        variant: "destructive"
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getFileType = (fileName: string): 'pdf' | 'epub' | 'txt' | 'docx' | null => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'epub':
        return 'epub';
      case 'txt':
        return 'txt';
      case 'docx':
      case 'doc':
        return 'docx';
      default:
        return null;
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const pollImportProgress = async (jobId: string) => {
    const interval = setInterval(async () => {
      const { data, error } = await supabase
        .from('import_jobs')
        .select('progress_percentage, current_step, status')
        .eq('id', jobId)
        .single();

      if (!error && data) {
        setProgress({
          progress: data.progress_percentage || 0,
          currentStep: data.current_step || '',
          status: data.status as 'pending' | 'processing' | 'completed' | 'failed'
        });

        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  return {
    importFile,
    isLoading,
    progress,
    pollImportProgress
  };
}
