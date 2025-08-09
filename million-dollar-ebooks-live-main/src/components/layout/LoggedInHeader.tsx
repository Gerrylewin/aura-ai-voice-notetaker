
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, User, LogOut, Settings, Shield, Book, Home, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DevelopmentBanner } from './DevelopmentBanner';

export function LoggedInHeader() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'library', label: 'My Library', icon: Book, path: '/library' },
    { id: 'discover', label: 'Discover', icon: TrendingUp, path: '/discover' },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    setActiveTab(tab.id);
    if (tab.path === '/dashboard') {
      navigate('/dashboard');
    }
    // Other paths can be implemented later
  };

  return (
    <>
      <header className="bg-gray-900 border-b border-gray-800 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left side - Burger menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Menu className="w-5 h-5" />
              </Button>
              
              {/* Navigation tabs */}
              <nav className="hidden md:flex space-x-1">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTabClick(tab)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </Button>
                ))}
              </nav>
            </div>

            {/* Right side - User account */}
            <div className="flex items-center space-x-4">
              <span className="hidden md:block text-gray-300 text-sm">
                Welcome, {profile?.display_name || user?.email?.split('@')[0]}
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ''} />
                      <AvatarFallback className="bg-red-600 text-white">
                        {profile?.display_name?.charAt(0) || user?.email?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end">
                  <DropdownMenuItem 
                    onClick={() => navigate('/dashboard')}
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  {(profile?.user_role === 'admin' || profile?.user_role === 'moderator') && (
                    <DropdownMenuItem 
                      onClick={() => navigate('/admin/dashboard')}
                      className="text-gray-300 hover:text-white hover:bg-gray-800"
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      {profile?.user_role === 'admin' ? 'Admin Panel' : 'Moderator Panel'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-gray-800">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="text-gray-300 hover:text-white hover:bg-gray-800"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      <DevelopmentBanner />
    </>
  );
}
