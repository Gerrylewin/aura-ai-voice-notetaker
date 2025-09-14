
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEpubImport } from '@/hooks/useEpubImport';
import { useContentStorage } from '@/hooks/useContentStorage';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface EpubImportViewProps {
  onImport: (title: string, content: string) => void;
  onBack: () => void;
}

export function EpubImportView({ onImport, onBack }: EpubImportViewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [importJobId, setImportJobId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { parseEpubFile, uploadImages } = useEpubImport();
  const { createBookWithContent } = useContentStorage();

  // Poll for import progress updates
  React.useEffect(() => {
    if (!importJobId || !isProcessing) return;

    const pollProgress = async () => {
      const { data } = await supabase
        .from('import_jobs')
        .select('progress_percentage, current_step, status')
        .eq('id', importJobId)
        .single();

      if (data) {
        setProgress(data.progress_percentage || 0);
        setCurrentStep(data.current_step || '');
        
        if (data.status === 'completed' || data.status === 'failed') {
          setIsProcessing(false);
        }
      }
    };

    const interval = setInterval(pollProgress, 1000);
    return () => clearInterval(interval);
  }, [importJobId, isProcessing]);

  const handleFileSelect = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.epub')) {
      toast({
        title: "Invalid File",
        description: "Please select a valid .epub file",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('Starting import...');

    try {
      // Parse the EPUB file
      const result = await parseEpubFile(file);
      
      // Get the import job ID from the parsing process
      const { data: jobs } = await supabase
        .from('import_jobs')
        .select('id')
        .eq('import_type', 'epub')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);
      
      const jobId = jobs?.[0]?.id;
      
      // Create the book with content
      setCurrentStep('Creating book record...');
      const { book } = await createBookWithContent({
        title: result.title,
        description: `Imported from ${file.name}`,
        authorName: 'Unknown Author', // Will be updated by user
        content: result.content,
        chapters: result.chapters,
        importJobId: jobId
      });

      // Upload images if any
      if (result.images.length > 0) {
        setCurrentStep('Uploading images...');
        const uploadedImages = await uploadImages(result.images, book.id, jobId || '');
        
        // Update content with correct image URLs
        let updatedContent = result.content;
        uploadedImages.forEach(img => {
          updatedContent = updatedContent.replace(
            new RegExp(img.originalPath, 'g'),
            img.newUrl
          );
        });
        
        // Update the book content with corrected image URLs
        await supabase
          .from('book_content')
          .update({ full_content: updatedContent })
          .eq('book_id', book.id);
      }

      setProgress(100);
      setCurrentStep('Import completed successfully!');
      
      toast({
        title: "EPUB Imported Successfully!",
        description: `"${result.title}" has been imported with ${result.chapters.length} chapters and ${result.images.length} images`,
      });

      // Call the onImport callback
      onImport(result.title, result.content);

    } catch (error) {
      console.error('EPUB import error:', error);
      setProgress(0);
      setCurrentStep('Import failed');
      
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import EPUB file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h3 className="text-lg font-semibold">Import EPUB File</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload an EPUB file with proper chapter separation and image handling
          </p>
        </div>
      </div>

      {isProcessing ? (
        <div className="space-y-4 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-red-600" />
            <span className="font-medium">Processing EPUB...</span>
          </div>
          
          <Progress value={progress} className="w-full" />
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentStep}
          </p>
          
          <div className="text-xs text-gray-500">
            {progress}% complete
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-red-400 bg-red-50 dark:bg-red-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <FileText className="w-8 h-8 text-gray-400" />
              <Upload className="w-6 h-6 text-gray-400" />
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                Drop your EPUB file here
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                or click to browse
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <Upload className="w-4 h-4 mr-2" />
              Select EPUB File
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".epub"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Proper chapter separation and structure preservation</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Automatic image extraction and cloud storage</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Real-time import progress tracking</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Content validation and error handling</span>
        </div>
      </div>
    </div>
  );
}
