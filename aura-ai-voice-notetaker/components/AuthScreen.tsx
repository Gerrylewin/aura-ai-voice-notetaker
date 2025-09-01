import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export const AuthScreen = () => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
        if (mode === 'login') {
            await login(email, password);
        } else {
            await signup(email, password);
        }
    } catch (err) {
        // Firebase provides more user-friendly error messages
        let message = 'An unexpected error occurred.';
        if (err.code) {
            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    message = 'Invalid email or password.';
                    break;
                case 'auth/email-already-in-use':
                    message = 'An account with this email already exists.';
                    break;
                case 'auth/weak-password':
                    message = 'Password should be at least 6 characters.';
                    break;
                case 'auth/invalid-email':
                    message = 'Please enter a valid email address.';
                    break;
                default:
                    message = 'Authentication failed. Please try again.';
            }
        }
        setError(message);
    } finally {
        setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'signup' : 'login');
    setError(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-100 font-sans p-4">
       <header className="text-center mb-10">
          <h1 className="text-5xl font-bold tracking-tighter">Aura</h1>
          <p className="text-gray-400 mt-2">Your AI-Powered Voice Notetaker</p>
        </header>
        <div className="w-full max-w-sm p-8 bg-gray-800 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-semibold text-center mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-center text-gray-400 text-sm mb-6">
                {mode === 'login' ? 'Log in to see your past conversations.' : 'Sign up to save your voice notes.'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-400">Email Address</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="you@example.com"
                    />
                </div>
                 <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-400">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="mt-1 block w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="••••••••"
                    />
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                       {isLoading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
                    </button>
                </div>
            </form>
            <p className="mt-6 text-center text-sm text-gray-400">
                {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button onClick={toggleMode} className="ml-1 font-medium text-blue-400 hover:text-blue-300">
                    {mode === 'login' ? 'Sign up' : 'Log in'}
                </button>
            </p>
        </div>
    </div>
  );
};