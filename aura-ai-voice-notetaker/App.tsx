import React, { useState, useEffect, useCallback } from 'react';
import { HomeScreen } from './components/HomeScreen';
import { NoteScreen } from './components/NoteScreen';
import { Conversation } from './types';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { AuthScreen } from './components/AuthScreen';
import { LogoutIcon } from './components/icons';
import { getConversations, saveConversation, deleteConversation as deleteConversationFromDB } from './services/firestoreService';
import { Loader } from './components/Loader';

const AppContent: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

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

  const handleSaveConversation = useCallback(async (conversation: Conversation) => {
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
  
  const handleNewConversation = useCallback(async (conversation: Conversation) => {
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

  const handleDeleteConversation = useCallback(async (id: string) => {
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
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
      <div className="container mx-auto max-w-4xl p-4">
        <header className="flex justify-between items-center py-6">
          <h1 
            className="text-4xl font-bold tracking-tighter cursor-pointer"
            onClick={() => setActiveConversationId(null)}
          >
            Aura
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">{user.email}</span>
            <button onClick={useAuth().logout} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors" title="Logout">
              <LogoutIcon className="w-6 h-6" />
            </button>
          </div>
        </header>
        <main>
          {isLoadingNotes ? <div className="text-center mt-10"><Loader message="Loading your notes..." /></div> :
            activeConversation ? (
              <NoteScreen 
                  conversation={activeConversation}
                  onSave={handleSaveConversation}
                  onBack={() => setActiveConversationId(null)}
              />
            ) : (
              <HomeScreen
                conversations={conversations}
                onNewConversation={handleNewConversation}
                onSelectConversation={setActiveConversationId}
                onDeleteConversation={handleDeleteConversation}
              />
            )
          }
        </main>
      </div>
    </div>
  );
};


const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;