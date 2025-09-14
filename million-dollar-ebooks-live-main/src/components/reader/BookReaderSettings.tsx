
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const FONTS = {
  serif: {
    name: 'Serif',
    family: '"Crimson Text", "Times New Roman", serif',
    description: 'Classic book reading'
  },
  sans: {
    name: 'Sans Serif',
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    description: 'Modern and clean'
  },
  cursive: {
    name: 'Cursive',
    family: '"Dancing Script", cursive',
    description: 'Elegant handwriting'
  },
  mono: {
    name: 'Monospace',
    family: '"SF Mono", "Monaco", "Inconsolata", monospace',
    description: 'Fixed-width characters'
  }
};

interface BookReaderSettingsProps {
  showSettings: boolean;
  selectedFont: string;
  onFontChange: (font: string) => void;
  onClose: () => void;
}

export function BookReaderSettings({
  showSettings,
  selectedFont,
  onFontChange,
  onClose
}: BookReaderSettingsProps) {
  const { theme, toggleTheme } = useTheme();

  if (!showSettings) return null;

  return (
    <div className="absolute top-16 right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-80 border border-amber-200 dark:border-amber-600">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reading Settings</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Theme Toggle */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</h4>
        <Button
          onClick={toggleTheme}
          variant="outline"
          className="w-full justify-start"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              Switch to Light Mode
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-2" />
              Switch to Dark Mode
            </>
          )}
        </Button>
      </div>

      {/* Font Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Font Style</h4>
        <div className="space-y-2">
          {Object.entries(FONTS).map(([key, font]) => (
            <button
              key={key}
              onClick={() => onFontChange(key)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedFont === key
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div 
                    className="font-medium text-gray-900 dark:text-white"
                    style={{ fontFamily: font.family }}
                  >
                    {font.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {font.description}
                  </div>
                </div>
                {selectedFont === key && (
                  <Badge variant="secondary">Selected</Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
