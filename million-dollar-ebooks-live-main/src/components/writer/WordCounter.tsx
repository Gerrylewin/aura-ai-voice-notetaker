
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Target } from 'lucide-react';

interface WordCounterProps {
  wordCount: number;
  target?: number;
}

export function WordCounter({ wordCount, target = 3000 }: WordCounterProps) {
  const percentage = target > 0 ? Math.min((wordCount / target) * 100, 100) : 0;

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-500">
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {wordCount.toLocaleString()} words
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {target > 0 && `Target: ${target.toLocaleString()}`}
              </div>
            </div>
          </div>
          
          {target > 0 && (
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {Math.round(percentage)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                of target
              </div>
            </div>
          )}
        </div>
        
        {target > 0 && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
