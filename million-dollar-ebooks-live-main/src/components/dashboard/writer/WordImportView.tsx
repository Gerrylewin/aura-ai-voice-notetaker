
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useWordImport } from '@/hooks/useWordImport';
import { useContentStorage } from '@/hooks/useContentStorage';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface WordImportViewProps {
  onImport: (title: string, content: string) => void;
  onBack: () => void;
}

export function WordImportView({ onImport, onBack }: WordImportViewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const { parseWordDocument, uploadWordImages } = useWordImport();
  const { createBookWithContent } = useContentStorage();

  // Poll for import progress updates
  React.useEffect(() => {
    if (!isProcessing) return;

    const pollProgress = async () => {
      const { data } = await supabase
        .from('import_jobs')
        .select('progress_percentage, current_step, status')
        .eq('import_type', 'word')
        .eq('status', 'processing')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setProgress(data.progress_percentage || 0);
        setCurrentStep(data.current_step || '');
      }
    };

    const interval = setInterval(pollProgress, 1000);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Extract title from filename (remove .docx extension)
      const fileName = file.name.replace(/\.(docx|doc)$/i, '');
      setTitle(fileName);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      // Parse the Word document
      const result = await parseWordDocument(selectedFile);
      
      // Create the book with content
      setCurrentStep('Creating book record...');
      const finalTitle = title.trim() || result.title;
      
      const { book } = await createBookWithContent({
        title: finalTitle,
        description: `Imported from ${selectedFile.name}`,
        authorName: 'Unknown Author', // Will be updated by user
        content: result.content,
      });

      // Upload images and update content if any images exist
      if (result.images.length > 0) {
        setCurrentStep('Uploading images...');
        const updatedContent = await uploadWordImages(result.images, book.id, result.content);
        
        // Update the book content with corrected image URLs
        await supabase
          .from('book_content')
          .update({ full_content: updatedContent })
          .eq('book_id', book.id);
      }

      setProgress(100);
      setCurrentStep('Import completed successfully!');
      
      // Call the onImport callback
      onImport(finalTitle, result.content);

    } catch (error) {
      console.error('Error importing Word document:', error);
      alert('Failed to import Word document. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack} disabled={isProcessing}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h3 className="font-semibold">Import Word Document</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload a .docx or .doc file with automatic image extraction
          </p>
        </div>
      </div>

      {isProcessing ? (
        <div className="space-y-4 p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-red-600" />
            <span className="font-medium">Processing Word Document...</span>
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Word Document
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Choose a Word document (.docx or .doc)
              </p>
              <Input
                type="file"
                accept=".docx,.doc"
                onChange={handleFileSelect}
                className="max-w-xs mx-auto"
              />
            </div>
          </div>

          {selectedFile && (
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Title (optional)
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your imported content"
                  className="bg-white dark:bg-gray-900"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleImport} 
              disabled={!selectedFile || isProcessing}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Document
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Automatic image extraction and upload</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Proper formatting preservation</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Real-time progress tracking</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-3 h-3 text-green-500" />
          <span>Word count and content analysis</span>
        </div>
      </div>
    </div>
  );
}
