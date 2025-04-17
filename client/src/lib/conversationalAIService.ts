import { Conversation } from "@11labs/client";

// Agent IDs for different personalities and types
const AGENTS = {
  // Gender-specific generic agents (used as fallbacks)
  MALE: "0Ako2MORgNjlSpGTU75E", // Generic male agent
  FEMALE: "Jw7iQ8oXMG3MZeuyLfmH", // Generic female agent

  // Agent-specific IDs - male voices
  "customer-service-male": "Gmuxt2yDLn9NBNacnqpD",
  "sales-male": "0Ako2MORgNjlSpGTU75E",
  "receptionist-male": "hBgdG6LBM8kibonEH5Z2",
  "mortgage-male": "UDmXiDpEIuw1UodIMtL4",
  "healthcare-male": "8IySISWcYHDddNJPycPO",
  "concierge-male": "tT2n6zTIKnEWtseOF3On",
  "technical-support-male": "2Nzs4nDF2QCo2oBXGmmR",
  "travel-male": "5xwQq4wE2Amh1fj4WNSL",
  "educator-male": "21AVb18FxJICl2wcMGKb",
  "personal-assistant-male": "V2V3yNlXY3sqQUlyYiFD",
  "creative-male": "ueHEVUIa2XLNFnnQmadw",

  // Agent-specific IDs - female voices
  "customer-service-female": "6pX54eIEuD2LMkCW1TsJ",
  "sales-female": "Jw7iQ8oXMG3MZeuyLfmH",
  "receptionist-female": "QvsJlPVuXKVwEEOc9Vub",
  "mortgage-female": "sjRI6ujzTguEfzhhJxYk",
  "healthcare-female": "khrLzSGzEh94hntumcYq",
  "concierge-female": "6AB1I22uYr7x1EI3Z9H4",
  "technical-support-female": "1SpJtu1WLvPlDpM9oA1f",
  "travel-female": "73eSt09jKbAl9pInrPFv",
  "educator-female": "obm6iFxLxdo92An9HR5n",
  "personal-assistant-female": "M4ksFkkOpyBEfiSeFcnM",
  "creative-female": "Ykx5hxNgWZcQIR2IOZ6N",
};

type AgentType = keyof typeof AGENTS;

let activeConversation: any = null;
let isListening = false;

// Connection status for the conversation
type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
let connectionStatus: ConnectionStatus = "disconnected";

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
  statusListeners.forEach((listener) => listener(status));
};

// Microphone analysis variables
let microphoneAudioContext: AudioContext | null = null;
let microphoneAnalyser: AnalyserNode | null = null;
let microphoneDataArray: Uint8Array | null = null;
let microphoneAnalysisInterval: number | null = null;

// Request microphone permission and set up audio analysis
const requestMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    // Set up audio analysis
    microphoneAudioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    microphoneAnalyser = microphoneAudioContext.createAnalyser();
    microphoneAnalyser.fftSize = 256;

    // Create buffer for frequency data
    const bufferLength = microphoneAnalyser.frequencyBinCount;
    microphoneDataArray = new Uint8Array(bufferLength);

    // Connect microphone to analyzer
    const microphoneSource =
      microphoneAudioContext.createMediaStreamSource(stream);
    microphoneSource.connect(microphoneAnalyser);

    // Start continuous analysis
    startMicrophoneAnalysis();

    return true;
  } catch (error) {
    console.error("Microphone permission denied or audio setup failed:", error);
    return false;
  }
};

