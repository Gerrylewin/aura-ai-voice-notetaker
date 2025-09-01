import React, { useState, useEffect, useCallback } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { NoteScreen } from './components/NoteScreen';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AuthScreen } from './components/AuthScreen';
import { MenuIcon } from './components/icons';
import { getConversations, saveConversation, deleteConversation as deleteConversationFromDB } from './services/firestoreService';
import { Loader } from './components/Loader';
import { Sidebar } from './components/Sidebar';

const AppContent = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoadingNotes(true);
      getConversations(user.uid)
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
      // Clear data when user logs out
      setConversations([]);
      setActiveConversationId(null);
      setIsLoadingNotes(false);
    }
  }, [user]);

  const handleSaveConversation = useCallback(async (conversation) => {
    if (!user) return;
    try {
      await saveConversation(user.uid, conversation);
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);
      let newConversations;
      if (existingIndex > -1) {
        newConversations = [...conversations];
        newConversations[existingIndex] = conversation;
      } else {
        newConversations = [conversation, ...conversations];
      }
      setConversations(newConversations);
    } catch (error) {
      console.error("Failed to save conversation:", error);
    }
  }, [conversations, user]);
  
  const handleNewConversation = useCallback(async (conversation) => {
    if (!user) return;
    try {
      const savedConversation = await saveConversation(user.uid, conversation);
      const newConversations = [savedConversation, ...conversations];
      setConversations(newConversations);
      setActiveConversationId(savedConversation.id);
    } catch (error) {
      console.error("Failed to create new conversation:", error);
    }
  }, [conversations, user]);

  const handleDeleteConversation = useCallback(async (id) => {
    if (!user) return;
    const originalConversations = conversations;
    const newConversations = conversations.filter(c => c.id !== id);
    setConversations(newConversations);
    try {
      await deleteConversationFromDB(user.uid, id);
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      // Revert if delete fails
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

  if (!user) {
    return <AuthScreen />;
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
    </div>
  );
};


const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;