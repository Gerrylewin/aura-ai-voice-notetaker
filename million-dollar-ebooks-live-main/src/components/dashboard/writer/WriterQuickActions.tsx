
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PenTool, BookOpen, BarChart3, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function WriterQuickActions() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: 'Write New Story',
      description: 'Create a daily story submission',
      icon: PenTool,
      action: () => navigate('/stories'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View Analytics', 
      description: 'Check your performance metrics',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Browse Library',
      description: 'Discover new books to read',
      icon: BookOpen,
      action: () => navigate('/discover'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Connect with Readers',
      description: 'Join the community chat',
      icon: Users,
      action: () => navigate('/chat'),
      color: 'bg-red-500 hover:bg-red-600'
    }
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                onClick={action.action}
                variant="outline"
                className={`h-auto p-4 flex flex-col items-center gap-2 text-center ${action.color} text-white border-none hover:scale-105 transition-all duration-200`}
              >
                <Icon className="w-6 h-6" />
                <div>
                  <div className="font-semibold text-sm">{action.title}</div>
                  <div className="text-xs opacity-80">{action.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
