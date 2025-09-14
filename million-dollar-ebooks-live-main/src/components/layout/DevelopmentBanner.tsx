
import React, { useState } from 'react';
import { AlertTriangle, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function DevelopmentBanner() {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Only show the banner if we're in development mode
  // In production, this would be controlled by an environment variable
  const isDevelopment = false; // Setting to false since app should be working now

  if (!isDevelopment) {
    return null;
  }

  const handleClick = () => {
    navigate('/release-notes');
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative">
      {isExpanded && (
        <div 
          onClick={handleClick}
          className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 cursor-pointer hover:bg-yellow-100 transition-colors"
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-yellow-800 font-medium">
                Under Development - Click to view release notes and updates
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 p-1 h-auto"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
      
      {!isExpanded && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-1">
          <div className="container mx-auto flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-200 p-1 h-auto flex items-center space-x-1"
            >
              <AlertTriangle className="w-3 h-3" />
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
