
import React from 'react';
import { Achievement } from '@/types/gamification';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AchievementBadge({ achievement, unlocked, size = 'md' }: AchievementBadgeProps) {
  const rarityColors = {
    common: 'bg-gray-600 border-gray-500',
    rare: 'bg-blue-600 border-blue-500',
    epic: 'bg-purple-600 border-purple-500',
    legendary: 'bg-yellow-600 border-yellow-500'
  };

  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  return (
    <div className={cn(
      "relative group cursor-pointer transition-all duration-200 hover:scale-105",
      !unlocked && "opacity-50 grayscale"
    )}>
      <div className={cn(
        "rounded-full border-2 flex items-center justify-center",
        rarityColors[achievement.rarity],
        sizeClasses[size],
        unlocked ? "shadow-lg" : "border-gray-600"
      )}>
        <span>{achievement.icon}</span>
      </div>
      
      {unlocked && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      )}

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
        <div className="font-bold">{achievement.title}</div>
        <div className="text-gray-300">{achievement.description}</div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">
            {achievement.rarity}
          </Badge>
          {achievement.points > 0 && (
            <span className="text-yellow-400">+{achievement.points} pts</span>
          )}
        </div>
      </div>
    </div>
  );
}
