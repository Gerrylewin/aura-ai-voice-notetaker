
import React, { useEffect, useState } from 'react';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Save } from 'lucide-react';

interface BookContentEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function BookContentEditor({ content, onChange }: BookContentEditorProps) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Auto-save content to localStorage
  const [, setSavedContent] = useLocalStorage('book-content-draft', '');

  // Auto-save functionality
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (content && content.trim()) {
        setSavedContent(content);
        setLastSaved(new Date());
      }
    }, 2000); // Save after 2 seconds of no typing for book content

    return () => clearTimeout(saveTimeout);
  }, [content, setSavedContent]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Book Content *
        </label>
        {lastSaved && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Save className="w-4 h-4 mr-1" />
            Auto-saved at {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <RichTextEditor
          value={content}
          onChange={onChange}
          placeholder="Start writing your book..."
        />
      </div>
    </div>
  );
}
