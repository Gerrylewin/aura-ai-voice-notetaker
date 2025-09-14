
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { useUnreadChatMessages } from '@/hooks/chat/useUnreadChatMessages';
import { AuthModal } from '@/components/auth/AuthModal';
import { IRCChat } from '@/components/chat/IRCChat';
import { HeaderLogo } from './navigation/HeaderLogo';
import { MainNavigation } from './navigation/MainNavigation';
import { NotificationBell } from './navigation/NotificationBell';
import { UserMenu } from './navigation/UserMenu';
import { MobileMenu } from './navigation/MobileMenu';
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar';
import { DevelopmentBanner } from './DevelopmentBanner';
import { useMobileUtils } from '@/hooks/useMobileUtils';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showIRCChat, setShowIRCChat] = useState(false);
  const { user, profile, signOut } = useAuth();
  const { unreadCount: userUnreadCount } = useUserNotifications();
  const { unreadCount: adminUnreadCount } = useAdminNotifications();
  const { markAsRead } = useUnreadChatMessages();
  const { isMobile } = useMobileUtils();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleJoinNewsletter = () => {
    window.open('https://mail.dollarebooks.app', '_blank');
    setIsMenuOpen(false);
  };

  const handleShowIRCChat = () => {
    setShowIRCChat(true);
    markAsRead();
  };

  const totalNotifications = userUnreadCount + (profile?.user_role === 'admin' || profile?.user_role === 'moderator' ? adminUnreadCount : 0);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          {/* Single line with logo, search, and user actions */}
          <div className="h-16 flex items-center justify-between gap-2 md:gap-4">
            {/* Logo and Nav Links */}
            <div className="flex items-center shrink-0">
              <HeaderLogo />
              {!isMobile && (
                <MainNavigation />
              )}
            </div>

            {/* Search bar in the center - maximized width on mobile */}
            <div className={`flex-1 ${isMobile ? 'max-w-none mx-1' : 'max-w-4xl mx-4'}`}>
              <GlobalSearchBar />
            </div>

            {/* User actions - tighter spacing on mobile */}
            <div className={`flex items-center shrink-0 ${isMobile ? 'gap-1' : 'gap-2 md:gap-4'}`}>
              {user ? (
                <>
                  {/* Show notification bell on all screen sizes */}
                  <NotificationBell 
                    totalNotifications={totalNotifications}
                    onNavigateToDashboard={() => navigate('/dashboard')}
                  />
                  {/* User menu only on desktop */}
                  <div className="hidden md:block">
                    <UserMenu />
                  </div>
                </>
              ) : (
                <div className="hidden md:block">
                  <Button variant="default" size="sm" onClick={() => setShowAuthModal(true)}>
                    Sign In
                  </Button>
                </div>
              )}

              {/* Mobile menu button */}
              <div className="md:hidden relative shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
                
                <MobileMenu
                  user={user}
                  isMenuOpen={isMenuOpen}
                  onShowIRCChat={handleShowIRCChat}
                  onCloseMenu={() => setIsMenuOpen(false)}
                  onShowAuthModal={() => setShowAuthModal(true)}
                  onSignOut={handleSignOut}
                  onJoinNewsletter={handleJoinNewsletter}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <DevelopmentBanner />

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      <Dialog open={showIRCChat} onOpenChange={setShowIRCChat}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <IRCChat />
        </DialogContent>
      </Dialog>
    </>
  );
}
