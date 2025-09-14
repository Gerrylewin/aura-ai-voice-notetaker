import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useEpubImport } from '@/hooks/useEpubImport';
import { useWordImport } from '@/hooks/useWordImport';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  BookOpen, 
  X, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Download,
  Trash2
} from 'lucide-react';

interface DragDropImportProps {
  onImport: (title: string, content: string) => void;
  onClose: () => void;
}

export function DragDropImport({ onImport, onClose }: DragDropImportProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [importedFiles, setImportedFiles] = useState<File[]>([]);
  const [previewContent, setPreviewContent] = useState<{
    title: string;
    content: string;
    wordCount: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parseEpubFile } = useEpubImport();
  const { parseWordDocument } = useWordImport();
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    const validFiles = files.filter(file => {
      const validTypes = [
        'application/epub+zip',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain'
      ];
      return validTypes.includes(file.type) || file.name.endsWith('.epub') || file.name.endsWith('.docx') || file.name.endsWith('.doc');
    });

    if (validFiles.length === 0) {
      toast({
        title: 'Invalid File Type',
        description: 'Please upload EPUB, Word documents, or text files.',
        variant: 'destructive',
      });
      return;
    }

    setImportedFiles(validFiles);
    
    // Process the first file for preview
    if (validFiles.length > 0) {
      await processFile(validFiles[0]);
    }
  }, [toast]);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setProcessingStep('Reading file...');

    try {
      let result;
      
      if (file.type === 'application/epub+zip' || file.name.endsWith('.epub')) {
        setProcessingStep('Processing EPUB...');
        setProcessingProgress(30);
        result = await parseEpubFile(file);
      } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        setProcessingStep('Processing Word document...');
        setProcessingProgress(30);
        result = await parseWordDocument(file);
      } else {
        setProcessingStep('Processing text file...');
        setProcessingProgress(30);
        const text = await file.text();
        result = {
          title: file.name.replace(/\.[^/.]+$/, ''),
          content: text,
          chapters: []
        };
      }

      setProcessingStep('Generating preview...');
      setProcessingProgress(80);

      const wordCount = result.content.split(/\s+/).filter(word => word.length > 0).length;
      
      setPreviewContent({
        title: result.title,
        content: result.content,
        wordCount
      });

      setProcessingProgress(100);
      setProcessingStep('Complete!');
      
      toast({
        title: 'File Processed Successfully',
        description: `"${result.title}" is ready for preview.`,
      });

    } catch (error: any) {
      console.error('File processing error:', error);
      toast({
        title: 'Processing Failed',
        description: error.message || 'Failed to process the file.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (previewContent) {
      onImport(previewContent.title, previewContent.content);
      onClose();
    }
  };

  const removeFile = (index: number) => {
    const newFiles = importedFiles.filter((_, i) => i !== index);
    setImportedFiles(newFiles);
    
    if (newFiles.length === 0) {
      setPreviewContent(null);
    } else if (index === 0 && newFiles.length > 0) {
      // Process the new first file
      processFile(newFiles[0]);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/epub+zip' || file.name.endsWith('.epub')) {
      return <BookOpen className="w-5 h-5 text-primary" />;
    } else if (file.type.includes('word') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
      return <FileText className="w-5 h-5 text-secondary" />;
    }
    return <FileText className="w-5 h-5 text-muted-foreground" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Import Your Book</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6 overflow-y-auto">
          {/* Drag and Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Drag & Drop Your Book</h3>
            <p className="text-muted-foreground mb-4">
              Upload EPUB, Word documents, or text files
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:bg-primary/90"
            >
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".epub,.docx,.doc,.txt"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{processingStep}</span>
                    <span className="text-sm text-muted-foreground">{processingProgress}%</span>
                  </div>
                  <Progress value={processingProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* File List */}
          {importedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Uploaded Files</h4>
              {importedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file)}
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {index === 0 && previewContent && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Processed
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Preview */}
          {previewContent && (
            <Card className="bg-muted/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{previewContent.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {previewContent.wordCount.toLocaleString()} words
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Create a blob and download
                        const blob = new Blob([previewContent.content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${previewContent.title}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-background rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: previewContent.content.substring(0, 1000) + 
                               (previewContent.content.length > 1000 ? '...' : '')
                      }}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing first 1,000 characters
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Show full content in a modal or new window
                          const newWindow = window.open('', '_blank');
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head><title>${previewContent.title} - Preview</title></head>
                                <body style="font-family: system-ui; max-width: 800px; margin: 0 auto; padding: 20px;">
                                  <h1>${previewContent.title}</h1>
                                  <div style="white-space: pre-wrap;">${previewContent.content}</div>
                                </body>
                              </html>
                            `);
                          }
                        }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Full Preview
                      </Button>
                      <Button
                        onClick={handleImport}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Import Book
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <Card className="bg-accent/10 border-accent/20">
            <CardContent className="p-4">
              <h4 className="font-semibold text-accent mb-2">Supported Formats</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span><strong>EPUB:</strong> Complete ebooks with chapters</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-secondary" />
                  <span><strong>Word:</strong> .docx and .doc files</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span><strong>Text:</strong> Plain text files</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
