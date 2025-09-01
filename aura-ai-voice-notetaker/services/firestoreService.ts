import { db } from './firebase';
import { 
    collection, 
    addDoc,
    doc, 
    setDoc,
    getDocs, 
    deleteDoc,
    query,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import { Conversation } from '../types';

const getConversationsCollection = (userId: string) => {
    return collection(db, 'users', userId, 'conversations');
}

// Fetch all conversations for a user
export const getConversations = async (userId: string): Promise<Conversation[]> => {
    const conversationsCollection = getConversationsCollection(userId);
    const q = query(conversationsCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        } as Conversation;
    });
};

// Save (create or update) a conversation
export const saveConversation = async (userId: string, conversation: Conversation): Promise<Conversation> => {
    const conversationsCollection = getConversationsCollection(userId);
    
    const conversationToSave = {
        ...conversation,
        createdAt: new Date(conversation.createdAt), // Convert ISO string back to Date for Firestore
    };

    if (conversation.id && conversation.id !== new Date(conversation.createdAt).toISOString()) {
        // This is an existing conversation, update it
        const docRef = doc(db, 'users', userId, 'conversations', conversation.id);
        await setDoc(docRef, conversationToSave);
        return conversation; // Return original conversation with existing ID
    } else {
        // This is a new conversation, create it
        const docRef = await addDoc(conversationsCollection, conversationToSave);
        return { ...conversation, id: docRef.id }; // Return with the new Firestore-generated ID
    }
};


// Delete a conversation
export const deleteConversation = async (userId: string, conversationId: string): Promise<void> => {
    const docRef = doc(db, 'users', userId, 'conversations', conversationId);
    await deleteDoc(docRef);
};
