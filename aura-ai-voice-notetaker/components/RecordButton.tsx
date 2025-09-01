
import React from 'react';
import { MicIcon, StopIcon } from './icons';

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

export const RecordButton: React.FC<RecordButtonProps> = ({ isRecording, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-4
        ${isRecording 
          ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400' 
          : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
      aria-label={isRecording ? 'Stop recording' : 'Start recording'}
    >
      {isRecording && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
      )}
      <div className="relative z-10">
        {isRecording ? <StopIcon className="w-10 h-10 text-white" /> : <MicIcon className="w-10 h-10 text-white" />}
      </div>
    </button>
  );
};
