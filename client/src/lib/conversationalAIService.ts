import { Conversation } from '@11labs/client';

// Agent IDs for different personalities
const AGENTS = {
  STEVE: '0Ako2MORgNjlSpGTU75E',
  SARAH: 'Jw7iQ8oXMG3MZeuyLfmH'
};

type AgentType = keyof typeof AGENTS;

let activeConversation: any = null;
let isListening = false;

// Connection status for the conversation
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
let connectionStatus: ConnectionStatus = 'disconnected';

// Callbacks
type StatusCallback = (status: ConnectionStatus) => void;
type MessageCallback = (message: Record<string, any>) => void;
const statusListeners: StatusCallback[] = [];
const messageListeners: MessageCallback[] = [];

// Register listeners
export const onConnectionStatusChange = (callback: StatusCallback) => {
  statusListeners.push(callback);
  // Immediately call with current status
  callback(connectionStatus);
  return () => {
    const index = statusListeners.indexOf(callback);
    if (index !== -1) {
      statusListeners.splice(index, 1);
    }
  };
};

export const onMessage = (callback: MessageCallback) => {
  messageListeners.push(callback);
  return () => {
    const index = messageListeners.indexOf(callback);
    if (index !== -1) {
      messageListeners.splice(index, 1);
    }
  };
};

// Update connection status
const updateConnectionStatus = (status: ConnectionStatus) => {
  connectionStatus = status;
  statusListeners.forEach(listener => listener(status));
};

// Request microphone permission
const requestMicrophonePermission = async () => {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    return true;
  } catch (error) {
    console.error('Microphone permission denied:', error);
    return false;
  }
};

// Get signed URL for WebSocket connection
const getSignedUrl = async (agentId: string): Promise<string> => {
  try {
    const response = await fetch(`/api/elevenlabs/get-signed-url?agentId=${agentId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get signed URL');
    }
    
    const data = await response.json();
    return data.signedUrl;
  } catch (error: any) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
};

// Start a conversation with the given agent
export const startConversation = async (agentType: AgentType): Promise<boolean> => {
  try {
    // If there's an active conversation, stop it first
    if (activeConversation) {
      await stopConversation();
    }

    // Request microphone permission
    const hasMicrophonePermission = await requestMicrophonePermission();
    if (!hasMicrophonePermission) {
      throw new Error('Microphone permission is required for voice conversation');
    }

    updateConnectionStatus('connecting');

    // Select the correct agent ID based on the agent type
    const agentId = AGENTS[agentType];
    
    // Get signed URL for the WebSocket connection
    const signedUrl = await getSignedUrl(agentId);
    
    // Create and configure the conversation
    activeConversation = await Conversation.startSession({
      signedUrl: signedUrl,
      onConnect: () => {
        updateConnectionStatus('connected');
        console.log('Connected to conversational AI agent');
      },
      onDisconnect: () => {
        updateConnectionStatus('disconnected');
        console.log('Disconnected from conversational AI agent');
        activeConversation = null;
        isListening = false;
      },
      onMessage: (message: any) => {
        console.log('Received message from agent:', message);
        messageListeners.forEach(listener => listener(message));
      },
      onError: (error: any) => {
        console.error('Conversation error:', error);
        updateConnectionStatus('error');
      },
    });
    
    isListening = true;
    return true;
  } catch (error: any) {
    console.error('Failed to start conversation:', error);
    updateConnectionStatus('error');
    return false;
  }
};

// Stop the active conversation
export const stopConversation = async (): Promise<void> => {
  if (!activeConversation) return;
  
  try {
    isListening = false;
    await activeConversation.stopSession();
    activeConversation = null;
    updateConnectionStatus('disconnected');
    console.log('Conversation stopped');
  } catch (error: any) {
    console.error('Error stopping conversation:', error);
  }
};

// Check if the conversation is currently active
export const isConversationActive = (): boolean => {
  return !!activeConversation && isListening;
};

// Get the current connection status
export const getConnectionStatus = (): ConnectionStatus => {
  return connectionStatus;
};

// Send a message to the agent
export const sendMessageToAgent = async (
  message: string, 
  agentType: string, 
  gender: string,
  history: { role: string, content: string }[] = []
): Promise<{ text: string, audio: string }> => {
  try {
    // Make API call to our backend endpoint
    const response = await fetch('/api/conversational-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        agentId: gender === 'male' ? AGENTS.STEVE : AGENTS.SARAH,
        history
      }),
    });

    if (!response.ok) {
      // Get more detailed error information if available
      let errorMessage = 'Failed to get agent response';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use the status text
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return {
      text: data.text,
      audio: data.audio
    };
  } catch (error) {
    console.error('Error sending message to agent:', error);
    // Add retry logic for common network issues
    if (error instanceof TypeError && error.message.includes('network')) {
      console.log('Network error detected, retrying in 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      return sendMessageToAgent(message, agentType, gender, history);
    }
    throw error;
  }
};

// Audio handling
let audioContext: AudioContext | null = null;
let audioSource: AudioBufferSourceNode | null = null;

// Play audio from base64 string
export const playAudio = async (base64Audio: string): Promise<void> => {
  try {
    if (!base64Audio) {
      throw new Error('No audio content provided');
    }
    
    // Close any existing audio context to avoid multiple sounds
    if (audioContext) {
      try {
        await audioContext.close();
      } catch (e) {
        console.warn('Error closing previous audio context:', e);
      }
      audioContext = null;
    }
    
    // Convert base64 to array buffer
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create new audio context
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    try {
      // Decode the audio data with timeout to prevent hanging
      const decodePromise = audioContext.decodeAudioData(bytes.buffer);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Audio decoding timed out')), 5000);
      });
      
      const audioBuffer = await Promise.race([decodePromise, timeoutPromise]) as AudioBuffer;
      
      // Create a source node
      audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      
      // Connect to the destination
      audioSource.connect(audioContext.destination);
      
      // Create an analyzer for visualizations if needed by the UI
      const analyzer = audioContext.createAnalyser();
      analyzer.fftSize = 256;
      audioSource.connect(analyzer);
      
      // Start playing
      audioSource.start(0);
      
      return new Promise((resolve) => {
        if (audioSource) {
          audioSource.onended = () => {
            resolve();
          };
        }
      });
    } catch (decodeError) {
      console.error('Error decoding audio data:', decodeError);
      // If decoding fails, close the context and clean up
      if (audioContext) {
        await audioContext.close();
        audioContext = null;
      }
      throw decodeError;
    }
  } catch (error) {
    console.error('Error playing audio:', error);
    throw error;
  }
};

// Set up event listeners for audio
export const setupAudioEventListeners = (
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: Error) => void
): void => {
  if (audioSource) {
    // Use event listeners instead of direct assignment
    if (onStart) {
      // Can't use onplay directly, but could use a setTimeout to simulate start event
      setTimeout(onStart, 100);
    }
    
    if (onEnd) {
      audioSource.onended = onEnd;
    }
  }
  
  // Use global error handler for audio context errors
  if (onError) {
    const handleAudioError = () => {
      onError(new Error('Audio playback error'));
    };
    
    // Clean up any previous listeners to avoid duplicates
    window.removeEventListener('error', handleAudioError);
    window.addEventListener('error', handleAudioError);
  }
};