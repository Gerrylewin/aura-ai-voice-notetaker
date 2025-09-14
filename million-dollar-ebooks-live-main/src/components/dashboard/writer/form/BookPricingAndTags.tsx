
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X } from 'lucide-react';

interface BookPricingAndTagsProps {
  priceCents: number;
  tags: string[];
  seriesPriceCents?: number;
  isPartOfSeries?: boolean;
  isLastInSeries?: boolean;
  onPriceChange: (priceCents: number) => void;
  onTagsChange: (tags: string[]) => void;
  onSeriesPriceChange: (priceCents: number) => void;
  onIsLastInSeriesChange?: (isLast: boolean) => void;
}

export function BookPricingAndTags({ 
  priceCents, 
  tags, 
  seriesPriceCents = 0,
  isPartOfSeries = false,
  isLastInSeries = false,
  onPriceChange, 
  onTagsChange, 
  onSeriesPriceChange,
  onIsLastInSeriesChange
}: BookPricingAndTagsProps) {
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePriceChange = (value: string) => {
    const cents = Math.round(parseFloat(value || '0') * 100);
    if (cents >= 0 && cents <= 100) {
      onPriceChange(cents);
    }
  };

  const handleSeriesPriceChange = (value: string) => {
    const cents = Math.round(parseFloat(value || '0') * 100);
    if (cents >= 0) {
      onSeriesPriceChange(cents);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Book Price
        </label>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant={priceCents === 0 ? "default" : "outline"}
              onClick={() => onPriceChange(0)}
              className={priceCents === 0 ? "bg-accent text-accent-foreground" : ""}
            >
              Free
            </Button>
            <Button
              type="button"
              variant={priceCents === 100 ? "default" : "outline"}
              onClick={() => onPriceChange(100)}
              className={priceCents === 100 ? "bg-primary text-primary-foreground" : ""}
            >
              $1.00
            </Button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            All books are priced at $1.00 or free. This keeps pricing simple for readers and maximizes accessibility.
          </p>
        </div>
      </div>

      {isPartOfSeries && onIsLastInSeriesChange && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isLastInSeries"
              checked={isLastInSeries}
              onCheckedChange={onIsLastInSeriesChange}
            />
            <label
              htmlFor="isLastInSeries"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              This is the last book in the series
            </label>
          </div>

          {isLastInSeries && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Complete Series Price ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.00"
                value={(seriesPriceCents / 100).toFixed(2)}
                onChange={(e) => handleSeriesPriceChange(e.target.value)}
                placeholder="0.00"
                className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total price for purchasing the complete series
              </p>
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags
        </label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
            className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white"
          />
          <Button type="button" onClick={handleAddTag} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
              {tag}
              <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
