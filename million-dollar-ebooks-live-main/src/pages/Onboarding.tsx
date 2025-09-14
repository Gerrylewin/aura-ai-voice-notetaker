
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ReaderOnboarding } from '@/components/onboarding/ReaderOnboarding';
import { WriterOnboarding } from '@/components/onboarding/WriterOnboarding';
import { Header } from '@/components/layout/Header';
import { useToast } from '@/hooks/use-toast';

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [onboardingType, setOnboardingType] = useState<'reader' | 'writer'>('reader');

  useEffect(() => {
    const type = searchParams.get('type');
    const confirmed = searchParams.get('confirmed');
    
    if (type === 'writer' || type === 'reader') {
      setOnboardingType(type);
    }
    
    // Show welcome message if user just confirmed their email
    if (confirmed === 'true' && user) {
      toast({
        title: 'Email Confirmed!',
        description: `Welcome to Million Dollar eBooks! Let's complete your ${type || 'reader'} profile.`,
      });
    }
  }, [searchParams, user, toast]);

  useEffect(() => {
    // If user is not logged in, redirect to home
    if (!user) {
      navigate('/');
      return;
    }

    // If profile is already completed, redirect to dashboard
    if (profile?.profile_completed) {
      navigate('/dashboard');
      return;
    }
  }, [user, profile, navigate]);

  const handleOnboardingComplete = () => {
    if (onboardingType === 'writer') {
      toast({
        title: 'Application Submitted!',
        description: 'Your writer application has been submitted for review. We\'ll notify you within 48 hours once approved!',
      });
    }
    navigate('/dashboard');
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-white">
      <Header />
      <div className="pt-20">
        {onboardingType === 'writer' ? (
          <WriterOnboarding onComplete={handleOnboardingComplete} />
        ) : (
          <ReaderOnboarding onComplete={handleOnboardingComplete} />
        )}
      </div>
    </div>
  );
}