// Start analyzing microphone input
const startMicrophoneAnalysis = () => {
  if (microphoneAnalysisInterval) {
    clearInterval(microphoneAnalysisInterval);
  }

  // Analyze at regular intervals
  microphoneAnalysisInterval = window.setInterval(() => {
    if (!microphoneAnalyser || !microphoneDataArray || !isListening) return;

    // Get frequency data
    microphoneAnalyser.getByteFrequencyData(microphoneDataArray);

    // Calculate average intensity (0-1 scale)
    const sum = Array.from(microphoneDataArray).reduce(
      (acc, val) => acc + val,
      0,
    );
    const averageIntensity = sum / (microphoneDataArray.length * 255); // Normalize to 0-1

    // Update intensity with smoothing
    const smoothingFactor = 0.3;
    const smoothedIntensity =
      currentAudioIntensity * (1 - smoothingFactor) +
      averageIntensity * smoothingFactor;

    // Only update if we're in listening mode (not speaking)
    if (!audioSource) {
      updateIntensity(smoothedIntensity);
    }
  }, 50); // 50ms intervals for responsive visualization
};

// Get signed URL for WebSocket connection
const getSignedUrl = async (agentId: string): Promise<string> => {
  try {
    const response = await fetch(
      `/api/elevenlabs/get-signed-url?agentId=${agentId}`,
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to get signed URL");
    }

    const data = await response.json();
    return data.signedUrl;
  } catch (error: any) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
};

// Start a conversation with the given agent
export const startConversation = async (
  agentType: AgentType,
): Promise<boolean> => {
  try {
    // If there's an active conversation, stop it first
    if (activeConversation) {
      await stopConversation();
    }

    // Request microphone permission
    const hasMicrophonePermission = await requestMicrophonePermission();
    if (!hasMicrophonePermission) {
      throw new Error(
        "Microphone permission is required for voice conversation",
      );
    }

    updateConnectionStatus("connecting");

    // Select the correct agent ID based on the agent type
    let agentId;
    if (AGENTS[agentType]) {
      // If the exact agent type key exists in our mapping
      agentId = AGENTS[agentType];
      console.log(`Using agent: ${agentType}`);
    } else {
      // If not found, try to parse the key format (e.g., 'customer-service-male')
      const parts = agentType.toString().split("-");
      // Check if this is in the format agent-gender
      if (parts.length >= 2) {
        const lastPart = parts[parts.length - 1];
        // If the last part is gender (male/female)
        if (lastPart === "male" || lastPart === "female") {
          // Fall back to generic gender
          agentId = lastPart === "male" ? AGENTS.MALE : AGENTS.FEMALE;
          console.log(`Using fallback ${lastPart} agent for ${agentType}`);
        } else {
          // If not a gender-specific format, use male as default
          agentId = AGENTS.MALE;
          console.log(`Using default male agent for type: ${agentType}`);
        }
      } else {
        // Default to male voice if format is unexpected
        agentId = AGENTS.MALE;
        console.log(`Using default male agent for unknown type: ${agentType}`);
      }
    }

    // Get signed URL for the WebSocket connection
    const signedUrl = await getSignedUrl(agentId);

    // Create and configure the conversation
    activeConversation = await Conversation.startSession({
      signedUrl: signedUrl,
      onConnect: () => {
        updateConnectionStatus("connected");
        console.log("Connected to conversational AI agent");
      },
      onDisconnect: () => {
        updateConnectionStatus("disconnected");
        console.log("Disconnected from conversational AI agent");
        activeConversation = null;
        isListening = false;
      },
      onMessage: (message: any) => {
        console.log("Received message from agent:", message);
        messageListeners.forEach((listener) => listener(message));
      },
      onError: (error: any) => {
        console.error("Conversation error:", error);
        updateConnectionStatus("error");
      },
    });

    isListening = true;
    return true;
  } catch (error: any) {
    console.error("Failed to start conversation:", error);
    updateConnectionStatus("error");
    return false;
  }
};

