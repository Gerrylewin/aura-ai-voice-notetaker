import React from 'react';
import { TrashIcon } from './icons';

export const ConversationList = ({ conversations, onSelectConversation, onDeleteConversation }) => {
  if (conversations.length === 0) {
    return (
      <div className="text-center text-gray-500 text-sm px-4 py-8">
        <p>Your recorded notes will appear here.</p>
      </div>
    );
  }

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this note?')) {
        onDeleteConversation(id);
    }
  }

  return (
    <ul className="space-y-1">
      {conversations.map((convo) => (
        <li
          key={convo.id}
          onClick={() => onSelectConversation(convo.id)}
          className="group flex justify-between items-center p-2 rounded-md cursor-pointer hover:bg-gray-700 transition-colors duration-200"
        >
          <div className="flex-1 truncate">
            <p className="font-medium text-gray-200 text-sm truncate">{convo.title}</p>
            <p className="text-xs text-gray-400">{new Date(convo.createdAt).toLocaleDateString()}</p>
          </div>
          <button 
              onClick={(e) => handleDelete(e, convo.id)}
              className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0"
              aria-label="Delete note"
          >
              <TrashIcon className="w-5 h-5" />
          </button>
        </li>
      ))}
    </ul>
  );
};