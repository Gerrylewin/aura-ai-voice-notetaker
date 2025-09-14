import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  BookOpen, 
  PenTool, 
  Wallet, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react';

interface StreamlinedOnboardingProps {
  onComplete: () => void;
}

export function StreamlinedOnboarding({ onComplete }: StreamlinedOnboardingProps) {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [userType, setUserType] = useState<'reader' | 'writer'>('reader');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [walletAddress, setWalletAddress] = useState('');

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Update profile with basic info
      await updateProfile({
        display_name: displayName,
        bio: bio,
        user_role: userType,
        profile_completed: true
      });

      // Save wallet address if provided
      if (walletAddress.trim()) {
        await supabase
          .from('user_wallets')
          .upsert({
            user_id: user.id,
            wallet_address: walletAddress.trim(),
            is_primary: true
          });
      }

      // Save user goals
      await supabase
        .from('user_goals')
        .upsert({
          user_id: user.id,
          reading_goal: userType === 'reader' ? 'Discover amazing books and support authors' : 'Share my stories with the world',
          monthly_reading_target: userType === 'reader' ? 3 : 1,
          monthly_writing_target: userType === 'writer' ? 2 : 0
        });

      toast({
        title: 'Welcome to Million Dollar eBooks! 🎉',
        description: `Your ${userType} profile has been set up successfully.`,
      });

      onComplete();
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to complete onboarding',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isStep1Complete = userType && displayName.trim();
  const isStep2Complete = bio.trim();
  const isStep3Complete = true; // Wallet is optional

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step <= currentStep
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step < currentStep ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      step
                    )}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 h-0.5 mx-2 ${
                        step < currentStep ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: User Type & Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Welcome to Million Dollar eBooks!</h2>
                <p className="text-muted-foreground">
                  Let's get you set up in just 3 quick steps
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">How will you use the platform?</label>
                <RadioGroup value={userType} onValueChange={(value: 'reader' | 'writer') => setUserType(value)}>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-primary transition-colors">
                      <RadioGroupItem value="reader" id="reader" />
                      <Label htmlFor="reader" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-primary" />
                          <div>
                            <div className="font-medium">I'm a Reader</div>
                            <div className="text-sm text-muted-foreground">Discover amazing books and support authors</div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:border-primary transition-colors">
                      <RadioGroupItem value="writer" id="writer" />
                      <Label htmlFor="writer" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <PenTool className="w-5 h-5 text-secondary" />
                          <div>
                            <div className="font-medium">I'm a Writer</div>
                            <div className="text-sm text-muted-foreground">Share my stories and earn from my creativity</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="displayName">What should we call you?</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={userType === 'writer' ? 'Your pen name or real name' : 'Your name'}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Step 2: Bio */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
                <p className="text-muted-foreground">
                  Help other users get to know you
                </p>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder={
                    userType === 'writer' 
                      ? 'Tell us about your writing style, interests, and what readers can expect from your stories...'
                      : 'Tell us about your reading interests, favorite genres, and what you look for in a great book...'
                  }
                  className="mt-2 min-h-[120px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be visible on your profile
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Wallet (Optional) */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                <p className="text-muted-foreground">
                  Optional: Connect a crypto wallet to earn USDC from your content
                </p>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Wallet className="w-5 h-5 text-accent" />
                  <div>
                    <div className="font-medium text-accent">Crypto Benefits</div>
                    <div className="text-sm text-muted-foreground">
                      {userType === 'writer' 
                        ? 'Earn 90% of every sale in USDC instantly'
                        : 'Support authors directly with crypto payments'
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="walletAddress">Wallet Address (Optional)</Label>
                <Input
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can add this later in your profile settings
                </p>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div>
                    <div className="font-medium text-primary">You're all set!</div>
                    <div className="text-sm text-muted-foreground">
                      Start exploring the world's first decentralized publishing platform
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 1 && !isStep1Complete) ||
                  (currentStep === 2 && !isStep2Complete)
                }
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                {loading ? 'Setting up...' : 'Complete Setup'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
