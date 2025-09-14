
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BookPreviewProps {
  title: string;
  description: string;
  content: string;
  coverImageUrl?: string;
  priceCents: number;
  tags: string[];
}

export function BookPreview({ 
  title, 
  description, 
  content, 
  coverImageUrl, 
  priceCents, 
  tags 
}: BookPreviewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardContent className="p-8">
          <div className="flex gap-6 mb-6">
            {coverImageUrl && (
              <div className="flex-shrink-0">
                <img 
                  src={coverImageUrl} 
                  alt="Book cover" 
                  className="w-32 h-48 object-cover rounded-lg border"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {title || 'Untitled Book'}
              </h1>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {description || 'No description provided'}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-2xl font-bold text-red-600">
                ${(priceCents / 100).toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Content Preview</h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-h-96 overflow-y-auto">
              <div 
                className="prose dark:prose-invert max-w-none text-gray-900 dark:text-gray-100"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '16px',
                  lineHeight: '1.6',
                  textAlign: 'justify'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: content || '<p class="text-gray-500 italic">No content written yet...</p>' 
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
