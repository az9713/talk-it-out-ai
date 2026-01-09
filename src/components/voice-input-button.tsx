'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import { cn } from '@/lib/utils';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  onRecordingComplete?: (audioBlob: Blob) => void;
  disabled?: boolean;
  className?: string;
}

type RecordingMode = 'speech' | 'audio' | null;

export function VoiceInputButton({
  onTranscript,
  onRecordingComplete,
  disabled = false,
  className,
}: VoiceInputButtonProps) {
  const [mode, setMode] = useState<RecordingMode>(null);
  const [showUnsupportedMessage, setShowUnsupportedMessage] = useState(false);

  // Speech recognition (Web Speech API)
  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
  });

  // Audio recorder (fallback for unsupported browsers)
  const {
    isRecording,
    audioBlob,
    duration,
    error: recorderError,
    isSupported: isRecorderSupported,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder({ maxDuration: 120 }); // 2 minutes max

  // Determine which mode to use
  useEffect(() => {
    if (isSpeechSupported) {
      setMode('speech');
    } else if (isRecorderSupported) {
      setMode('audio');
    } else {
      setMode(null);
    }
  }, [isSpeechSupported, isRecorderSupported]);

  // Handle transcript updates for speech mode
  useEffect(() => {
    if (mode === 'speech' && transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [mode, transcript, onTranscript, resetTranscript]);

  // Handle audio recording completion
  useEffect(() => {
    if (mode === 'audio' && audioBlob && !isRecording) {
      onRecordingComplete?.(audioBlob);
      clearRecording();
    }
  }, [mode, audioBlob, isRecording, onRecordingComplete, clearRecording]);

  const handleClick = useCallback(() => {
    if (!mode) {
      setShowUnsupportedMessage(true);
      setTimeout(() => setShowUnsupportedMessage(false), 3000);
      return;
    }

    if (mode === 'speech') {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    } else if (mode === 'audio') {
      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    }
  }, [mode, isListening, isRecording, startListening, stopListening, startRecording, stopRecording]);

  const isActive = isListening || isRecording;
  const error = speechError || recorderError;

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine button state and appearance
  const getButtonContent = () => {
    if (isActive) {
      return (
        <>
          <Square className="h-4 w-4 fill-current" />
          {mode === 'audio' && (
            <span className="ml-1 text-xs font-mono">{formatDuration(duration)}</span>
          )}
        </>
      );
    }
    return <Mic className="h-4 w-4" />;
  };

  const getTooltipContent = () => {
    if (!mode) {
      return 'Voice input not supported in this browser';
    }
    if (isActive) {
      return mode === 'speech' ? 'Stop listening' : 'Stop recording';
    }
    return mode === 'speech' ? 'Start voice input' : 'Record audio message';
  };

  return (
    <TooltipProvider>
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={isActive ? 'destructive' : 'outline'}
              size="icon"
              onClick={handleClick}
              disabled={disabled || !mode}
              className={cn(
                'relative transition-all',
                isActive && 'animate-pulse',
                className
              )}
              aria-label={isActive ? 'Stop voice input' : 'Start voice input'}
            >
              {getButtonContent()}

              {/* Recording indicator */}
              {isActive && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{getTooltipContent()}</p>
          </TooltipContent>
        </Tooltip>

        {/* Interim transcript display */}
        {isListening && interimTranscript && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap max-w-[200px] truncate">
            {interimTranscript}...
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded whitespace-nowrap">
            {error}
          </div>
        )}

        {/* Unsupported browser message */}
        {showUnsupportedMessage && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded whitespace-nowrap">
            Voice input not supported
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

// Simplified voice input for just speech-to-text (no audio recording)
export function SimpleVoiceInput({
  onTranscript,
  disabled = false,
  className,
}: {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const {
    isListening,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
  });

  // Send transcript when it's finalized
  useEffect(() => {
    if (transcript) {
      onTranscript(transcript);
      resetTranscript();
    }
  }, [transcript, onTranscript, resetTranscript]);

  const handleToggle = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  if (!isSupported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled
              className={className}
            >
              <MicOff className="h-4 w-4 text-gray-400" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Voice input not supported in this browser</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={isListening ? 'destructive' : 'outline'}
              size="icon"
              onClick={handleToggle}
              disabled={disabled}
              className={cn(
                'relative transition-all',
                isListening && 'animate-pulse',
                className
              )}
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <Mic className="h-4 w-4" />
              )}

              {isListening && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{isListening ? 'Stop listening' : 'Start voice input'}</p>
          </TooltipContent>
        </Tooltip>

        {/* Interim transcript */}
        {isListening && interimTranscript && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap max-w-[200px] truncate">
            {interimTranscript}...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-red-100 text-red-700 text-xs px-2 py-1 rounded whitespace-nowrap max-w-[200px]">
            {error}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
