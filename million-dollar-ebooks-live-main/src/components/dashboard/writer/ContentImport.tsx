
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GoogleDocsImportView } from './GoogleDocsImportView';
import { EpubImportView } from './EpubImportView';
import { WordImportView } from './WordImportView';

interface ContentImportProps {
  onImport: (title: string, content: string) => void;
  onCancel: () => void;
}

type ImportType = 'google-docs' | 'epub' | 'word';

export function ContentImport({ onImport, onCancel }: ContentImportProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [importType, setImportType] = useState<ImportType | null>(null);
  const { toast } = useToast();

  const handleImportComplete = (title: string, content: string) => {
    onImport(title, content);
    setIsOpen(false);
    setImportType(null);
    
    toast({
      title: "Content Imported!",
      description: `"${title}" has been imported successfully`,
    });
  };

  const handleBack = () => {
    setImportType(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Import Content</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!importType ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose how you'd like to import your content:
              </p>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Button
                  variant="outline"
                  onClick={() => setImportType('google-docs')}
                  className="h-24 flex flex-col items-center gap-2 border-2 hover:border-red-300"
                >
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div className="text-center">
                    <div className="font-medium">Google Docs</div>
                    <div className="text-xs text-gray-500">Import from Google Drive</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setImportType('word')}
                  className="h-24 flex flex-col items-center gap-2 border-2 hover:border-red-300"
                >
                  <FileText className="w-8 h-8 text-blue-700" />
                  <div className="text-center">
                    <div className="font-medium">Word Document</div>
                    <div className="text-xs text-gray-500">Upload .docx or .doc file</div>
                  </div>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setImportType('epub')}
                  className="h-24 flex flex-col items-center gap-2 border-2 hover:border-red-300"
                >
                  <Upload className="w-8 h-8 text-green-600" />
                  <div className="text-center">
                    <div className="font-medium">ePub File</div>
                    <div className="text-xs text-gray-500">Upload .epub file with images</div>
                  </div>
                </Button>
              </div>
            </div>
          ) : importType === 'google-docs' ? (
            <GoogleDocsImportView 
              onImport={handleImportComplete}
              onBack={handleBack}
            />
          ) : importType === 'word' ? (
            <WordImportView 
              onImport={handleImportComplete}
              onBack={handleBack}
            />
          ) : (
            <EpubImportView 
              onImport={handleImportComplete}
              onBack={handleBack}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