// Stop the active conversation and clean up all resources
export const stopConversation = async (): Promise<void> => {
  console.log("Attempting to stop conversation and clean up resources");

  // Stop microphone analysis interval first
  if (microphoneAnalysisInterval) {
    clearInterval(microphoneAnalysisInterval);
    microphoneAnalysisInterval = null;
    console.log("Microphone analysis interval cleared");
  }

  // Close microphone audio context if it exists
  if (microphoneAudioContext) {
    try {
      await microphoneAudioContext.close();
      microphoneAudioContext = null;
      microphoneAnalyser = null;
      microphoneDataArray = null;
      console.log("Microphone audio context closed and resources cleaned up");
    } catch (micError) {
      console.error("Error closing microphone audio context:", micError);
    }
  }

  // Stop any audio playback
  if (audioSource) {
    try {
      audioSource.stop();
      audioSource.disconnect();
      audioSource = null;
      console.log("Audio source stopped and disconnected");
    } catch (audioError) {
      console.error("Error stopping audio source:", audioError);
    }
  }

  // Close playback audio context
  if (audioContext) {
    try {
      await audioContext.close();
      audioContext = null;
      audioAnalyser = null;
      analyserDataArray = null;
      console.log("Audio context closed");
    } catch (contextError) {
      console.error("Error closing audio context:", contextError);
    }
  }

  // Reset intensity to zero
  updateIntensity(0);

  // Now explicitly terminate the active conversation if it exists
  if (activeConversation) {
    try {
      // First mark as not listening to prevent any new audio processing
      isListening = false;

      // Forcefully close the WebSocket connection first
      if (
        activeConversation.connection &&
        typeof activeConversation.connection.close === "function"
      ) {
        activeConversation.connection.close(
          1000,
          "User terminated conversation",
        );
        console.log("WebSocket connection forcefully closed");
      }

      // Then attempt the normal stopSession call
      try {
        await activeConversation.stopSession();
        console.log(
          "Conversation session stopped successfully via stopSession()",
        );
      } catch (stopError) {
        console.error(
          "Error in stopSession call, continuing with cleanup:",
          stopError,
        );
      }

      // Also hit the server endpoint to notify 11Labs that the conversation is over
      try {
        const agentId =
          activeConversation.agentId ||
          (activeConversation.config && activeConversation.config.agentId);

        if (agentId) {
          await fetch(`/api/elevenlabs/end-conversation?agentId=${agentId}`, {
            method: "POST",
          });
          console.log("Server notified about conversation end");
        }
      } catch (serverError) {
        console.error(
          "Error notifying server about conversation end:",
          serverError,
        );
      }
    } catch (error: any) {
      console.error("Error stopping conversation session:", error);
    } finally {
      // Always null out the conversation and update status even if there was an error
      activeConversation = null;
      updateConnectionStatus("disconnected");
      console.log("Conversation fully stopped and connection status updated");
    }
  } else {
    console.log("No active conversation to stop");
  }

  // Just to be extra safe, reset any global listeners
  try {
    window.removeEventListener("error", () => {});
  } catch (e) {
    // Ignore errors in cleanup
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
  history: { role: string; content: string }[] = [],
): Promise<{ text: string; audio: string }> => {
  try {
    // Determine the correct agent ID based on agent type and gender
    let agentId;
    const agentKey = `${agentType}-${gender}` as keyof typeof AGENTS;

    // Try to get the specific agent-gender combination
    if (AGENTS[agentKey]) {
      agentId = AGENTS[agentKey];
      console.log(`Using specific agent: ${agentKey}`);
    } else {
      // Fall back to generic male/female agents if specific one doesn't exist
      agentId = gender === "male" ? AGENTS.MALE : AGENTS.FEMALE;
      console.log(`Using fallback ${gender} agent for type: ${agentType}`);
    }

    // Make API call to our backend endpoint
    const response = await fetch("/api/conversational-agent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        agentId,
        history,
        agentType, // Send agent type for context
      }),
    });

    if (!response.ok) {
      // Get more detailed error information if available
      let errorMessage = "Failed to get agent response";
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
      audio: data.audio,
    };
  } catch (error) {
    console.error("Error sending message to agent:", error);
    // Add retry logic for common network issues
    if (error instanceof TypeError && error.message.includes("network")) {
      console.log("Network error detected, retrying in 2 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return sendMessageToAgent(message, agentType, gender, history);
    }
    throw error;
  }
};

