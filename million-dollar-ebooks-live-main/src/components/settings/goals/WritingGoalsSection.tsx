
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { PenTool } from 'lucide-react';

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

interface WritingGoalsSectionProps {
  goals: UserGoals;
  onGoalsChange: (goals: UserGoals) => void;
}

export function WritingGoalsSection({ goals, onGoalsChange }: WritingGoalsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <PenTool className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <h3 className="font-medium text-gray-900 dark:text-white">Writing Goals</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="writing_goal" className="text-gray-900 dark:text-white">
            What do you want to accomplish with your writing?
          </Label>
          <Textarea
            id="writing_goal"
            placeholder="e.g., Publish my first novel, build an audience for my short stories, improve my writing skills..."
            value={goals.writing_goal || ''}
            onChange={(e) => onGoalsChange({ ...goals, writing_goal: e.target.value })}
            className="mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="monthly_writing_target" className="text-gray-900 dark:text-white">
            Stories/books per month target
          </Label>
          <Input
            id="monthly_writing_target"
            type="number"
            min="1"
            value={goals.monthly_writing_target || 1}
            onChange={(e) => onGoalsChange({ ...goals, monthly_writing_target: parseInt(e.target.value) || 1 })}
            className="mt-2 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          />
        </div>
      </div>
    </div>
  );
}
