import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, FileImage, FileVideo, Loader2, CheckCircle, X } from 'lucide-react';
import { useFileImport } from '@/hooks/useFileImport';
import { useContentStorage } from '@/hooks/useContentStorage';
import { useToast } from '@/hooks/use-toast';

interface EnhancedFileImportViewProps {
  onImport: (title: string, content: string) => void;
  onBack: () => void;
}

interface FileTypeInfo {
  type: 'pdf' | 'epub' | 'txt' | 'docx';
  label: string;
  extensions: string[];
  icon: React.ReactNode;
  maxSize: number; // in MB
}

const SUPPORTED_FILE_TYPES: FileTypeInfo[] = [
  {
    type: 'pdf',
    label: 'PDF Document',
    extensions: ['.pdf'],
    icon: <FileText className="w-6 h-6" />,
    maxSize: 50
  },
  {
    type: 'epub',
    label: 'EPUB Book',
    extensions: ['.epub'],
    icon: <FileText className="w-6 h-6" />,
    maxSize: 100
  },
  {
    type: 'txt',
    label: 'Text File',
    extensions: ['.txt'],
    icon: <FileText className="w-6 h-6" />,
    maxSize: 10
  },
  {
    type: 'docx',
    label: 'Word Document',
    extensions: ['.docx', '.doc'],
    icon: <FileText className="w-6 h-6" />,
    maxSize: 50
  }
];

export function EnhancedFileImportView({ onImport, onBack }: EnhancedFileImportViewProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importFile, isLoading, progress } = useFileImport();
  const { createBookWithContent } = useContentStorage();
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    // Validate file type
    const fileType = getFileType(file.name);
    if (!fileType) {
      toast({
        title: "Unsupported File Type",
        description: "Please select a PDF, EPUB, TXT, or DOCX file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size
    const maxSize = SUPPORTED_FILE_TYPES.find(t => t.type === fileType)?.maxSize || 50;
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: `File size must be less than ${maxSize}MB.`,
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    // Extract title from filename
    const fileName = file.name.replace(/\.[^/.]+$/, '');
    setTitle(fileName);
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

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      // Import the file using server-side processing
      const result = await importFile(selectedFile);
      
      // Create the book with content
      const finalTitle = title.trim() || result.title;
      
      const { book } = await createBookWithContent({
        title: finalTitle,
        description: `Imported from ${selectedFile.name}`,
        authorName: 'Unknown Author', // Will be updated by user
        content: result.content,
        chapters: result.chapters
      });

      toast({
        title: "File Imported Successfully!",
        description: `"${finalTitle}" has been imported with ${result.wordCount} words`,
      });

      // Call the onImport callback
      onImport(finalTitle, result.content);

    } catch (error) {
      console.error('Error importing file:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import file",
        variant: "destructive"
      });
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

  const getFileTypeInfo = (fileName: string): FileTypeInfo | null => {
    const fileType = getFileType(fileName);
    return fileType ? SUPPORTED_FILE_TYPES.find(t => t.type === fileType) || null : null;
  };

  const removeFile = () => {
    setSelectedFile(null);
    setTitle('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">Import File</h2>
      </div>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Select File to Import</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!selectedFile ? (
              <>
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">
                  Drag and drop your file here
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  or click to browse
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  Choose File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.epub,.txt,.docx,.doc"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                {/* Supported file types */}
                <div className="mt-6">
                  <p className="text-sm text-gray-500 mb-2">Supported file types:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUPPORTED_FILE_TYPES.map((fileType) => (
                      <div
                        key={fileType.type}
                        className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                      >
                        {fileType.icon}
                        <span>{fileType.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  {getFileTypeInfo(selectedFile.name)?.icon}
                  <div className="text-left">
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File Details and Import */}
      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle>Import Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Book Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your imported content"
                disabled={isLoading}
              />
            </div>

            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{progress.currentStep}</span>
                  <span>{progress.progress}%</span>
                </div>
                <Progress value={progress.progress} className="w-full" />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleImport}
                disabled={isLoading || !selectedFile}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import File
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={removeFile}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
