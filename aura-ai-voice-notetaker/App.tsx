import React, { useState, useEffect, useCallback } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { NoteScreen } from './components/NoteScreen';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AuthScreen } from './components/AuthScreen';
import { AuthModal } from './components/AuthModal';
import { MenuIcon } from './components/icons';
import { getConversations as getConversationsFromDB, saveConversation as saveConversationToDB, deleteConversation as deleteConversationFromDB } from './services/firestoreService';
import { getLocalConversations, saveLocalConversation, deleteLocalConversation } from './services/localStorageService';
import { Loader } from './components/Loader';
import { Sidebar } from './components/Sidebar';

const AppContent = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    setIsLoadingNotes(true);
    setActiveConversationId(null);
    if (user) {
      getConversationsFromDB(user.uid)
        .then(fetchedConversations => {
          setConversations(fetchedConversations);
        })
        .catch(error => {
          console.error("Failed to fetch conversations:", error);
          setConversations([]);
        })
        .finally(() => {
          setIsLoadingNotes(false);
        });
    } else {
      setConversations(getLocalConversations());
      setIsLoadingNotes(false);
    }
  }, [user]);

  // Close auth modal on successful login
  useEffect(() => {
    if (user) {
      setIsAuthModalOpen(false);
    }
  }, [user]);

  const handleSaveConversation = useCallback(async (conversation) => {
    if (user) {
      await saveConversationToDB(user.uid, conversation);
    } else {
      saveLocalConversation(conversation);
    }

    const existingIndex = conversations.findIndex(c => c.id === conversation.id);
    let newConversations;
    if (existingIndex > -1) {
      newConversations = [...conversations];
      newConversations[existingIndex] = conversation;
    } else {
      newConversations = [conversation, ...conversations];
    }
    setConversations(newConversations);
  }, [conversations, user]);
  
  const handleNewConversation = useCallback(async (conversation) => {
    let savedConversation;
    if (user) {
        savedConversation = await saveConversationToDB(user.uid, conversation);
    } else {
        savedConversation = saveLocalConversation(conversation);
    }

    const newConversations = [savedConversation, ...conversations];
    setConversations(newConversations);
    setActiveConversationId(savedConversation.id);
  }, [conversations, user]);

  const handleDeleteConversation = useCallback(async (id) => {
    const originalConversations = conversations;
    const newConversations = conversations.filter(c => c.id !== id);
    setConversations(newConversations);
    try {
      if (user) {
        await deleteConversationFromDB(user.uid, id);
      } else {
        deleteLocalConversation(id);
      }
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      setConversations(originalConversations);
    }
  }, [conversations, user, activeConversationId]);

  if (authLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <Loader message="Initializing Aura..." />
      </div>
    );
  }

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="bg-gray-900 text-gray-100 h-screen font-sans flex">
        <Sidebar
            user={user}
            conversations={conversations}
            onSelectConversation={setActiveConversationId}
            onDeleteConversation={handleDeleteConversation}
            onLogout={logout}
            onLoginClick={() => setIsAuthModalOpen(true)}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
             {/* Mobile Header */}
            <header className="md:hidden flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700 sticky top-0 z-10">
                <h1 className="text-xl font-semibold truncate">
                    {activeConversation ? activeConversation.title : 'New Note'}
                </h1>
                <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-gray-400 hover:text-white" aria-label="Open menu">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto">
                {isLoadingNotes ? 
                    <div className="h-full flex items-center justify-center"><Loader message="Loading your notes..." /></div> :
                    activeConversation ? (
                        <NoteScreen 
                            conversation={activeConversation}
                            onSave={handleSaveConversation}
                            onNewConversation={handleNewConversation}
                        />
                    ) : (
                        <HomeScreen
                            onNewConversation={handleNewConversation}
                        />
                    )
                }
            </main>
        </div>
        {isAuthModalOpen && (
            <AuthModal onClose={() => setIsAuthModalOpen(false)}>
                <AuthScreen />
            </AuthModal>
        )}
    </div>
  );
};


const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
