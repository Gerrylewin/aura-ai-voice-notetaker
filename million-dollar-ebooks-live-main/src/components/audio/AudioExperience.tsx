
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

interface AudioExperienceProps {
  content: string;
  title: string;
  onClose: () => void;
}

export function AudioExperience({ content, title, onClose }: AudioExperienceProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentences, setSentences] = useState<string[]>([]);
  const [fadeClass, setFadeClass] = useState('opacity-100');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Split content into sentences
  useEffect(() => {
    const sentenceArray = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
    setSentences(sentenceArray);
  }, [content]);

  // Simulate audio playback with text progression
  const startAudioPlayback = () => {
    setIsPlaying(true);
    
    intervalRef.current = setInterval(() => {
      setCurrentSentenceIndex(prev => {
        if (prev >= sentences.length - 1) {
          setIsPlaying(false);
          return 0;
        }
        
        // Trigger fade effect
        setFadeClass('opacity-50');
        setTimeout(() => setFadeClass('opacity-100'), 300);
        
        return prev + 1;
      });
    }, 3000); // 3 seconds per sentence
  };

  const pauseAudioPlayback = () => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      pauseAudioPlayback();
    } else {
      startAudioPlayback();
    }
  };

  const skipForward = () => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(prev => prev + 1);
      setFadeClass('opacity-50');
      setTimeout(() => setFadeClass('opacity-100'), 300);
    }
  };

  const skipBackward = () => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(prev => prev - 1);
      setFadeClass('opacity-50');
      setTimeout(() => setFadeClass('opacity-100'), 300);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const currentSentence = sentences[currentSentenceIndex] || '';

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      {/* Dimmed overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black/80" />
      
      {/* Audio experience content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8">
        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-white hover:bg-white/20 z-20"
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Book title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Audio Preview</h1>
          <h2 className="text-lg md:text-xl text-white/80">{title}</h2>
        </div>

        {/* Current sentence display */}
        <div className="flex-1 flex items-center justify-center max-w-4xl mx-auto">
          <div 
            className={`text-center transition-opacity duration-300 ${fadeClass}`}
          >
            <p className="text-xl md:text-3xl lg:text-4xl text-white leading-relaxed font-light tracking-wide">
              {currentSentence}
            </p>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-white/60">
            <span className="text-sm">
              {currentSentenceIndex + 1} of {sentences.length}
            </span>
            <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white/80 transition-all duration-300 ease-out"
                style={{ 
                  width: `${((currentSentenceIndex + 1) / sentences.length) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* Audio controls */}
        <div className="flex items-center gap-6">
          <Button
            onClick={skipBackward}
            disabled={currentSentenceIndex === 0}
            variant="ghost"
            size="lg"
            className="text-white hover:bg-white/20 disabled:opacity-30"
          >
            <SkipBack className="w-6 h-6" />
          </Button>

          <Button
            onClick={togglePlayback}
            variant="ghost"
            size="lg"
            className="text-white hover:bg-white/20 bg-white/10 rounded-full p-4"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </Button>

          <Button
            onClick={skipForward}
            disabled={currentSentenceIndex >= sentences.length - 1}
            variant="ghost"
            size="lg"
            className="text-white hover:bg-white/20 disabled:opacity-30"
          >
            <SkipForward className="w-6 h-6" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            {isPlaying ? 'Audio simulation playing...' : 'Press play to start audio preview'}
          </p>
        </div>
      </div>
    </div>
  );
}
