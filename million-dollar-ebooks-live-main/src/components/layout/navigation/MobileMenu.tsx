
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { 
  Home, 
  TrendingUp, 
  BookOpen, 
  MessageSquare, 
  User as UserIcon, 
  Settings, 
  LogOut, 
  Shield,
  Mail,
  HelpCircle,
  FileText
} from 'lucide-react';

interface MobileMenuProps {
  user: User | null;
  isMenuOpen: boolean;
  onShowIRCChat: () => void;
  onCloseMenu: () => void;
  onShowAuthModal: () => void;
  onSignOut: () => void;
  onJoinNewsletter: () => void;
}

export function MobileMenu({ 
  user, 
  isMenuOpen, 
  onShowIRCChat, 
  onCloseMenu, 
  onShowAuthModal, 
  onSignOut,
  onJoinNewsletter 
}: MobileMenuProps) {
  const { profile } = useAuth();
  
  if (!isMenuOpen) return null;

  const hasAdminAccess = profile?.user_role === 'admin' || profile?.user_role === 'moderator';
  const baseAvatarUrl = profile?.avatar_url;
  const avatarUrl = baseAvatarUrl ? `${baseAvatarUrl}?t=${Date.now()}` : null;

  const handleLinkClick = () => {
    onCloseMenu();
  };

  const handleChatClick = () => {
    onShowIRCChat();
    onCloseMenu();
  };

  const handleSignOutClick = () => {
    onSignOut();
    onCloseMenu();
  };

  const handleNewsletterClick = () => {
    onJoinNewsletter();
    onCloseMenu();
  };

  const handleAuthClick = () => {
    onShowAuthModal();
    onCloseMenu();
  };

  return (
    <div className="absolute top-16 right-0 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 p-6">
      {user ? (
        <div className="space-y-6">
          {/* User Profile Section */}
          <div className="flex items-center space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <Avatar className="h-12 w-12">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt="Profile" className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-red-600 text-white text-lg">
                {profile?.display_name?.charAt(0) || user?.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white text-lg">
                {profile?.display_name || user?.email?.split('@')[0]}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <Link 
              to="/dashboard" 
              onClick={handleLinkClick}
              className="flex items-center space-x-4 w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link 
              to="/discover" 
              onClick={handleLinkClick}
              className="flex items-center space-x-4 w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Discover</span>
            </Link>
            
            <Link 
              to="/stories" 
              onClick={handleLinkClick}
              className="flex items-center space-x-4 w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <BookOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Stories</span>
            </Link>
            
            <button
              onClick={handleChatClick}
              className="flex items-center space-x-4 w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Community Chat</span>
            </button>
            
            <Link 
              to="/settings" 
              onClick={handleLinkClick}
              className="flex items-center space-x-4 w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Settings</span>
            </Link>
            
            <Link 
              to="/support" 
              onClick={handleLinkClick}
              className="flex items-center space-x-4 w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Support</span>
            </Link>
            
            <Link 
              to="/release-notes" 
              onClick={handleLinkClick}
              className="flex items-center space-x-4 w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Release Notes</span>
            </Link>
          </div>

          {/* Admin Section */}
          {hasAdminAccess && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link 
                to="/admin" 
                onClick={handleLinkClick}
                className="flex items-center space-x-4 w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Shield className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-600">Admin Panel</span>
              </Link>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <button
              onClick={handleNewsletterClick}
              className="flex items-center justify-center space-x-3 w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <Mail className="w-5 h-5" />
              <span>Join Newsletter</span>
            </button>
            
            <button
              onClick={handleSignOutClick}
              className="flex items-center justify-center space-x-3 w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6 text-center">
          <div className="py-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to Million Dollar eBooks
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Join our community to access all features
            </p>
            <Button 
              onClick={handleAuthClick}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3"
            >
              Sign In / Sign Up
            </Button>
          </div>
          
          <div className="space-y-1 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link 
              to="/support" 
              onClick={handleLinkClick}
              className="flex items-center space-x-4 w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Support</span>
            </Link>
            <button
              onClick={handleNewsletterClick}
              className="flex items-center space-x-4 w-full p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="font-medium">Join Newsletter</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
