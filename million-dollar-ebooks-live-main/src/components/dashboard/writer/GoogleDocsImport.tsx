
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useGoogleDocsAuth } from '@/hooks/useGoogleDocsAuth';
import { GoogleAuthView } from './GoogleAuthView';
import { GoogleDocsList } from './GoogleDocsList';

interface GoogleDocsImportProps {
  onImport: (title: string, content: string) => void;
}

export function GoogleDocsImport({ onImport }: GoogleDocsImportProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    isLoading,
    documents,
    accessToken,
    handleGoogleAuth,
    resetAuth,
    setIsLoading
  } = useGoogleDocsAuth();

  const importDocument = async (documentId: string) => {
    if (!accessToken) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-docs-import', {
        body: { action: 'import_document', documentId, accessToken }
      });

      if (error) throw error;

      onImport(data.title, data.content);
      setIsOpen(false);
      
      toast({
        title: "Document Imported!",
        description: `"${data.title}" has been imported successfully`,
      });
    } catch (error) {
      console.error('Error importing document:', error);
      toast({
        title: "Import Failed",
        description: "Failed to import the document",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        Import from Google Docs
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle>Import from Google Docs</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!accessToken ? (
              <GoogleAuthView 
                onAuth={handleGoogleAuth}
                isLoading={isLoading}
              />
            ) : (
              <GoogleDocsList
                documents={documents}
                onImport={importDocument}
                onChangeAccount={resetAuth}
                onCancel={() => setIsOpen(false)}
                isLoading={isLoading}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
