import { db } from './firebase';

// FIX: Update Firestore logic to use v8 namespaced API
const getConversationsCollection = (userId) => {
    return db.collection('users').doc(userId).collection('conversations');
}

// Fetch all conversations for a user
export const getConversations = async (userId) => {
    const conversationsCollection = getConversationsCollection(userId);
    const q = conversationsCollection.orderBy('createdAt', 'desc');
    const snapshot = await q.get();
    
    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            ...data,
            id: doc.id,
            // Firestore timestamps need to be converted to JS Dates
            createdAt: data.createdAt.toDate().toISOString(),
        };
    });
};

// Save (create or update) a conversation
export const saveConversation = async (userId, conversation) => {
    const conversationsCollection = getConversationsCollection(userId);
    
    const conversationToSave = {
        ...conversation,
        createdAt: new Date(conversation.createdAt), // Convert ISO string back to Date for Firestore
    };

    // A simple way to check if it's a new conversation is if the ID is a long timestamp string
    const isNew = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(conversation.id);

    if (!isNew) {
        // This is an existing conversation, update it
        const docRef = conversationsCollection.doc(conversation.id);
        await docRef.set(conversationToSave);
        return conversation; // Return original conversation with existing ID
    } else {
        // This is a new conversation, create it
        // Remove the temporary ID before saving
        delete conversationToSave.id;
        const docRef = await conversationsCollection.add(conversationToSave);
        return { ...conversation, id: docRef.id }; // Return with the new Firestore-generated ID
    }
};


// Delete a conversation
export const deleteConversation = async (userId, conversationId) => {
    const docRef = getConversationsCollection(userId).doc(conversationId);
    await docRef.delete();
};