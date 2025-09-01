import React, { useState, useCallback } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { RecordButton } from './RecordButton';
import { analyzeTranscript, transcribeAudio } from '../services/geminiService';
import { Loader } from './Loader';

export const HomeScreen = ({ onNewConversation }) => {
  const [error, setError] = useState(null);
  const [recordingState, setRecordingState] = useState('idle');

  const handleRecordingStop = useCallback(async (audioBlob) => {
    setRecordingState('transcribing');
    setError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        // FIX: Add type-check for reader.result as it can be an ArrayBuffer.
        if (typeof reader.result !== 'string') {
          console.error("FileReader result is not a string.");
          setError("There was an error processing the recording.");
          setRecordingState('error');
          return;
        }
        const base64Audio = reader.result.split(',')[1];
        const transcript = await transcribeAudio(base64Audio, audioBlob.type);
        
        if (!transcript || transcript.trim().length === 0) {
            setError("The recording was empty or couldn't be transcribed.");
            setRecordingState('error');
            return;
        }

        setRecordingState('analyzing');
        const { title, ...analysis } = await analyzeTranscript(transcript);

        const newConversation = {
          id: new Date().toISOString(),
          title: title,
          createdAt: new Date().toISOString(),
          transcript: transcript,
          analysis: analysis,
          chatHistory: [], // Start with empty history
        };
        onNewConversation(newConversation);
        setRecordingState('idle');
      };
      reader.onerror = () => {
        console.error("Failed to read blob");
        setError("There was an error processing the recording.");
        setRecordingState('error');
      }
    } catch (err) {
      console.error("Transcription or analysis failed:", err);
      setError("Sorry, I couldn't process that. Please try again.");
      setRecordingState('error');
    }
  }, [onNewConversation]);

  const { isRecording, startRecording, stopRecording } = useAudioRecorder(handleRecordingStop);

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      setError(null);
      setRecordingState('recording');
      startRecording().catch(err => {
        console.error("Could not start recording:", err);
        setError("Microphone access denied. Please enable it in your browser settings.");
        setRecordingState('error');
      });
    }
  };
  
  const getStatusMessage = () => {
    switch (recordingState) {
        case 'recording': return "Recording... Tap to stop.";
        case 'transcribing': return "Transcribing your thoughts...";
        case 'analyzing': return "Analyzing your note...";
        case 'error': return error;
        default: return "Tap the microphone to start a new voice note.";
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-2xl flex flex-col items-center text-center">
        <RecordButton isRecording={isRecording} onClick={handleRecordClick} />
        <p className={`mt-6 text-gray-400 h-10 flex items-center justify-center transition-opacity duration-300`}>
          {(recordingState === 'transcribing' || recordingState === 'analyzing') ? <Loader message={getStatusMessage()} /> : getStatusMessage()}
        </p>
      </div>
       <div className="mt-8 text-gray-500 text-center max-w-sm">
        <p>Start a new note by tapping the microphone, or select a previous note from the sidebar.</p>
      </div>
    </div>
  );
};