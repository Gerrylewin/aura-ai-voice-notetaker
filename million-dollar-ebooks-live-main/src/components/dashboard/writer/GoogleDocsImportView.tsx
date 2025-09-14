
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useGoogleDocsAuth } from '@/hooks/useGoogleDocsAuth';
import { GoogleAuthView } from './GoogleAuthView';
import { GoogleDocsList } from './GoogleDocsList';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoogleDocsImportViewProps {
  onImport: (title: string, content: string) => void;
  onBack: () => void;
}

export function GoogleDocsImportView({ onImport, onBack }: GoogleDocsImportViewProps) {
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-medium">Import from Google Docs</h3>
      </div>

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
          onCancel={onBack}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
