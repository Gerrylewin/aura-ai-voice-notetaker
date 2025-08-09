
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';
import { WalletConnect } from '@/components/crypto/WalletConnect';
import { PenTool, User, Target, CheckCircle, Wallet, Coins, Upload } from 'lucide-react';

interface WriterOnboardingProps {
  onComplete: () => void;
}

export function WriterOnboarding({ onComplete }: WriterOnboardingProps) {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState({
    display_name: '',
    username: '',
    bio: '',
    avatar_url: null as string | null,
  });

  const [writingData, setWritingData] = useState({
    writingSample1: '',
    writingSample2: '',
    writingSample3: '',
    writingGenres: '',
    previousPublications: '',
    socialMediaLinks: ''
  });

  const [goalsData, setGoalsData] = useState({
    writing_goal: '',
    monthly_writing_target: 1,
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
            writing_goal: goalsData.writing_goal,
            monthly_writing_target: goalsData.monthly_writing_target,
            reading_goal: goalsData.reading_goal,
            monthly_reading_target: goalsData.monthly_reading_target
          });

        if (goalsError) throw goalsError;

        // Save writing samples as author application
        const { error: applicationError } = await supabase
          .from('author_applications')
          .insert({
            display_name: profileData.display_name,
            email: user.email || '',
            bio: profileData.bio,
            writing_samples: [
              writingData.writingSample1,
              writingData.writingSample2,
              writingData.writingSample3
            ].filter(sample => sample.trim()),
            previous_publications: writingData.previousPublications,
            writing_genres: writingData.writingGenres.split(',').map(g => g.trim()).filter(g => g),
            social_media_links: writingData.socialMediaLinks,
            status: 'pending'
          });

        if (applicationError) throw applicationError;
      }

      toast({
        title: 'Welcome to Million Dollar eBooks!',
        description: 'Your writer application has been submitted for review. We\'ll notify you within 48 hours!',
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

  const isStep1Complete = profileData.display_name && profileData.bio && profileData.avatar_url;
  const isStep2Complete = profileData.username;
  const isStep3Complete = writingData.writingSample1 && writingData.writingSample2;
  const isStep4Complete = goalsData.writing_goal;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl text-gray-900 dark:text-white flex items-center gap-2">
            <PenTool className="w-6 h-6" />
            Welcome, Writer!
          </CardTitle>
          <p className="text-gray-600 dark:text-gray-400">
            Join the crypto publishing revolution. Complete your application to start earning 90% in USDC.
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center space-x-2 pt-4 overflow-x-auto">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isStep1Complete ? 'bg-red-600 border-red-600 text-white' : 'border-gray-400'}`}>
                {isStep1Complete ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span className="text-sm">Profile</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isStep2Complete ? 'bg-red-600 border-red-600 text-white' : 'border-gray-400'}`}>
                {isStep2Complete ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <span className="text-sm">Username</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isStep3Complete ? 'bg-red-600 border-red-600 text-white' : 'border-gray-400'}`}>
                {isStep3Complete ? <CheckCircle className="w-4 h-4" /> : '3'}
              </div>
              <span className="text-sm">Writing</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentStep >= 4 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isStep4Complete ? 'bg-red-600 border-red-600 text-white' : 'border-gray-400'}`}>
                {isStep4Complete ? <CheckCircle className="w-4 h-4" /> : '4'}
              </div>
              <span className="text-sm">Goals</span>
            </div>
            <div className={`flex items-center space-x-2 ${currentStep >= 5 ? 'text-red-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2`}>
                5
              </div>
              <span className="text-sm">Wallet</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <ProfileImageUpload
                  userId={user?.id || ''}
                  currentImageUrl={profileData.avatar_url}
                  onImageUpdated={(url) => setProfileData(prev => ({ ...prev, avatar_url: url }))}
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="display_name" className="text-gray-900 dark:text-white">Display Name *</Label>
                  <Input
                    id="display_name"
                    value={profileData.display_name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Your pen name or real name"
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bio" className="text-gray-900 dark:text-white">Author Bio *</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell readers about yourself, your writing background, and what makes you unique as an author..."
                    rows={4}
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                  <p className="text-sm text-gray-500 mt-1">This will be displayed on your public profile and reviewed by our team</p>
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
                <User className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Choose Your Username</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-gray-900 dark:text-white">Username *</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Choose a unique username"
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                  <p className="text-sm text-gray-500 mt-1">This will be part of your profile URL</p>
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
                  onClick={() => setCurrentStep(3)}
                  disabled={!isStep2Complete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Writing Samples</h3>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Provide 2-3 of your best writing samples. These will be reviewed by our editorial team to ensure quality standards.
                </p>
              </div>
              
              <div className="space-y-4">
                {[1, 2, 3].map((num) => (
                  <div key={num} className="space-y-2">
                    <Label htmlFor={`sample${num}`} className="text-gray-900 dark:text-white">
                      Writing Sample #{num} {num <= 2 ? '*' : '(Optional)'}
                    </Label>
                    <Textarea
                      id={`sample${num}`}
                      value={writingData[`writingSample${num}` as keyof typeof writingData]}
                      onChange={(e) => setWritingData(prev => ({ ...prev, [`writingSample${num}`]: e.target.value }))}
                      placeholder={`Paste your ${num === 1 ? 'best' : num === 2 ? 'second-best' : 'third'} writing sample here...`}
                      required={num <= 2}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600 min-h-[150px]"
                    />
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="writingGenres" className="text-gray-900 dark:text-white">Writing Genres</Label>
                    <Input
                      id="writingGenres"
                      value={writingData.writingGenres}
                      onChange={(e) => setWritingData(prev => ({ ...prev, writingGenres: e.target.value }))}
                      placeholder="Fiction, Mystery, Romance, etc."
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="socialMediaLinks" className="text-gray-900 dark:text-white">Social Media / Website</Label>
                    <Input
                      id="socialMediaLinks"
                      value={writingData.socialMediaLinks}
                      onChange={(e) => setWritingData(prev => ({ ...prev, socialMediaLinks: e.target.value }))}
                      placeholder="Twitter, Instagram, personal website, etc."
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="previousPublications" className="text-gray-900 dark:text-white">Previous Publications (Optional)</Label>
                  <Textarea
                    id="previousPublications"
                    value={writingData.previousPublications}
                    onChange={(e) => setWritingData(prev => ({ ...prev, previousPublications: e.target.value }))}
                    placeholder="List any books, articles, or publications you've had published..."
                    className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(4)}
                  disabled={!isStep3Complete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Writing & Reading Goals</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Writing Goals</h4>
                  <div>
                    <Label htmlFor="writing_goal" className="text-gray-900 dark:text-white">
                      What do you want to accomplish with your writing? *
                    </Label>
                    <Textarea
                      id="writing_goal"
                      placeholder="e.g., Publish my first novel, build an audience for my short stories, improve my writing skills..."
                      value={goalsData.writing_goal}
                      onChange={(e) => setGoalsData(prev => ({ ...prev, writing_goal: e.target.value }))}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
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
                      value={goalsData.monthly_writing_target}
                      onChange={(e) => setGoalsData(prev => ({ ...prev, monthly_writing_target: parseInt(e.target.value) || 1 }))}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 dark:text-white">Reading Goals</h4>
                  <div>
                    <Label htmlFor="reading_goal" className="text-gray-900 dark:text-white">
                      What do you want to accomplish with your reading?
                    </Label>
                    <Textarea
                      id="reading_goal"
                      placeholder="e.g., Read more fiction to improve my creative writing, expand my knowledge in business..."
                      value={goalsData.reading_goal}
                      onChange={(e) => setGoalsData(prev => ({ ...prev, reading_goal: e.target.value }))}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
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
                      value={goalsData.monthly_reading_target}
                      onChange={(e) => setGoalsData(prev => ({ ...prev, monthly_reading_target: parseInt(e.target.value) || 2 }))}
                      className="bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(3)}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(5)}
                  disabled={!isStep4Complete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Connect Your Crypto Wallet</h3>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <Coins className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                      Get Paid in USDC
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                      Once approved, you'll earn 90% of each sale in USDC on the Polygon network. 
                      Connect your wallet to start receiving payments!
                    </p>
                    <ul className="text-xs text-green-600 dark:text-green-400 space-y-1">
                      <li>• Instant payments when someone buys your book</li>
                      <li>• Low transaction fees on Polygon</li>
                      <li>• Secure smart contract earnings split</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <WalletConnect />
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(4)}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-gray-600"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {saving ? 'Submitting Application...' : 'Complete Application'}
                </Button>
              </div>

              <p className="text-sm text-gray-500 text-center">
                You can connect your wallet later in Settings. We'll review your application within 48 hours.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
