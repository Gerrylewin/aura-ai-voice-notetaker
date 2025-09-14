
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BookOpen, Globe } from 'lucide-react';

interface PublishConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  bookTitle: string;
  isEditing?: boolean;
}

export function PublishConfirmationDialog({ 
  isOpen, 
  onConfirm, 
  onCancel,
  bookTitle,
  isEditing = false
}: PublishConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-600" />
            {isEditing ? 'Update & Publish Book' : 'Publish Book'}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>
                Are you sure you want to {isEditing ? 'update and publish' : 'publish'} "<strong>{bookTitle}</strong>"?
              </span>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-green-800 dark:text-green-200 text-sm">
                📚 Once published, your book will be:
              </p>
              <ul className="text-green-700 dark:text-green-300 text-sm mt-2 space-y-1 ml-4">
                <li>• Live and available for purchase immediately</li>
                <li>• Visible to all users on the platform</li>
                <li>• Searchable in the discover section</li>
                <li>• Ready for readers to enjoy</li>
              </ul>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm">
              You can always edit your book later if needed.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-green-600 hover:bg-green-700"
          >
            Yes, {isEditing ? 'Update & Publish' : 'Publish Now'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