// Audio handling
let audioContext: AudioContext | null = null;
let audioSource: AudioBufferSourceNode | null = null;
let audioAnalyser: AnalyserNode | null = null;
let analyserDataArray: Uint8Array | null = null;

// Track audio intensity for visualization
let currentAudioIntensity = 0;
const intensityListeners: ((intensity: number) => void)[] = [];

// Add audio intensity change listener
export const addIntensityListener = (
  callback: (intensity: number) => void,
): (() => void) => {
  intensityListeners.push(callback);

  // Return cleanup function
  return () => {
    const index = intensityListeners.indexOf(callback);
    if (index > -1) {
      intensityListeners.splice(index, 1);
    }
  };
};

// Get current audio intensity (0-1 scale)
export const getAudioIntensity = (): number => {
  return currentAudioIntensity;
};

// Function to update audio intensity value and notify listeners
const updateIntensity = (newIntensity: number) => {
  currentAudioIntensity = newIntensity;
  intensityListeners.forEach((listener) => listener(newIntensity));
};

// Function to analyze audio and update intensity
const analyzeAudio = () => {
  if (!audioAnalyser || !analyserDataArray) return;

  // Get frequency data
  audioAnalyser.getByteFrequencyData(analyserDataArray);

  // Calculate average intensity (0-1 scale)
  const sum = analyserDataArray.reduce((acc, val) => acc + val, 0);
  const averageIntensity = sum / (analyserDataArray.length * 255); // Normalize to 0-1

  // Update intensity with smoothing
  const smoothingFactor = 0.3;
  const smoothedIntensity =
    currentAudioIntensity * (1 - smoothingFactor) +
    averageIntensity * smoothingFactor;

  updateIntensity(smoothedIntensity);

  // Continue analyzing
  if (audioSource) {
    requestAnimationFrame(analyzeAudio);
  }
};

// Play audio from base64 string with enhanced analysis
export const playAudio = async (base64Audio: string): Promise<void> => {
  try {
    if (!base64Audio) {
      throw new Error("No audio content provided");
    }

    // Close any existing audio context to avoid multiple sounds
    if (audioContext) {
      try {
        await audioContext.close();
      } catch (e) {
        console.warn("Error closing previous audio context:", e);
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
    audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    try {
      // Decode the audio data with timeout to prevent hanging
      const decodePromise = audioContext.decodeAudioData(bytes.buffer);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Audio decoding timed out")), 5000);
      });

      const audioBuffer = (await Promise.race([
        decodePromise,
        timeoutPromise,
      ])) as AudioBuffer;

      // Create a source node
      audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;

      // Create analyzer for visualizations
      audioAnalyser = audioContext.createAnalyser();
      audioAnalyser.fftSize = 256;

      // Create buffer for frequency data
      const bufferLength = audioAnalyser.frequencyBinCount;
      analyserDataArray = new Uint8Array(bufferLength);

      // Connect nodes: source -> analyzer -> destination
      audioSource.connect(audioAnalyser);
      audioAnalyser.connect(audioContext.destination);

      // Start playing
      audioSource.start(0);

      // Start analyzing audio
      analyzeAudio();

      // Signal that speaking has started
      updateIntensity(0.5); // Initial intensity

      return new Promise((resolve) => {
        if (audioSource) {
          audioSource.onended = () => {
            // Reset intensity when audio ends
            updateIntensity(0);
            resolve();
          };
        }
      });
    } catch (decodeError) {
      console.error("Error decoding audio data:", decodeError);
      // If decoding fails, close the context and clean up
      if (audioContext) {
        await audioContext.close();
        audioContext = null;
      }
      updateIntensity(0);
      throw decodeError;
    }
  } catch (error) {
    console.error("Error playing audio:", error);
    updateIntensity(0);
    throw error;
  }
};

// Set up event listeners for audio
export const setupAudioEventListeners = (
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: Error) => void,
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
      onError(new Error("Audio playback error"));
    };

    // Clean up any previous listeners to avoid duplicates
    window.removeEventListener("error", handleAudioError);
    window.addEventListener("error", handleAudioError);
  }
};
