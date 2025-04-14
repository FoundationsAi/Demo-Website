/**
 * ElevenLabs Conversational AI Service
 * Connects to pre-built 11 Labs AI agents instead of just voice synthesis
 */

import { apiRequest } from "./queryClient";

// Map of agent IDs for different agent types and genders
interface AgentMap {
  [key: string]: {
    male: string;
    female: string;
  };
}

// These are your specific 11 Labs Conversational AI agent IDs
export const CONVERSATIONAL_AGENTS: AgentMap = {
  // Default agents are the sales agents
  default: {
    male: "0Ako2MORgNjlSpGTU75E", // Steve - Sales agent Demo
    female: "Jw7iQ8oXMG3MZeuyLfmH" // Sarah - Sales agent Demo
  },
  // The sales agents specifically
  "sales": {
    male: "0Ako2MORgNjlSpGTU75E", // Steve - Sales agent Demo
    female: "Jw7iQ8oXMG3MZeuyLfmH" // Sarah - Sales agent Demo
  }
  // Other agent types can be added as they become available
  // For now, we'll fall back to the sales agents for other types
};

// Audio player instance for handling speech playback
let audioPlayer: HTMLAudioElement | null = null;

/**
 * Send a message to an 11 Labs Conversational AI agent
 * @param message The user's message to send to the agent
 * @param agentType The type of agent (sales, customer-service, etc.)
 * @param gender The gender of the agent (male or female)
 * @param history Optional conversation history
 * @returns A promise that resolves with the agent's response
 */
export async function sendMessageToAgent(
  message: string,
  agentType: string = 'default',
  gender: 'male' | 'female' = 'male',
  history: Array<{role: string, content: string}> = []
): Promise<{text: string, audio: string}> {
  try {
    console.log(`Sending message to ${agentType} agent, gender: ${gender}`);
    
    // Get the appropriate voice ID from our agent map
    const agentMap = CONVERSATIONAL_AGENTS[agentType] || CONVERSATIONAL_AGENTS.default;
    const voiceId = gender === 'male' ? agentMap.male : agentMap.female;
    
    console.log(`Using voice ID: ${voiceId}`);
    
    // Call our API endpoint that connects to 11 Labs Voice API
    const response = await apiRequest("POST", "/api/conversational-agent", {
      message,
      agentId: voiceId,
      history
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Agent response error:", errorData);
      throw new Error(errorData.error || "Failed to get agent response");
    }
    
    return await response.json();
  } catch (error: any) {
    console.error("Error in agent communication:", error);
    throw error;
  }
}

/**
 * Play audio from base64 encoded audio content
 * @param audioContent Base64 encoded audio content
 * @param contentType Audio content type (e.g., "audio/mpeg")
 * @returns A promise that resolves when audio starts playing
 */
export function playAudio(audioContent: string, contentType: string = "audio/mpeg"): Promise<void> {
  // Stop any currently playing audio
  stopAudio();
  
  // Create audio from the base64 data
  const audioSrc = `data:${contentType};base64,${audioContent}`;
  
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
}

/**
 * Stop any currently playing audio
 */
export function stopAudio(): void {
  if (audioPlayer) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
}

/**
 * Check if audio is currently playing
 * @returns Boolean indicating if audio is playing
 */
export function isAudioPlaying(): boolean {
  return audioPlayer !== null && !audioPlayer.paused;
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