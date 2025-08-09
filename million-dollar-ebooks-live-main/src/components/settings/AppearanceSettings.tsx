
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette } from 'lucide-react';

export function AppearanceSettings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Palette className="w-5 h-5" />
          Appearance
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Customize the look and feel of your interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
          <div className="space-y-0.5">
            <Label className="text-gray-900 dark:text-white font-medium">Dark Mode</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Toggle between light and dark themes
            </p>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={toggleTheme}
            className="data-[state=checked]:bg-red-600"
          />
        </div>
      </CardContent>
    </Card>
  );
}
