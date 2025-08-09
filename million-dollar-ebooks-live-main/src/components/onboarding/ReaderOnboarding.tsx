
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { BookOpen, Target, CheckCircle } from 'lucide-react';

interface ReaderOnboardingProps {
  onComplete: () => void;
}

export function ReaderOnboarding({ onComplete }: ReaderOnboardingProps) {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    display_name: '',
    bio: '',
  });

  const [goalsData, setGoalsData] = useState({
    reading_goal: '',
    monthly_reading_target: 2,
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // Update profile
      await updateProfile({
        ...profileData,
        profile_completed: true
      });

      // Save goals
      if (user?.id) {
        const { error: goalsError } = await supabase
          .from('user_goals')
          .upsert({
            user_id: user.id,
            reading_goal: goalsData.reading_goal,
            monthly_reading_target: goalsData.monthly_reading_target
          });

        if (goalsError) throw goalsError;
      }

      toast({
        title: 'Welcome to Million Dollar eBooks!',
        description: 'Your reader profile has been set up successfully.',
      });

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete onboarding',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const isStep1Complete = profileData.display_name && profileData.bio;
  const isStep2Complete = goalsData.reading_goal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            Welcome, Reader!
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Let's set up your reading journey with a few quick questions.
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center space-x-4 pt-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isStep1Complete ? 'bg-red-600 border-red-600 text-white' : 'border-gray-400'}`}>
                {isStep1Complete ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span>Profile</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isStep2Complete ? 'bg-red-600 border-red-600 text-white' : 'border-gray-400'}`}>
                {isStep2Complete ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <span>Reading Goals</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="display_name" className="text-gray-900 dark:text-white">What should we call you? *</Label>
                  <Input
                    id="display_name"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Your display name"
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio" className="text-gray-900 dark:text-white">Tell us a bit about yourself *</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="What kind of books do you love? What are your interests?"
                    rows={4}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                  <p className="text-sm text-gray-500 mt-1">This helps other readers and writers connect with you</p>
                </div>
              </div>
              
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!isStep1Complete}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                Continue
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Reading Goals</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reading_goal" className="text-gray-900 dark:text-white">
                    What do you want to accomplish with your reading? *
                  </Label>
                  <Textarea
                    id="reading_goal"
                    placeholder="e.g., Read more fiction to expand my imagination, learn new skills through non-fiction, discover new authors..."
                    value={goalsData.reading_goal}
                    onChange={(e) => setGoalsData(prev => ({ ...prev, reading_goal: e.target.value }))}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="monthly_reading_target" className="text-gray-900 dark:text-white">
                    How many books would you like to read per month?
                  </Label>
                  <Input
                    id="monthly_reading_target"
                    type="number"
                    min="1"
                    value={goalsData.monthly_reading_target}
                    onChange={(e) => setGoalsData(prev => ({ ...prev, monthly_reading_target: parseInt(e.target.value) || 2 }))}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                  <p className="text-sm text-gray-500 mt-1">Don't worry, you can always adjust this later</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={!isStep2Complete || saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {saving ? 'Setting up...' : 'Complete Setup'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
