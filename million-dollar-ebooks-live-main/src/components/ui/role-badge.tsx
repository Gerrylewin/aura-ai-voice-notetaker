
import React from 'react';
import { PenTool, BookOpen, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RoleBadgeProps {
  userRole: 'reader' | 'writer' | 'moderator' | 'admin';
  size?: 'sm' | 'md';
  showText?: boolean;
}

/**
 * RoleBadge component for displaying user roles in social interactions
 * Shows distinct visual indicators for each role type
 */
export function RoleBadge({ userRole, size = 'sm', showText = true }: RoleBadgeProps) {
  const getRoleConfig = () => {
    switch (userRole) {
      case 'admin':
        return {
          icon: Shield,
          text: 'Admin',
          className: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:text-white dark:border-yellow-500',
          iconSize: size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
        };
      case 'moderator':
        return {
          icon: Shield,
          text: 'Mod',
          className: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:border-blue-500',
          iconSize: size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
        };
      case 'writer':
        return {
          icon: PenTool,
          text: 'Writer',
          className: 'bg-red-500 hover:bg-red-600 text-white border-red-400 dark:bg-red-600 dark:hover:bg-red-700 dark:border-red-500',
          iconSize: size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
        };
      default:
        return {
          icon: BookOpen,
          text: 'Reader',
          className: 'bg-green-500 hover:bg-green-600 text-white border-green-400 dark:bg-green-600 dark:hover:bg-green-700 dark:border-green-500',
          iconSize: size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
        };
    }
  };

  const config = getRoleConfig();
  const Icon = config.icon;

  return (
    <Badge className={`${config.className} flex items-center gap-1 ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      <Icon className={config.iconSize} />
      {showText && <span>{config.text}</span>}
    </Badge>
  );
}
