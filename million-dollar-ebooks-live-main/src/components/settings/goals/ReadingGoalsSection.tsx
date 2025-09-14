
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { BookOpen } from 'lucide-react';

interface UserGoals {
  id?: string;
  user_id: string;
  reading_goal?: string;
  writing_goal?: string;
  monthly_reading_target?: number;
  monthly_writing_target?: number;
  created_at?: string;
  updated_at?: string;
}

interface ReadingGoalsSectionProps {
  goals: UserGoals;
  onGoalsChange: (goals: UserGoals) => void;
}

export function ReadingGoalsSection({ goals, onGoalsChange }: ReadingGoalsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <h3 className="font-medium text-gray-900 dark:text-white">Reading Goals</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="reading_goal" className="text-gray-900 dark:text-white">
            What do you want to accomplish with your reading?
          </Label>
          <Textarea
            id="reading_goal"
            placeholder="e.g., Read more fiction to improve my creative writing, expand my knowledge in business..."
            value={goals.reading_goal || ''}
            onChange={(e) => onGoalsChange({ ...goals, reading_goal: e.target.value })}
            className="mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="monthly_reading_target" className="text-gray-900 dark:text-white">
            Books per month target
          </Label>
          <Input
            id="monthly_reading_target"
            type="number"
            min="1"
            value={goals.monthly_reading_target || 2}
            onChange={(e) => onGoalsChange({ ...goals, monthly_reading_target: parseInt(e.target.value) || 2 })}
            className="mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>
      </div>
    </div>
  );
}
