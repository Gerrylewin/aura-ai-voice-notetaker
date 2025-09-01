import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { auth } from '../services/firebase';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // FIX: Use v8 namespaced API for onAuthStateChanged
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({ email: firebaseUser.email, uid: firebaseUser.uid });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    // FIX: Use v8 namespaced API for signInWithEmailAndPassword
    await auth.signInWithEmailAndPassword(email, password);
  }, []);

  const signup = useCallback(async (email, password) => {
    // FIX: Use v8 namespaced API for createUserWithEmailAndPassword
    await auth.createUserWithEmailAndPassword(email, password);
  }, []);

  const logout = useCallback(async () => {
    // FIX: Use v8 namespaced API for signOut
    await auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};