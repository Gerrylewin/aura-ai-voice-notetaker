
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Target, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ReadingGoalsSection } from './ReadingGoalsSection';
import { WritingGoalsSection } from './WritingGoalsSection';
import { GoalsLoadingState } from './GoalsLoadingState';
import { GoalsErrorState } from './GoalsErrorState';

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

export function GoalsForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goals, setGoals] = useState<UserGoals | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserGoals();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchUserGoals = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Fetching goals for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle no data gracefully

      if (error) {
        console.error('Error fetching user goals:', error);
        setError(`Failed to load your goals: ${error.message}`);
        return;
      }

      if (data) {
        console.log('Goals found:', data);
        setGoals(data);
      } else {
        console.log('No goals found, setting defaults');
        // Initialize with default goals
        setGoals({
          user_id: user.id,
          reading_goal: '',
          writing_goal: '',
          monthly_reading_target: 2,
          monthly_writing_target: 1,
        });
      }
    } catch (error) {
      console.error('Error in fetchUserGoals:', error);
      setError('Failed to load your goals');
    } finally {
      setLoading(false);
    }
  };

  const saveGoals = async () => {
    if (!goals || !user?.id) return;

    setSaving(true);
    try {
      console.log('Saving goals:', goals);
      
      const { error } = await supabase
        .from('user_goals')
        .upsert({
          user_id: user.id,
          reading_goal: goals.reading_goal,
          writing_goal: goals.writing_goal,
          monthly_reading_target: goals.monthly_reading_target,
          monthly_writing_target: goals.monthly_writing_target,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving goals:', error);
        throw error;
      }

      console.log('Goals saved successfully');
      toast({
        title: "Goals Updated",
        description: "Your goals have been saved successfully.",
      });
      
      await fetchUserGoals(); // Refresh the data
    } catch (error) {
      console.error('Error saving goals:', error);
      toast({
        title: "Error",
        description: "Failed to save your goals.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            Please log in to set your goals.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return <GoalsLoadingState />;
  }

  if (error) {
    return (
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            {error}
          </div>
          <div className="text-center mt-4">
            <Button onClick={fetchUserGoals} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!goals) {
    return <GoalsErrorState />;
  }

  return (
    <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
          <Target className="w-5 h-5" />
          Personal Goals
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Set your reading and writing goals to track your progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ReadingGoalsSection goals={goals} onGoalsChange={setGoals} />

        {profile?.user_role === 'writer' && (
          <WritingGoalsSection goals={goals} onGoalsChange={setGoals} />
        )}

        <Button 
          onClick={saveGoals} 
          disabled={saving}
          className="bg-red-600 hover:bg-red-700 w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Goals'}
        </Button>
      </CardContent>
    </Card>
  );
}
