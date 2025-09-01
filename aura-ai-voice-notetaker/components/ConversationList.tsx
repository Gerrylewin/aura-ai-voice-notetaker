
import React from 'react';
import { Conversation } from '../types';
import { TrashIcon } from './icons';

interface ConversationListProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({ conversations, onSelectConversation, onDeleteConversation }) => {
  if (conversations.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8">
        <p>Your recorded notes will appear here.</p>
      </div>
    );
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this note?')) {
        onDeleteConversation(id);
    }
  }

  return (
    <div className="w-full max-w-md">
      <h2 className="text-lg font-semibold text-gray-300 mb-4">Past Notes</h2>
      <ul className="space-y-3">
        {conversations.map((convo) => (
          <li
            key={convo.id}
            onClick={() => onSelectConversation(convo.id)}
            className="group flex justify-between items-center bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors duration-200"
          >
            <div>
              <p className="font-medium text-gray-100">{convo.title}</p>
              <p className="text-sm text-gray-400">{new Date(convo.createdAt).toLocaleDateString()}</p>
            </div>
            <button 
                onClick={(e) => handleDelete(e, convo.id)}
                className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete note"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
