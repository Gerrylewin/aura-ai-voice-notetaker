import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Book, User, ArrowLeft, Mail, CheckCircle, PenTool, BookOpen } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'reader' | 'writer';
}

export function AuthModal({ isOpen, onClose, defaultTab = 'reader' }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [showUserTypeSelection, setShowUserTypeSelection] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'reader' | 'writer'>(defaultTab);
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  // User type synchronization with defaultTab
  React.useEffect(() => {
    setUserType(defaultTab);
  }, [defaultTab]);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setShowUserTypeSelection(isSignUp);
    } else {
      resetForm();
    }
  }, [isOpen, isSignUp]);

  // Sign up flow with user type selection
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Starting signup process with:', { email, userType, displayName });
      
      if (!email || !password || !displayName) {
        throw new Error('Please fill in all required fields');
      }

      const userData = {
        display_name: displayName,
        user_role: userType,
      };

      const { data, error } = await signUp(email, password, userData);
      
      if (error) {
        console.error('Signup error:', error);
        throw error;
      }
      
      console.log('Signup successful:', data);
      
      if (data.user && !data.user.email_confirmed_at) {
        // Show email confirmation message
        setShowEmailConfirmation(true);
        setShowUserTypeSelection(false);
        
        toast({
          title: 'Account created successfully!',
          description: `Please check your email at ${email} and click the confirmation link to complete your ${userType} setup.`,
        });
      } else {
        // If email is already confirmed, redirect to onboarding
        window.location.href = `/onboarding?type=${userType}&confirmed=true`;
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Error creating account',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Sign in flow
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        throw new Error('Please enter your email and password');
      }

      const { data, error } = await signIn(email, password);
      
      if (error) throw error;
      
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
      onClose();
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Password reset flow
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      toast({
        title: 'Reset email sent!',
        description: 'Check your email for password reset instructions.',
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Form reset utility
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setShowForgotPassword(false);
    setShowEmailConfirmation(false);
    setShowUserTypeSelection(true);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleModeSwitch = () => {
    setIsSignUp(!isSignUp);
    setShowUserTypeSelection(!isSignUp); // Show user type selection for signup
    resetForm();
  };

  // Email confirmation screen
  if (showEmailConfirmation) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Check Your Email!
            </DialogTitle>
          </DialogHeader>

          <div className="text-center space-y-4">
            <Mail className="w-16 h-16 mx-auto text-blue-500" />
            <div className="space-y-2">
              <p className="text-lg font-medium">Almost there! Just one more step.</p>
              <p className="text-gray-300">
                We've sent a confirmation email to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-400">
                Click the "Continue {userType === 'writer' ? 'Writer' : 'Reader'} Setup" link in your email to complete your account and start your onboarding.
              </p>
            </div>
            
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 text-sm">
              <p className="text-blue-300">
                <strong>Next:</strong> Check your email inbox (and spam folder) for the confirmation link.
              </p>
            </div>

            <Button
              onClick={handleClose}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Forgot password screen
  if (showForgotPassword) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Reset Password
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="bg-gray-800 border-gray-600"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setShowForgotPassword(false)}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // User type selection screen (for signup)
  if (isSignUp && showUserTypeSelection) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              Choose Your Account Type
            </DialogTitle>
            <p className="text-center text-gray-400 text-sm">
              Select how you'd like to use Million Dollar eBooks
            </p>
          </DialogHeader>

          <div className="space-y-4">
            <RadioGroup value={userType} onValueChange={(value: 'reader' | 'writer') => setUserType(value)}>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border border-gray-600 rounded-lg hover:border-blue-500 transition-colors">
                  <RadioGroupItem value="reader" id="reader" />
                  <Label htmlFor="reader" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-6 h-6 text-blue-500" />
                      <div>
                        <div className="font-semibold">I'm a Reader</div>
                        <div className="text-sm text-gray-400">Discover amazing books and connect with authors</div>
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-gray-600 rounded-lg hover:border-red-500 transition-colors">
                  <RadioGroupItem value="writer" id="writer" />
                  <Label htmlFor="writer" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <PenTool className="w-6 h-6 text-red-500" />
                      <div>
                        <div className="font-semibold">I'm a Writer</div>
                        <div className="text-sm text-gray-400">Share your stories and earn from your creativity</div>
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            <Button
              onClick={() => setShowUserTypeSelection(false)}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Continue as {userType === 'writer' ? 'Writer' : 'Reader'}
            </Button>
          </div>

          <div className="text-center">
            <Button
              variant="link"
              onClick={handleModeSwitch}
              className="text-gray-400 hover:text-white"
            >
              Already have an account? Sign in
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Main auth form
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {isSignUp ? `Create ${userType === 'writer' ? 'Writer' : 'Reader'} Account` : 'Welcome Back'}
          </DialogTitle>
          {isSignUp && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              {userType === 'writer' ? (
                <>
                  <PenTool className="w-4 h-4 text-red-500" />
                  <span>Writer Account</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>Reader Account</span>
                </>
              )}
              <Button
                variant="link"
                onClick={() => setShowUserTypeSelection(true)}
                className="text-blue-400 hover:text-blue-300 p-0 h-auto text-sm"
              >
                Change
              </Button>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-4">
          {/* Display name field for signup */}
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={userType === 'writer' ? 'Your pen name or real name' : 'What should we call you?'}
                required
                className="bg-gray-800 border-gray-600"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-800 border-gray-600"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-gray-800 border-gray-600"
            />
          </div>

          {!isSignUp && (
            <div className="text-right">
              <Button
                type="button"
                variant="link"
                onClick={() => setShowForgotPassword(true)}
                className="text-gray-400 hover:text-white text-sm p-0 h-auto"
              >
                Forgot password?
              </Button>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isSignUp ? `Create ${userType === 'writer' ? 'Writer' : 'Reader'} Account` : 'Sign In')}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={handleModeSwitch}
            className="text-gray-400 hover:text-white"
          >
            {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
