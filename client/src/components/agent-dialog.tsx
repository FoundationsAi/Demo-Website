import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { VoiceWave } from "@/components/voice-wave";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { X, Mic, MicOff, Send, Volume2, ExternalLink } from "lucide-react";
import * as conversationalAIService from "@/lib/conversationalAIService";

// Stages of the dialog flow
type DialogStage =
  | "gender-selection"
  | "lead-capture"
  | "full-demo"
  | "widget-fallback";

interface AgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: any | null;
  onClose: () => void;
}

export const AgentDialog: React.FC<AgentDialogProps> = ({
  open,
  onOpenChange,
  agent,
  onClose,
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [stage, setStage] = useState<DialogStage>("gender-selection");
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | null
  >(null);
  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [leadData, setLeadData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    industry: "",
    employees: "",
    budget: "",
  });

  // Full screen demo state (when user is in the full demo experience)
  const [demoMessages, setDemoMessages] = useState<
    { sender: "user" | "ai"; content: string }[]
  >([]);
  const [demoInput, setDemoInput] = useState("");

  // Audio visualization state
  const [audioIntensity, setAudioIntensity] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset states when dialog opens
  useEffect(() => {
    if (open) {
      setStage("gender-selection");
      setSelectedGender(null);
      setMessage("");
      setIsPlaying(false);
      setDemoMessages([]);
      setDemoInput("");
    }
  }, [open]);

  // Scroll to bottom when new messages appear in full demo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [demoMessages]);

  // Add effect to start conversation when in full-demo stage
  useEffect(() => {
    if (stage === "full-demo") {
      // No need to auto-start the conversation
      // User will click the "Start Your Demo" button
    }
  }, [stage, selectedGender]);

  // Subscribe to audio intensity changes
  useEffect(() => {
    // Only subscribe when the demo is active
    if (stage === "full-demo") {
      // Set up listener for audio intensity changes
      const unsubscribe = conversationalAIService.addIntensityListener(
        (intensity) => {
          setAudioIntensity(intensity);
        },
      );

      // Clean up when component unmounts or when stage changes
      return () => {
        unsubscribe();
      };
    }
  }, [stage]);

  // Handle closing attempt
  const handleCloseAttempt = () => {
    // If we're past the gender selection and not already showing confirm dialog
    if (stage !== "gender-selection" && !showConfirmClose) {
      setShowConfirmClose(true);
      return;
    }

    // Otherwise just close
    handleConfirmClose();
  };

  // Handle confirmed close
  const handleConfirmClose = async () => {
    console.log(
      "handleConfirmClose called - terminating conversation and closing dialog",
    );
    // Show loading/progress indicator
    toast({
      title: "Ending conversation",
      description: "Please wait while we clean up...",
    });

    // Force stop everything with comprehensive cleanup to ensure it fully stops
    try {
      // STEP 1: Force close any WebSocket connections from 11Labs
      console.log("Attempting to close all WebSocket connections");
      const closeWebSocket = (ws: any) => {
        if (ws && typeof ws.close === "function") {
          try {
            // Use code 1000 (normal closure) and reason
            ws.close(1000, "User terminated conversation");
            console.log("WebSocket forcibly closed successfully");
            return true;
          } catch (e) {
            console.error("Error closing WebSocket:", e);
          }
        }
        return false;
      };

      // Try multiple places where the WebSocket might be stored
      let wsFound = false;

      // Check global variable
      const globalWs = (window as any).__elevenlabsWs;
      if (globalWs) {
        wsFound = closeWebSocket(globalWs) || wsFound;
        // Also null out the reference
        (window as any).__elevenlabsWs = null;
      }

      // Check other possible locations
      const elevenLabsClient = (window as any).elevenLabsClient;
      if (elevenLabsClient && elevenLabsClient.socket) {
        wsFound = closeWebSocket(elevenLabsClient.socket) || wsFound;
      }

      // Look for any WebSocket objects in window
      if (!wsFound) {
        console.log(
          "No WebSocket connections found via known variables, looking deeper...",
        );
        // Try to find any WebSockets attached to the window
        for (const key in window) {
          try {
            const obj = (window as any)[key];
            if (
              obj &&
              typeof obj === "object" &&
              obj.readyState !== undefined &&
              typeof obj.close === "function"
            ) {
              console.log(`Found potential WebSocket in window.${key}`);
              closeWebSocket(obj);
            }
          } catch (e) {
            // Ignore errors during inspection
          }
        }
      }

      // STEP 2: Stop all audio playback
      console.log("Stopping all audio playback");
      document.querySelectorAll("audio").forEach((audio) => {
        try {
          audio.pause();
          audio.currentTime = 0;
          if (audio.srcObject && audio.srcObject instanceof MediaStream) {
            // Also stop any tracks in srcObject (for getUserMedia streams)
            const tracks = audio.srcObject.getTracks();
            tracks.forEach((track: MediaStreamTrack) => track.stop());
            audio.srcObject = null;
          }
          console.log("Audio element stopped");
        } catch (e) {
          console.error("Error stopping audio element:", e);
        }
      });

      // STEP 3: Terminate any audio contexts
      if ((window as any).AudioContext) {
        try {
          // Create and immediately close a temporary context to force cleanup
          const tempCtx = new AudioContext();
          await tempCtx.close();
          console.log("Audio context closed");
        } catch (e) {
          console.error("Error closing audio context:", e);
        }
      }

      // STEP 4: Make explicit call to terminate the conversation with 11Labs
      console.log("Calling stopConversation service");
      await conversationalAIService.stopConversation();
      console.log("stopConversation service call completed");

      // STEP 5: Cancel any pending fetch requests
      try {
        console.log("Aborting any pending fetch requests");
        const controller = new AbortController();
        controller.abort();
      } catch (e) {
        console.error("Error aborting pending requests:", e);
      }

      // Success notification
      toast({
        title: "Conversation terminated",
        description: "Voice conversation has been successfully closed.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error while cleaning up:", error);
      toast({
        title: "Error during cleanup",
        description:
          "There was a problem during cleanup, but we'll still close the dialog.",
        variant: "destructive",
      });
    } finally {
      console.log("Final cleanup and dialog closing");
      // Always reset UI states no matter what
      setIsPlaying(false);
      setDemoMessages([]);
      setAudioIntensity(0);
      setShowConfirmClose(false);

      // Always close the dialog even if there's an error
      onOpenChange(false);
      onClose();
      console.log("Dialog closed");
    }
  };

  // Handle cancel close
  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  // Get appropriate voice names based on agent type
  const getVoiceNames = () => {
    // Default fallback names
    let maleName = "Michael";
    let femaleName = "Sarah";

    // Customize based on agent type
    switch (agent?.id) {
      case "customer-service":
        maleName = "Mark";
        femaleName = "Emily";
        break;
      case "sales":
        maleName = "Steve";
        femaleName = "Sarah";
        break;
      case "receptionist":
        maleName = "Alex";
        femaleName = "Jade";
        break;
      case "mortgage":
        maleName = "Archer";
        femaleName = "Amanda";
        break;
      case "healthcare":
        maleName = "Tim";
        femaleName = "Savana";
        break;
      case "concierge":
        maleName = "James";
        femaleName = "Victoria";
        break;
      case "technical-support":
        maleName = "Alex";
        femaleName = "Nicole";
        break;
      case "travel":
        maleName = "Daniel";
        femaleName = "Olivia";
        break;
      case "educator":
        maleName = "Mark";
        femaleName = "Julia";
        break;
      case "personal-assistant":
        maleName = "Paul";
        femaleName = "Emma";
        break;
      case "creative":
        maleName = "Ryan";
        femaleName = "Lily";
        break;
    }

    return { maleName, femaleName };
  };

  const { maleName, femaleName } = getVoiceNames();

  // Handle gender selection
  const handleSelectGender = (gender: "male" | "female") => {
    setSelectedGender(gender);
    // Skip mini-chat and go directly to lead capture
    setStage("lead-capture");
  };

  // Handle submit mini chat message
  const handleSubmitMiniChat = async () => {
    if (!message.trim()) return;

    setIsPlaying(true);

    try {
      // Get agent type from agent id
      const agentType = agent?.id || "default";
      const gender = selectedGender || "male";

      try {
        // Send message to the appropriate Conversational AI agent
        const response = await conversationalAIService.sendMessageToAgent(
          message,
          agentType,
          gender,
        );

        // Play the audio response
        await conversationalAIService.playAudio(response.audio);

        // Set up event listener for when audio playback ends
        conversationalAIService.setupAudioEventListeners(
          undefined, // onStart callback
          () => {
            // When audio finishes playing
            setIsPlaying(false);

            // After a short delay, proceed to lead capture
            setTimeout(() => {
              setStage("lead-capture");
            }, 500);
          },
          (error: Error) => {
            // On error
            console.error("Audio playback error:", error);
            setIsPlaying(false);
            toast({
              title: "Voice playback error",
              description: "There was an error playing the audio response.",
              variant: "destructive",
            });
          },
        );
      } catch (error) {
        console.error("Failed to get agent response:", error);
        setIsPlaying(false);
        toast({
          title: "Agent communication failed",
          description:
            "We couldn't connect to the AI agent. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in agent communication:", error);
      setIsPlaying(false);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Helper function to generate AI responses based on user input
  const getAIResponse = (userMessage: string, agentName: string): string => {
    // Simple response generation based on agent type and user message
    const message = userMessage.toLowerCase();
    const greetings = ["hi", "hello", "hey", "greetings"];
    const questions = [
      "how",
      "what",
      "why",
      "when",
      "where",
      "who",
      "can",
      "could",
      "would",
    ];

    // Default response templates
    let responses = [
      `Thank you for your message. I'm ${agentName} and I'd be happy to help you with that request.`,
      `That's something I can definitely assist with. As an AI ${agentName.replace("AI ", "")}, I'm designed to handle these kinds of inquiries efficiently.`,
      `Great question! I understand what you're asking about and can provide the information you need.`,
      `I appreciate you sharing that. Let me think about the best way to help you with this request.`,
      `I'm analyzing your question and can provide a detailed response. Would you like more specific information?`,
    ];

    // Customize based on agent type
    if (agent?.id === "sales") {
      if (
        message.includes("price") ||
        message.includes("cost") ||
        message.includes("pricing")
      ) {
        return `Our pricing is flexible and designed to meet your specific needs. We offer several tiers starting at $49/month for our basic package. I'd be happy to walk you through our options and find the best fit for your requirements.`;
      } else if (
        message.includes("demo") ||
        message.includes("try") ||
        message.includes("test")
      ) {
        return `I'd be excited to set up a personalized demo for you! Our demos typically take about 30 minutes and can be customized to focus on the features most relevant to your business. When would be a good time for you?`;
      }
    } else if (agent?.id === "customer-service") {
      if (
        message.includes("problem") ||
        message.includes("issue") ||
        message.includes("not working")
      ) {
        return `I'm sorry to hear you're experiencing an issue. Let's troubleshoot this together. Could you provide a few more details about what's happening? This will help me find the quickest resolution for you.`;
      } else if (
        message.includes("refund") ||
        message.includes("cancel") ||
        message.includes("money back")
      ) {
        return `I understand you're interested in a refund or cancellation. I'm here to make this process as smooth as possible. Can you confirm which service or product this is regarding? I'll guide you through the next steps.`;
      }
    } else if (agent?.id === "healthcare") {
      if (
        message.includes("appointment") ||
        message.includes("schedule") ||
        message.includes("book")
      ) {
        return `I'd be happy to help you schedule an appointment. We have openings this week on Tuesday afternoon and Thursday morning. Would either of those work for you? I can also check other availability if needed.`;
      } else if (
        message.includes("symptom") ||
        message.includes("pain") ||
        message.includes("feeling")
      ) {
        return `Thank you for sharing that information about your symptoms. While I can't provide medical advice, I can help schedule you with the appropriate specialist who can properly assess your condition. Would you prefer an in-person or telehealth appointment?`;
      }
    }

    // Generic response handling based on message content
    if (greetings.some((g) => message.includes(g))) {
      return `Hello! I'm your AI ${agentName.replace("AI ", "")}. How can I assist you today?`;
    } else if (questions.some((q) => message.startsWith(q))) {
      return `That's a great question. As your AI assistant, I'd be happy to provide that information for you. Could you share a bit more about your specific needs so I can tailor my response?`;
    }

    // If no specific pattern matched, use a random default response
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Handle lead form submission
  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!leadData.email || !leadData.firstName || !leadData.phone) {
      toast({
        title: "Please fill out required fields",
        description: "We need your name, email and phone number to continue.",
        variant: "destructive",
      });
      return;
    }

    // Simulate form submission
    toast({
      title: "Starting your demo",
      description: "Preparing your personalized AI experience...",
    });

    // Save lead data (in a real implementation, this would send to a CRM or database)
    console.log("Lead data captured:", leadData);

    // Move to full demo stage
    setStage("full-demo");
  };

  // Start a direct conversation with the AI agent using the custom interface
  const startCustomConversation = async () => {
    try {
      // Get agent type and gender
      const currentAgent = agent?.id || "default";
      const agentKey = `${currentAgent}-${selectedGender}`;

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation using our custom service
      const success = await conversationalAIService.startConversation(
        agentKey as any,
      );

      if (success) {
        toast({
          title: "Connected",
          description: "You can now speak with the AI assistant",
          variant: "default",
        });
      } else {
        toast({
          title: "Connection failed",
          description:
            "Could not connect to the AI assistant. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Error",
        description: "Microphone permission is required for this demo.",
        variant: "destructive",
      });
    }
  };

  // Stop the active conversation
  const stopCustomConversation = async () => {
    try {
      await conversationalAIService.stopConversation();
      toast({
        title: "Disconnected",
        description: "The conversation has ended",
        variant: "default",
      });
    } catch (error) {
      console.error("Error stopping conversation:", error);
    }
  };

  // Handle demo message submission
  const handleSendDemoMessage = async () => {
    if (!demoInput.trim()) return;

    // Add user message to chat
    setDemoMessages((prev) => [
      ...prev,
      {
        sender: "user",
        content: demoInput,
      },
    ]);

    // Save user input and clear input field
    const userMessage = demoInput;
    setDemoInput("");

    // Set speaking state
    setIsPlaying(true);

    try {
      // Get agent type and gender
      const agentType = agent?.id || "default";
      const gender = selectedGender || "male";

      // Format previous messages for the AI history
      const conversationHistory = demoMessages.map((msg) => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.content,
      }));

      try {
        // Send message to the appropriate Conversational AI agent
        const response = await conversationalAIService.sendMessageToAgent(
          userMessage,
          agentType,
          gender,
          conversationHistory,
        );

        // Add AI response to chat
        setDemoMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            content: response.text,
          },
        ]);

        // Play the audio response
        if (response.audio) {
          await conversationalAIService.playAudio(response.audio);

          // Set up event listener for when audio playback ends
          conversationalAIService.setupAudioEventListeners(
            undefined, // onStart callback
            () => {
              // When audio finishes playing
              setIsPlaying(false);
            },
            (error: Error) => {
              // On error
              console.error("Audio playback error:", error);
              setIsPlaying(false);
              toast({
                title: "Voice playback error",
                description: "There was an error playing the audio response.",
                variant: "destructive",
              });
            },
          );
        } else {
          // If no audio was returned, stop "speaking" state
          setIsPlaying(false);
          toast({
            title: "No audio response",
            description:
              "The AI agent responded but didn't provide audio. You can continue via text.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Failed to get agent response:", error);
        setIsPlaying(false);

        // Add a fallback response in case of error
        const fallbackResponse =
          "I'm sorry, I'm having trouble connecting to my voice service. Please try again or continue our conversation via text.";
        setDemoMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            content: fallbackResponse,
          },
        ]);

        toast({
          title: "Agent communication failed",
          description:
            "We couldn't connect to the AI agent. Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in agent communication:", error);
      setIsPlaying(false);

      // Add a fallback response
      setDemoMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          content:
            "I apologize, but I'm experiencing a technical issue. Please try again in a moment.",
        },
      ]);
    }
  };

  // Render dialog content based on current stage
  const renderDialogContent = () => {
    switch (stage) {
      case "gender-selection":
        return (
          <>
            <DialogHeader className="space-y-2 pb-2">
              <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-100 text-center">
                {agent?.name}
              </DialogTitle>
              <DialogDescription className="text-center text-blue-200 opacity-90">
                {agent?.description}
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <h3 className="text-lg font-medium mb-4 text-center">
                Would you like to talk with a male or female voice?
              </h3>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button
                  onClick={() => handleSelectGender("male")}
                  className="h-auto py-6 flex flex-col items-center gap-3 relative overflow-hidden border-0 group transition-all duration-300 bg-gradient-to-br from-blue-800 to-indigo-900 hover:from-blue-700 hover:to-indigo-800"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-indigo-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAgMCBMIDAgMCAwIDEwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  <Volume2
                    size={24}
                    className="relative z-10 text-blue-200 group-hover:text-blue-100"
                  />
                  <div className="text-lg font-medium relative z-10 text-white">
                    {maleName} (Male)
                  </div>
                </Button>

                <Button
                  onClick={() => handleSelectGender("female")}
                  className="h-auto py-6 flex flex-col items-center gap-3 relative overflow-hidden border-0 group transition-all duration-300 bg-gradient-to-br from-purple-800 to-indigo-900 hover:from-purple-700 hover:to-indigo-800"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-indigo-600/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAgMCBMIDAgMCAwIDEwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-purple-400 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  <Volume2
                    size={24}
                    className="relative z-10 text-purple-200 group-hover:text-purple-100"
                  />
                  <div className="text-lg font-medium relative z-10 text-white">
                    {femaleName} (Female)
                  </div>
                </Button>
              </div>
            </div>
          </>
        );

      case "widget-fallback":
        return (
          <>
            <DialogHeader className="border-b border-[#304060] pb-4 space-y-1">
              <div className="text-center">
                <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-100">
                  {selectedGender === "male" ? maleName : femaleName}
                </DialogTitle>
                <DialogDescription className="text-blue-200 opacity-90">
                  AI Voice Assistant
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="py-6">
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="text-center">
                  <div className="rounded-full bg-white hover:bg-slate-50 shadow-lg p-16 mb-6 transition-all duration-300 ease-in-out mx-auto">
                    <Volume2 size={64} className="text-blue-500" />
                  </div>
                  <p className="mb-6 text-slate-600">
                    Our voice assistant is currently undergoing maintenance.
                  </p>
                  <p className="mb-8 text-slate-600">
                    You can try again later or contact support for assistance:
                  </p>
                  <Button
                    className="px-8 py-2 bg-blue-600 hover:bg-blue-700 rounded-full shadow-md transition-all duration-300"
                    onClick={() => window.open("/contact", "_blank")}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Volume2 size={18} />
                      <span>Contact Support</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-[#304060] pt-2 sm:pt-3">
              <div className="text-xs sm:text-sm text-center w-full text-blue-300 opacity-80 font-medium">
                Powered by Foundations AI
              </div>
            </DialogFooter>
          </>
        );

      case "lead-capture":
        return (
          <>
            <DialogHeader className="border-b border-[#304060] py-2 xs:py-2.5 sm:py-3 pb-2.5 xs:pb-3 sm:pb-4 space-y-0.5 sm:space-y-1">
              <div className="text-center">
                <DialogTitle className="text-lg xs:text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-100">
                  Voice Demo Request
                </DialogTitle>
                <DialogDescription className="text-xs xs:text-sm sm:text-base text-blue-200 opacity-90">
                  Try a personalized AI voice conversation tailored to your use
                  case
                </DialogDescription>
              </div>
            </DialogHeader>

            <form
              onSubmit={handleSubmitLead}
              className="py-3 px-2 xs:py-4 xs:px-3 sm:py-6 sm:px-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xs:gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-blue-200 text-xs sm:text-sm"
                  >
                    First Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={leadData.firstName}
                    onChange={(e) =>
                      setLeadData({ ...leadData, firstName: e.target.value })
                    }
                    required
                    className="bg-[#1a253a] border-[#304060] focus:border-blue-500 text-white placeholder:text-blue-300/50"
                  />
                </div>

                <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-blue-200 text-xs sm:text-sm"
                  >
                    Last Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={leadData.lastName}
                    onChange={(e) =>
                      setLeadData({ ...leadData, lastName: e.target.value })
                    }
                    required
                    className="bg-[#1a253a] border-[#304060] focus:border-blue-500 text-white placeholder:text-blue-300/50"
                  />
                </div>

                <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-blue-200 text-xs sm:text-sm"
                  >
                    Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={leadData.email}
                    onChange={(e) =>
                      setLeadData({ ...leadData, email: e.target.value })
                    }
                    required
                    className="bg-[#1a253a] border-[#304060] focus:border-blue-500 text-white placeholder:text-blue-300/50"
                  />
                </div>

                <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="phone"
                    className="text-blue-200 text-xs sm:text-sm"
                  >
                    Phone Number <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={leadData.phone}
                    onChange={(e) =>
                      setLeadData({ ...leadData, phone: e.target.value })
                    }
                    required
                    className="bg-[#1a253a] border-[#304060] focus:border-blue-500 text-white placeholder:text-blue-300/50"
                  />
                </div>

                <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="businessName"
                    className="text-blue-200 text-xs sm:text-sm"
                  >
                    Business Name
                  </Label>
                  <Input
                    id="businessName"
                    value={leadData.businessName}
                    onChange={(e) =>
                      setLeadData({ ...leadData, businessName: e.target.value })
                    }
                    className="bg-[#1a253a] border-[#304060] focus:border-blue-500 text-white placeholder:text-blue-300/50"
                  />
                </div>

                <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="industry"
                    className="text-blue-200 text-xs sm:text-sm"
                  >
                    Industry
                  </Label>
                  <Input
                    id="industry"
                    value={leadData.industry}
                    onChange={(e) =>
                      setLeadData({ ...leadData, industry: e.target.value })
                    }
                    className="bg-[#1a253a] border-[#304060] focus:border-blue-500 text-white placeholder:text-blue-300/50"
                  />
                </div>

                <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="employees"
                    className="text-blue-200 text-xs sm:text-sm"
                  >
                    Number of Employees
                  </Label>
                  <Input
                    id="employees"
                    value={leadData.employees}
                    onChange={(e) =>
                      setLeadData({ ...leadData, employees: e.target.value })
                    }
                    className="bg-[#1a253a] border-[#304060] focus:border-blue-500 text-white placeholder:text-blue-300/50"
                  />
                </div>

                <div className="space-y-1 xs:space-y-1.5 sm:space-y-2">
                  <Label
                    htmlFor="budget"
                    className="text-blue-200 text-xs sm:text-sm"
                  >
                    AI Technology Budget
                  </Label>
                  <Input
                    id="budget"
                    value={leadData.budget}
                    onChange={(e) =>
                      setLeadData({ ...leadData, budget: e.target.value })
                    }
                    className="bg-[#1a253a] border-[#304060] focus:border-blue-500 text-white placeholder:text-blue-300/50"
                  />
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="w-full max-w-[90vw] xs:max-w-md py-2 xs:py-2.5 sm:py-3 rounded-full shadow-lg transition-all duration-300 relative group overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-indigo-800 hover:from-blue-500 hover:to-indigo-700"
                >
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAgMCBMIDAgMCAwIDEwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                  <div className="animate-pulse absolute inset-0 bg-blue-500/10 rounded-full blur-md group-hover:bg-blue-500/20"></div>
                  <div className="flex items-center justify-center gap-1 xs:gap-2 relative z-10">
                    <span className="text-sm xs:text-base font-medium">
                      Submit and Start Your Demo
                    </span>
                  </div>
                </Button>
              </div>
            </form>
          </>
        );

      case "full-demo":
        return (
          <>
            <DialogHeader className="border-b border-[#304060] py-2 xs:py-2.5 sm:py-3 pb-2.5 xs:pb-3 sm:pb-4 space-y-0.5 sm:space-y-1">
              <div className="text-center">
                <DialogTitle className="text-lg xs:text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-100">
                  {selectedGender === "male" ? maleName : femaleName}
                </DialogTitle>
                <DialogDescription className="text-xs xs:text-sm sm:text-base text-blue-200 opacity-90">
                  AI Voice Assistant
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="flex-1 py-3 px-3 xs:py-4 xs:px-3 sm:py-6 sm:px-4 flex flex-col bg-gradient-to-b from-[#0f1729] to-[#101b2e]">
              <div className="w-full">
                {/* Removed connection status indicator for cleaner UI */}

                {/* Simplified Voice Demo Interface */}
                <div className="flex-1 min-h-[180px] xs:min-h-[220px] sm:min-h-[280px] mb-3 sm:mb-6 flex flex-col items-center justify-center">
                  {!conversationalAIService.isConversationActive() ? (
                    <div className="h-full w-full flex flex-col items-center justify-center">
                      {/* Single button to start demo */}
                      <div
                        onClick={startCustomConversation}
                        className="rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 shadow-lg hover:shadow-blue-900/50 p-6 xs:p-8 sm:p-10 mb-4 sm:mb-6 cursor-pointer transition-all duration-300 ease-in-out relative group overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJncmlkIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxwYXRoIGQ9Ik0gMTAgMCBMIDAgMCAwIDEwIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
                        <div className="animate-pulse absolute inset-0 bg-blue-500/20 rounded-full blur-xl"></div>
                        <Mic
                          size={36}
                          className="text-white relative z-10 xs:w-10 xs:h-10 sm:w-12 sm:h-12"
                        />
                      </div>
                      <p className="text-blue-100 text-center font-medium text-base xs:text-lg">
                        Start Your Demo
                      </p>
                    </div>
                  ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center">
                      {/* Simple Voice Visualization */}
                      <div className="mb-4">
                        <VoiceWave
                          isActive={true}
                          numBars={16}
                          className="h-12 w-48 xs:h-14 xs:w-56 sm:h-16 sm:w-64"
                          mode={isPlaying ? "speaking" : "listening"}
                        />
                      </div>

                      {/* End conversation button */}
                      <Button
                        onClick={async () => {
                          console.log("End Voice Conversation button clicked");
                          try {
                            // Show loading state
                            toast({
                              title: "Ending conversation",
                              description: "Please wait while we clean up...",
                            });

                            // STEP 1: Force close any WebSocket connections from 11Labs
                            // Look in multiple places where the WebSocket might be stored
                            const closeWebSocket = (ws: any) => {
                              if (ws && typeof ws.close === "function") {
                                try {
                                  // Use code 1000 (normal closure) and reason
                                  ws.close(
                                    1000,
                                    "User terminated conversation",
                                  );
                                  console.log(
                                    "WebSocket forcibly closed successfully",
                                  );
                                  return true;
                                } catch (e) {
                                  console.error("Error closing WebSocket:", e);
                                }
                              }
                              return false;
                            };

                            // Try multiple places where the WebSocket might be stored
                            let wsFound = false;

                            // Check global variable
                            const globalWs = (window as any).__elevenlabsWs;
                            if (globalWs) {
                              wsFound = closeWebSocket(globalWs) || wsFound;
                              // Also null out the reference
                              (window as any).__elevenlabsWs = null;
                            }

                            // Check other possible locations
                            const elevenLabsClient = (window as any)
                              .elevenLabsClient;
                            if (elevenLabsClient && elevenLabsClient.socket) {
                              wsFound =
                                closeWebSocket(elevenLabsClient.socket) ||
                                wsFound;
                            }

                            if (!wsFound) {
                              console.log(
                                "No WebSocket connections found to close",
                              );
                            }

                            // STEP 2: Stop all audio playback
                            console.log("Stopping all audio playback");
                            document
                              .querySelectorAll("audio")
                              .forEach((audio) => {
                                try {
                                  audio.pause();
                                  audio.currentTime = 0;
                                  if (
                                    audio.srcObject &&
                                    audio.srcObject instanceof MediaStream
                                  ) {
                                    const tracks = audio.srcObject.getTracks();
                                    tracks.forEach((track: MediaStreamTrack) =>
                                      track.stop(),
                                    );
                                    audio.srcObject = null;
                                  }
                                  console.log("Audio element stopped");
                                } catch (e) {
                                  console.error(
                                    "Error stopping audio element:",
                                    e,
                                  );
                                }
                              });

                            // STEP 3: Close all audio contexts
                            if ((window as any).AudioContext) {
                              try {
                                // Create and immediately close a temporary context to force cleanup
                                const tempCtx = new AudioContext();
                                await tempCtx.close();
                                console.log("Audio context closed");
                              } catch (e) {
                                console.error(
                                  "Error closing audio context:",
                                  e,
                                );
                              }
                            }

                            // STEP 4: Make explicit call to terminate the conversation with 11Labs
                            console.log("Calling stopConversation service");
                            await conversationalAIService.stopConversation();
                            console.log("stopConversation completed");

                            // STEP 5: Cancel any pending fetch requests
                            try {
                              const controller = new AbortController();
                              controller.abort();
                              console.log("Pending requests aborted");
                            } catch (e) {
                              console.error(
                                "Error aborting pending requests:",
                                e,
                              );
                            }

                            // STEP 6: Success notification
                            toast({
                              title: "Conversation ended",
                              description:
                                "Voice conversation has been successfully terminated.",
                              variant: "default",
                            });

                            // STEP 7: Reset all client-side state
                            console.log("Resetting state");
                            setIsPlaying(false);
                            setDemoMessages([]);
                            setAudioIntensity(0);

                            // STEP 8: Close the dialog IMMEDIATELY
                            console.log("Closing dialog");
                            onOpenChange(false);
                            onClose();
                          } catch (error) {
                            console.error("Error ending conversation:", error);
                            // Show error notification but still force close dialog
                            toast({
                              title: "Error ending conversation",
                              description:
                                "There was a problem terminating the conversation, but we'll close the dialog anyway.",
                              variant: "destructive",
                            });
                            onOpenChange(false);
                            onClose();
                          }
                        }}
                        variant="outline"
                        className="flex items-center gap-1 xs:gap-2 mt-4 rounded-full border-blue-500/30 bg-blue-900/20 text-blue-200 hover:bg-blue-800/30 hover:text-blue-100 transition-all duration-300 text-xs xs:text-sm sm:text-base px-3 py-1.5 xs:px-4 xs:py-2 sm:px-5 sm:py-2.5"
                      >
                        <MicOff
                          size={14}
                          className="text-blue-300 w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5"
                        />
                        <span>End Voice Conversation</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-[#304060] pt-2 sm:pt-3">
              <div className="text-xs sm:text-sm text-center w-full text-blue-300 opacity-80 font-medium">
                Powered by Foundations AI
              </div>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog
        open={open && !showConfirmClose}
        onOpenChange={(newOpen) => {
          if (!newOpen) {
            handleCloseAttempt();
          } else {
            onOpenChange(true);
          }
        }}
      >
        <DialogContent
          className={`
          ${stage === "full-demo" ? "max-w-[95vw] xs:max-w-[90vw] sm:max-w-[600px] h-[90vh] sm:h-[600px] flex flex-col" : "max-w-[95vw] xs:max-w-[90vw] sm:max-w-[500px]"}
          ${stage === "lead-capture" ? "max-w-[95vw] xs:max-w-[90vw] sm:max-w-[600px]" : ""}
          bg-[#0f1729] text-white border-[#304060] shadow-xl shadow-blue-900/20
          data-[state=open]:animate-in data-[state=closed]:animate-out
          data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0
          data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95
          data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2
          transition-all duration-300
        `}
        >
          {renderDialogContent()}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent className="bg-[#0f1729] text-white border-[#304060] shadow-xl max-w-[90vw] xs:max-w-[85vw] sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white text-lg xs:text-xl">
              Are you sure you want to exit?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-200 text-xs sm:text-sm">
              All progress with this agent will be lost. You can always come
              back and try a different agent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={handleCancelClose}
              className="bg-transparent border-blue-400 text-blue-300 hover:bg-blue-900/20 hover:text-blue-100 text-xs xs:text-sm sm:text-base py-1.5 xs:py-2 px-2 xs:px-3 sm:px-4"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmClose}
              className="bg-blue-700 hover:bg-blue-600 text-white text-xs xs:text-sm sm:text-base py-1.5 xs:py-2 px-2 xs:px-3 sm:px-4"
            >
              Yes, exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
