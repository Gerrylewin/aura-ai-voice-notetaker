
import React, { createContext, useContext } from 'react';
import { AuthContextType } from './auth/types';
import { useAuthState } from './auth/useAuthState';
import { useAuthActions } from './auth/useAuthActions';

/**
 * Authentication context for providing auth state throughout the app
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication Provider component
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('AuthProvider: Rendering');
  
  // Get authentication state management
  const { user, profile, loading, setProfile, refreshProfile } = useAuthState();
  
  console.log('AuthProvider: Auth state:', { user: !!user, profile: !!profile, loading });
  
  // Get authentication action functions
  const { signUp, signIn, signOut, updateProfile, upgradeToWriter } = useAuthActions(
    setProfile,
    user,
    profile
  );

  // Combine all auth-related data and functions
  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    upgradeToWriter,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth called outside of AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
