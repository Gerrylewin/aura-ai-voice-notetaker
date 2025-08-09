
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, PenTool, BookOpen, Crown } from 'lucide-react';

interface UserRoleIndicatorProps {
  profile: {
    user_role: string;
    is_verified?: boolean;
  } | null;
}

export function UserRoleIndicator({ profile }: UserRoleIndicatorProps) {
  if (!profile) return null;

  const getRoleDisplay = () => {
    switch (profile.user_role) {
      case 'admin':
        return {
          label: 'Admin',
          icon: Crown,
          variant: 'destructive' as const,
          className: 'bg-red-600 text-white'
        };
      case 'moderator':
        return {
          label: 'Moderator',
          icon: Shield,
          variant: 'default' as const,
          className: 'bg-blue-600 text-white'
        };
      case 'writer':
        return {
          label: 'Writer',
          icon: PenTool,
          variant: 'secondary' as const,
          className: 'bg-purple-600 text-white'
        };
      default:
        return {
          label: 'Reader',
          icon: BookOpen,
          variant: 'outline' as const,
          className: 'bg-gray-600 text-white'
        };
    }
  };

  const role = getRoleDisplay();
  const Icon = role.icon;

  return (
    <Badge variant={role.variant} className={`text-xs ${role.className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {role.label}
      {profile.is_verified && <span className="ml-1">✓</span>}
    </Badge>
  );
}
