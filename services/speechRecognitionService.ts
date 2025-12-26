/**
 * Local Speech Recognition Service
 * Uses the browser's built-in Web Speech API for free, unlimited transcription
 */

// Define types for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Get the SpeechRecognition constructor (works in Chrome, Edge, Safari)
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export interface TranscriptionResult {
  success: boolean;
  transcript: string;
  confidence: number;
  error?: string;
}

export interface SpeechRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onEnd?: (result: TranscriptionResult) => void;
  onError?: (error: string) => void;
}

let recognitionInstance: any = null;
let finalTranscript = '';
let interimTranscript = '';

/**
 * Check if speech recognition is supported in this browser
 */
export const isSpeechRecognitionSupported = (): boolean => {
  return !!SpeechRecognition;
};

/**
 * Start speech recognition
 * @param callbacks - Callback functions for various events
 * @param language - Language code (default: 'hi-IN' for Hindi/Sanskrit)
 */
export const startSpeechRecognition = (
  callbacks: SpeechRecognitionCallbacks,
  language: string = 'hi-IN'
): boolean => {
  if (!SpeechRecognition) {
    callbacks.onError?.('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
    return false;
  }

  // Stop any existing recognition
  if (recognitionInstance) {
    recognitionInstance.stop();
  }

  finalTranscript = '';
  interimTranscript = '';

  recognitionInstance = new SpeechRecognition();
  
  // Configure recognition
  recognitionInstance.continuous = true; // Keep listening until stopped
  recognitionInstance.interimResults = true; // Get results while speaking
  recognitionInstance.lang = language; // Hindi for Sanskrit (closest supported)
  recognitionInstance.maxAlternatives = 1;

  recognitionInstance.onstart = () => {
    console.log('Speech recognition started');
    callbacks.onStart?.();
  };

  recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
    interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        finalTranscript += result[0].transcript;
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    const currentTranscript = finalTranscript + interimTranscript;
    callbacks.onResult?.(currentTranscript, false);
  };

  recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
    console.error('Speech recognition error:', event.error);
    
    let errorMessage = 'Speech recognition error';
    switch (event.error) {
      case 'no-speech':
        errorMessage = 'No speech detected. Please try again.';
        break;
      case 'audio-capture':
        errorMessage = 'Microphone not found. Please check your microphone.';
        break;
      case 'not-allowed':
        errorMessage = 'Microphone access denied. Please enable permissions.';
        break;
      case 'network':
        errorMessage = 'Network error. Please check your connection.';
        break;
      default:
        errorMessage = `Speech recognition error: ${event.error}`;
    }
    
    callbacks.onError?.(errorMessage);
  };

  recognitionInstance.onend = () => {
    console.log('Speech recognition ended');
    const result: TranscriptionResult = {
      success: finalTranscript.length > 0,
      transcript: finalTranscript.trim(),
      confidence: 1.0, // Web Speech API doesn't always provide confidence
      error: finalTranscript.length === 0 ? 'No speech detected' : undefined
    };
    callbacks.onEnd?.(result);
  };

  try {
    recognitionInstance.start();
    return true;
  } catch (error) {
    console.error('Failed to start speech recognition:', error);
    callbacks.onError?.('Failed to start speech recognition');
    return false;
  }
};

/**
 * Stop speech recognition
 */
export const stopSpeechRecognition = (): void => {
  if (recognitionInstance) {
    recognitionInstance.stop();
  }
};

/**
 * Abort speech recognition (stops without triggering onend with results)
 */
export const abortSpeechRecognition = (): void => {
  if (recognitionInstance) {
    recognitionInstance.abort();
  }
};

/**
 * Get the current interim transcript while recording
 */
export const getCurrentTranscript = (): string => {
  return finalTranscript + interimTranscript;
};
