
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, Calendar } from 'lucide-react';

interface GoogleDocument {
  id: string;
  name: string;
  modifiedTime: string;
}

interface GoogleDocsListProps {
  documents: GoogleDocument[];
  onImport: (documentId: string) => void;
  onChangeAccount: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function GoogleDocsList({ 
  documents, 
  onImport, 
  onChangeAccount, 
  onCancel, 
  isLoading 
}: GoogleDocsListProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Select a document to import:</h3>
      
      {documents.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-center py-4">
          No Google Docs found in your account
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {documents.map((doc) => (
            <Card key={doc.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{doc.name}</h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(doc.modifiedTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => onImport(doc.id)}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Import
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onChangeAccount}>
          Change Account
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
