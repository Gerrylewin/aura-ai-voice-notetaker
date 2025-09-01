import { useState, useRef, useCallback } from 'react';

export const useAudioRecorder = (onStop) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = useCallback(async () => {
    if (isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onStop(audioBlob);
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
        console.error("Failed to get user media", err);
        throw new Error("Microphone access was denied.");
    }
  }, [isRecording, onStop]);

  const stopRecording = useCallback(() => {
    if (!isRecording || !mediaRecorderRef.current) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }, [isRecording]);

  return { isRecording, startRecording, stopRecording };
};