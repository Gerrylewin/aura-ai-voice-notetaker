
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface GoogleAuthViewProps {
  onAuth: () => void;
  isLoading: boolean;
}

export function GoogleAuthView({ onAuth, isLoading }: GoogleAuthViewProps) {
  return (
    <div className="text-center py-8">
      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold mb-2">Connect to Google Docs</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        Authenticate with Google to import your documents
      </p>
      <Button 
        onClick={onAuth}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? 'Connecting...' : 'Connect Google Account'}
      </Button>
    </div>
  );
}
