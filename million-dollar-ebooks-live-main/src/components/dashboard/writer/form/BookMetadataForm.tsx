
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';
import { CategorySelector } from '@/components/forms/CategorySelector';
import { GenreSelector } from '@/components/forms/GenreSelector';

interface BookMetadataFormProps {
  title: string;
  description: string;
  seriesName?: string;
  selectedCategory?: string;
  selectedGenre?: string;
  isPartOfSeries?: boolean;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onSeriesNameChange: (seriesName: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onGenreChange: (genreId: string) => void;
  onIsPartOfSeriesChange: (isPartOfSeries: boolean) => void;
  onShowImport?: () => void;
}

export function BookMetadataForm({ 
  title, 
  description, 
  seriesName = '', 
  selectedCategory,
  selectedGenre,
  isPartOfSeries = false,
  onTitleChange, 
  onDescriptionChange, 
  onSeriesNameChange,
  onCategoryChange,
  onGenreChange,
  onIsPartOfSeriesChange,
  onShowImport
}: BookMetadataFormProps) {
  return (
    <div className="space-y-6">
      {onShowImport && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onShowImport}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Import Content
          </Button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Book Title *
        </label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Enter your book title"
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Write a compelling description of your book"
          rows={4}
          className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPartOfSeries"
          checked={isPartOfSeries}
          onCheckedChange={onIsPartOfSeriesChange}
        />
        <label
          htmlFor="isPartOfSeries"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          This book is part of a series
        </label>
      </div>

      {isPartOfSeries && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Series Name *
          </label>
          <Input
            value={seriesName}
            onChange={(e) => onSeriesNameChange(e.target.value)}
            placeholder="Enter series name"
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
            required={isPartOfSeries}
          />
        </div>
      )}

      <CategorySelector
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />

      <GenreSelector
        selectedGenre={selectedGenre}
        onGenreChange={onGenreChange}
      />
    </div>
  );
}
