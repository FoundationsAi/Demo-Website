/**
 * Voice Service for 11Labs API integration
 * Provides functionality to generate and play AI voice responses
 */

import { apiRequest } from "./queryClient";

// Map of predefined voice IDs for different agent types
interface VoiceMap {
  [key: string]: {
    male: string;
    female: string;
  };
}

// These are just example voice IDs - they will need to be replaced with actual 11Labs voice IDs
export const DEFAULT_VOICES: VoiceMap = {
  // Default fallback voices
  default: {
    male: "Gmuxt2yDLn9NBNacnqpD", // Mark voice ID
    female: "6pX54eIEuD2LMkCW1TsJ" // Emily voice ID
  },
  // Custom voices for each agent type
  "customer-service": {
    male: "Gmuxt2yDLn9NBNacnqpD", // Mark voice ID (previously Chris)
    female: "6pX54eIEuD2LMkCW1TsJ" // Emily voice ID
  },
  "sales": {
    male: "pNInz6obpgDQGcFmaJgB", // Steve voice ID
    female: "2EiwWnXFnvU5JabPnv8n" // Rachel voice ID
  },
  "receptionist": {
    male: "hBgdG6LBM8kibonEH5Z2", // Alex voice ID (previously Robert)
    female: "QvsJlPVuXKVwEEOc9Vub" // Jade voice ID (previously Jessica)
  },
  "mortgage": {
    male: "TxGEqnHWrfWFTfGW9XjX", // Thomas voice ID
    female: "zcAOhNBS3c14rBihAFp1" // Amanda voice ID
  },
  "healthcare": {
    male: "ThT5KcBeYPX3keUQqHPh", // David voice ID
    female: "51AxS6BvCvRDa5yhL56Z" // Sophia voice ID
  },
  // Add more agent-specific voices as needed
};

// Audio player instance for handling speech playback
let audioPlayer: HTMLAudioElement | null = null;

/**
 * Generate and play speech from provided text using 11Labs API
 * @param text The text to convert to speech
 * @param agentType The type of agent (customer-service, sales, etc.)
 * @param gender The gender of the voice (male or female)
 * @returns A promise that resolves when audio starts playing
 */
export async function generateAndPlaySpeech(
  text: string,
  agentType: string = 'default',
  gender: 'male' | 'female' = 'male'
): Promise<void> {
  try {
    // Get the appropriate voice ID
    const voiceMap = DEFAULT_VOICES[agentType] || DEFAULT_VOICES.default;
    const voiceId = gender === 'male' ? voiceMap.male : voiceMap.female;
    
    // Stop any currently playing audio
    stopSpeech();
    
    // Get audio data from our API endpoint that calls 11Labs
    const response = await apiRequest("POST", "/api/synthesize-speech", {
      text,
      voiceId,
      optimizeStreamingLatency: 1 // 0-4, higher means more optimized for streaming but potentially lower quality
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Speech synthesis error:", errorData);
      throw new Error(errorData.error || "Failed to generate speech");
    }
    
    const data = await response.json();
    
    // Create audio from the base64 data
    const audioSrc = `data:${data.contentType};base64,${data.audioContent}`;
    
    // Create and play the audio
    audioPlayer = new Audio(audioSrc);
    audioPlayer.volume = 1.0;
    
    return new Promise((resolve, reject) => {
      if (audioPlayer) {
        audioPlayer.onplay = () => resolve();
        audioPlayer.onerror = (e) => reject(new Error("Audio playback error"));
        audioPlayer.play().catch(reject);
      } else {
        reject(new Error("Audio player not initialized"));
      }
    });
  } catch (error: any) {
    console.error("Error in speech generation:", error);
    throw error;
  }
}

/**
 * Stop any currently playing speech
 */
export function stopSpeech(): void {
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
}

/**
 * Check if speech is currently playing
 * @returns Boolean indicating if speech is playing
 */
export function isSpeechPlaying(): boolean {
  return audioPlayer !== null && !audioPlayer.paused;
}

/**
 * Fetch available voices from 11Labs
 * @returns Promise resolving to the list of available voices
 */
export async function fetchAvailableVoices() {
  try {
    const response = await apiRequest("GET", "/api/voices");
    if (!response.ok) {
      throw new Error("Failed to fetch voices");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching voices:", error);
    throw error;
  }
}

/**
 * Set up event listeners for audio playback events
 * @param onStart Callback when audio starts playing
 * @param onEnd Callback when audio finishes playing
 * @param onError Callback when an error occurs
 */
export function setupAudioEventListeners(
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: any) => void
): () => void {
  const handleStart = () => onStart?.();
  const handleEnd = () => {
    audioPlayer = null;
    onEnd?.();
  };
  const handleError = (e: any) => {
    audioPlayer = null;
    onError?.(e);
  };

  // Remove existing listeners to prevent duplicates
  removeAudioEventListeners();
  
  // Add new listeners
  if (audioPlayer) {
    audioPlayer.addEventListener('play', handleStart);
    audioPlayer.addEventListener('ended', handleEnd);
    audioPlayer.addEventListener('error', handleError);
  }
  
  // Return cleanup function
  return () => {
    if (audioPlayer) {
      audioPlayer.removeEventListener('play', handleStart);
      audioPlayer.removeEventListener('ended', handleEnd);
      audioPlayer.removeEventListener('error', handleError);
    }
  };
}

/**
 * Remove all audio event listeners
 */
function removeAudioEventListeners(): void {
  if (audioPlayer) {
    audioPlayer.onplay = null;
    audioPlayer.onended = null;
    audioPlayer.onerror = null;
  }
}