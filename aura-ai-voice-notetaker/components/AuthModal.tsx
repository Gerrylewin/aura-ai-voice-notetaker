import React from 'react';
import { XMarkIcon } from './icons';

export const AuthModal = ({ children, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="relative"
        onClick={e => e.stopPropagation()} // Prevent clicks inside from closing the modal
      >
        {children}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Close authentication form"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
