
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Save, Upload, FileText } from 'lucide-react';
import { PublishConfirmationDialog } from '../PublishConfirmationDialog';

interface BookFormActionsProps {
  onSaveDraft: () => void;
  onPublish: () => void;
  isLoading: boolean;
  isEditing?: boolean;
  bookTitle?: string;
}

export function BookFormActions({ 
  onSaveDraft, 
  onPublish, 
  isLoading, 
  isEditing = false,
  bookTitle = 'Untitled Book'
}: BookFormActionsProps) {
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const handlePublishClick = () => {
    setShowPublishDialog(true);
  };

  const handleConfirmPublish = () => {
    setShowPublishDialog(false);
    onPublish();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditing ? 'Update Your Book' : 'Publish Your Book'}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-400">
          Choose to save as draft or publish your book for readers to enjoy.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onSaveDraft}
          disabled={isLoading}
          variant="outline"
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save as Draft'}
        </Button>

        <Button
          onClick={handlePublishClick}
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Upload className="w-4 h-4 mr-2" />
          {isLoading ? 'Publishing...' : isEditing ? 'Update & Publish' : 'Publish Book'}
        </Button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-blue-800 dark:text-blue-200 text-sm">
          💡 <strong>Tip:</strong> Save as draft to continue working on your book later, or publish to make it available to readers immediately.
        </p>
      </div>

      <PublishConfirmationDialog
        isOpen={showPublishDialog}
        onConfirm={handleConfirmPublish}
        onCancel={() => setShowPublishDialog(false)}
        bookTitle={bookTitle}
        isEditing={isEditing}
      />
    </div>
  );
}
