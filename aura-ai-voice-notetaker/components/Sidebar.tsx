import React from 'react';
import { ConversationList } from './ConversationList';
import { LogoutIcon, XMarkIcon, PlusIcon } from './icons';

export const Sidebar = ({ 
    user, 
    conversations, 
    onSelectConversation, 
    onDeleteConversation, 
    onLogout, 
    onLoginClick,
    isOpen, 
    onClose 
}) => {
    const handleNewNote = () => {
        onSelectConversation(null);
        onClose(); // Close sidebar on mobile after action
    };

    const handleSelectNote = (id) => {
        onSelectConversation(id);
        onClose(); // Close sidebar on mobile after action
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`fixed inset-0 bg-black/60 z-20 md:hidden ${isOpen ? 'block' : 'hidden'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <aside className={`fixed top-0 left-0 h-full w-72 bg-gray-800 text-gray-100 flex flex-col z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <header className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <h1 className="text-2xl font-bold tracking-tighter cursor-pointer" onClick={handleNewNote}>
                        Aura
                    </h1>
                    <button onClick={onClose} className="md:hidden p-1 text-gray-400 hover:text-white" aria-label="Close menu">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="p-4 flex-shrink-0">
                    <button onClick={handleNewNote} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <PlusIcon className="w-5 h-5" />
                        New Note
                    </button>
                </div>
                
                <nav className="flex-1 overflow-y-auto px-2">
                    <h2 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Past Notes</h2>
                    <ConversationList 
                        conversations={conversations}
                        onSelectConversation={handleSelectNote}
                        onDeleteConversation={onDeleteConversation}
                    />
                </nav>

                <footer className="p-4 border-t border-gray-700 flex-shrink-0">
                    {user ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                                    {user.email.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm text-gray-300 truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center justify-start text-gray-400">
                                <button onClick={onLogout} className="flex items-center gap-2 hover:text-white transition-colors text-sm" title="Logout">
                                    <LogoutIcon className="w-5 h-5" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={onLoginClick}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                            Login / Sign Up
                        </button>
                    )}
                </footer>
            </aside>
        </>
    );
};
