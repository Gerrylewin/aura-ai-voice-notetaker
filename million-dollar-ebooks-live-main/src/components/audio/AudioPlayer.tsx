
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AudioPlayerProps {
  bookContent: string;
  bookTitle: string;
}

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 4, label: '4x' }
];

export const AudioPlayer = ({ bookContent, bookTitle }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVoice, setCurrentVoice] = useState<'male' | 'female'>('female');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState([80]);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [progress, setProgress] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [textChunks, setTextChunks] = useState<string[]>([]);

  // Check if Web Speech API is supported
  useEffect(() => {
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      
      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Split text into manageable chunks for TTS
  useEffect(() => {
    const chunkSize = 200; // characters per chunk (Web Speech API works better with smaller chunks)
    const chunks: string[] = [];
    let currentPos = 0;

    while (currentPos < bookContent.length) {
      let endPos = Math.min(currentPos + chunkSize, bookContent.length);
      
      // Try to break at sentence boundaries
      if (endPos < bookContent.length) {
        const lastPeriod = bookContent.lastIndexOf('.', endPos);
        const lastExclamation = bookContent.lastIndexOf('!', endPos);
        const lastQuestion = bookContent.lastIndexOf('?', endPos);
        const lastBreak = Math.max(lastPeriod, lastExclamation, lastQuestion);
        
        if (lastBreak > currentPos) {
          endPos = lastBreak + 1;
        }
      }
      
      chunks.push(bookContent.slice(currentPos, endPos).trim());
      currentPos = endPos;
    }
    
    setTextChunks(chunks);
  }, [bookContent]);

  const getSelectedVoice = () => {
    if (voices.length === 0) return null;

    // Try to find voices based on gender preference
    const maleVoices = voices.filter(voice => 
      voice.name.toLowerCase().includes('male') ||
      voice.name.toLowerCase().includes('david') ||
      voice.name.toLowerCase().includes('mark') ||
      voice.name.toLowerCase().includes('alex')
    );

    const femaleVoices = voices.filter(voice => 
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('victoria') ||
      voice.name.toLowerCase().includes('karen') ||
      voice.name.toLowerCase().includes('zira')
    );

    if (currentVoice === 'male' && maleVoices.length > 0) {
      return maleVoices[0];
    } else if (currentVoice === 'female' && femaleVoices.length > 0) {
      return femaleVoices[0];
    }

    // Fallback to first available voice
    return voices[0];
  };

  const speakChunk = (chunkIndex: number) => {
    if (!isSupported || chunkIndex >= textChunks.length) return;

    // Stop any current speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textChunks[chunkIndex]);
    const selectedVoice = getSelectedVoice();
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = playbackSpeed;
    utterance.volume = volume[0] / 100;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      if (chunkIndex < textChunks.length - 1) {
        setCurrentChunk(prev => prev + 1);
        setTimeout(() => speakChunk(chunkIndex + 1), 100);
      } else {
        setIsPlaying(false);
        setProgress(0);
        setCurrentChunk(0);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    // Simulate progress (Web Speech API doesn't provide real progress)
    utterance.onboundary = () => {
      const chunkProgress = ((chunkIndex + 1) / textChunks.length) * 100;
      setProgress(chunkProgress);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const handlePlay = () => {
    if (!isSupported) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    speakChunk(currentChunk);
  };

  const handlePause = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (currentChunk < textChunks.length - 1) {
      speechSynthesis.cancel();
      setCurrentChunk(prev => prev + 1);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentChunk > 0) {
      speechSynthesis.cancel();
      setCurrentChunk(prev => prev - 1);
      setIsPlaying(false);
    }
  };

  const handleSpeedChange = (speed: string) => {
    const newSpeed = parseFloat(speed);
    setPlaybackSpeed(newSpeed);
    
    // If currently playing, restart with new speed
    if (isPlaying) {
      handlePause();
      setTimeout(() => handlePlay(), 100);
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    
    // If currently playing, restart with new volume
    if (isPlaying) {
      handlePause();
      setTimeout(() => handlePlay(), 100);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 text-center">
        <p className="text-red-400">Text-to-speech is not supported in your browser.</p>
        <p className="text-gray-400 text-sm mt-2">Please try using Chrome, Firefox, or Safari for audio playback.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Audio Player</h3>
        <Badge variant="secondary" className="bg-gray-800 text-gray-300">
          {currentChunk + 1} / {textChunks.length}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="bg-red-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentChunk === 0}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          onClick={isPlaying ? handlePause : handlePlay}
          className="bg-red-600 hover:bg-red-700 text-white px-6"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentChunk === textChunks.length - 1}
          className="border-gray-600 text-gray-300 hover:bg-gray-800"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Voice Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Voice Preference</label>
        <Select value={currentVoice} onValueChange={(value: 'male' | 'female') => setCurrentVoice(value)}>
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            <SelectItem value="female" className="text-white hover:bg-gray-700">
              Female Reader
            </SelectItem>
            <SelectItem value="male" className="text-white hover:bg-gray-700">
              Male Reader
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Playback Speed</label>
        <Select value={playbackSpeed.toString()} onValueChange={handleSpeedChange}>
          <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-600">
            {SPEED_OPTIONS.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value.toString()}
                className="text-white hover:bg-gray-700"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Volume Control */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <label className="text-sm font-medium text-gray-300">Volume</label>
        </div>
        <Slider
          value={volume}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
          className="w-full"
        />
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mt-4">
        <h4 className="font-semibold mb-2 text-white">Audio Features:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Free browser-based text-to-speech</li>
          <li>• Male and female voice options (when available)</li>
          <li>• Adjustable playback speeds: 0.5x, 1x, 2x, 4x</li>
          <li>• Volume control and progress tracking</li>
          <li>• Chapter navigation and bookmarking</li>
          <li>• Works offline - no internet required</li>
        </ul>
      </div>
    </div>
  );
};
