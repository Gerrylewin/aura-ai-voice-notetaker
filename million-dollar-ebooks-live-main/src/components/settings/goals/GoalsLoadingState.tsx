
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function GoalsLoadingState() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">Loading your goals...</div>
      </CardContent>
    </Card>
  );
}
