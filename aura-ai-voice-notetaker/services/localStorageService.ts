import { Conversation } from '../types';

const GUEST_NOTES_KEY = 'aura-guest-notes';

// Fetch all conversations for a guest user, sorted by creation date
export const getLocalConversations = (): Conversation[] => {
    try {
        const notesJson = localStorage.getItem(GUEST_NOTES_KEY);
        if (notesJson) {
            const notes = JSON.parse(notesJson);
            // Ensure notes are sorted newest first
            return notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
    } catch (error) {
        console.error("Failed to parse guest notes from localStorage:", error);
    }
    return [];
};

// Save (create or update) a conversation
export const saveLocalConversation = (conversation: Conversation): Conversation => {
    const conversations = getLocalConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);

    if (existingIndex > -1) {
        conversations[existingIndex] = conversation;
    } else {
        conversations.unshift(conversation); // Add new notes to the beginning
    }

    localStorage.setItem(GUEST_NOTES_KEY, JSON.stringify(conversations));
    return conversation;
};

// Delete a conversation
export const deleteLocalConversation = (conversationId: string): void => {
    let conversations = getLocalConversations();
    conversations = conversations.filter(c => c.id !== conversationId);
    localStorage.setItem(GUEST_NOTES_KEY, JSON.stringify(conversations));
};
