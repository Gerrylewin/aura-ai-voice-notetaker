
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function GoalsErrorState() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center text-gray-600 dark:text-gray-400">
          Failed to load your goals.
        </div>
      </CardContent>
    </Card>
  );
}
