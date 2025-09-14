
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Flag, CheckCircle, AlertCircle, ClipboardCheck } from 'lucide-react';

interface AdminOverviewCardsProps {
  pendingBooksCount: number;
  pendingFlagsCount: number;
  totalFlagsCount: number;
  resolvedFlagsCount: number;
  pendingApplicationsCount?: number;
}

export function AdminOverviewCards({ 
  pendingBooksCount, 
  pendingFlagsCount, 
  totalFlagsCount, 
  resolvedFlagsCount,
  pendingApplicationsCount = 0
}: AdminOverviewCardsProps) {
  const cards = [
    {
      title: 'Pending Books',
      value: pendingBooksCount,
      icon: BookOpen,
      description: 'Books awaiting review',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Writer Applications',
      value: pendingApplicationsCount,
      icon: ClipboardCheck,
      description: 'Applications pending review',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Pending Flags',
      value: pendingFlagsCount,
      icon: Flag,
      description: 'Content flags to review',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    },
    {
      title: 'Total Flags',
      value: totalFlagsCount,
      icon: AlertCircle,
      description: 'All content flags',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    {
      title: 'Resolved Flags',
      value: resolvedFlagsCount,
      icon: CheckCircle,
      description: 'Successfully resolved',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
