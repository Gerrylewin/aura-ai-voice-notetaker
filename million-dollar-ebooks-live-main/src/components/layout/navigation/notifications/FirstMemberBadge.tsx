
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Crown } from 'lucide-react';

interface FirstMemberBadgeProps {
  memberNumber: number;
}

export function FirstMemberBadge({ memberNumber }: FirstMemberBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-300 dark:from-yellow-900 dark:to-amber-900 dark:text-yellow-200 dark:border-yellow-700 font-medium"
    >
      <Crown className="w-3 h-3 mr-1" />
      Founding Member #{memberNumber}
    </Badge>
  );
}
