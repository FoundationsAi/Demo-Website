import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceWave } from "@/components/voice-wave";
import { useToast } from "@/hooks/use-toast";
import { agents } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Mic, Send, User, ChevronDown } from "lucide-react";

type Message = {
  id: string;
  sender: "ai" | "user";
  content: string;
  timestamp: Date;
};

export const Chat: React.FC = () => {
  const { agentId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [agent, setAgent] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showHeaderInfo, setShowHeaderInfo] = useState(!isMobile);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find agent by ID or use default agent
  useEffect(() => {
    // Use a default agent if none is provided
    const defaultAgentId = "customer-service";
    const targetAgentId = agentId || defaultAgentId;
    
    const foundAgent = agents.find(a => a.id === targetAgentId);
    if (foundAgent) {
      setAgent(foundAgent);
      
      // Add initial greeting
      setMessages([
        {
          id: "greeting",
          sender: "ai",
          content: `Hello! I'm an AI ${foundAgent.name}. How can I assist you today?`,
          timestamp: new Date()
        }
      ]);
      
      // If we came in without an agent ID, redirect to include the default agent ID
      if (!agentId) {
        setLocation(`/chat/${defaultAgentId}`, { replace: true });
      }
    } else {
      toast({
        title: "Agent Not Found",
        description: "The selected agent was not found. Please try another agent.",
        variant: "destructive"
      });
      setLocation("/");
    }
  }, [agentId, setLocation, toast]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);
    
    try {
      // Call API to get AI response
      const response = await apiRequest("POST", "/api/chat", {
        agentId: agentId || "customer-service", // Use default if none provided
        message: inputMessage
      });
      
      const data = await response.json();
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response from the AI agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        setIsRecording(true);
        
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        
        toast({
          title: "Voice Recording Started",
          description: "Speak now. The recording will automatically stop after you finish speaking.",
        });
        
        // Simulate voice recording and processing
        setTimeout(() => {
          setIsRecording(false);
          setInputMessage("I'd like to know more about your voice AI capabilities.");
        }, 3000);
      } catch (error) {
        setIsRecording(false);
        toast({
          title: "Microphone Access Denied",
          description: "Please allow microphone access to use voice input.",
          variant: "destructive"
        });
      }
    } else {
      setIsRecording(false);
    }
  };

  if (!agent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <Header />
      
      <main className="flex-grow pt-16 md:pt-20">
        <div className="container mx-auto px-2 md:px-4 py-3 md:py-6 max-w-4xl">
          {/* Chat header - mobile optimized */}
          <div className="flex items-center mb-4 md:mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2 md:mr-4"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft size={isMobile ? 18 : 20} />
            </Button>
            
            <div 
              className="flex items-center flex-grow" 
              onClick={() => isMobile && setShowHeaderInfo(!showHeaderInfo)}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary flex items-center justify-center text-white font-bold mr-2 md:mr-3 flex-shrink-0`}>
                AI
              </div>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg md:text-xl font-semibold">{agent.name}</h1>
                  {isMobile && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="p-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHeaderInfo(!showHeaderInfo);
                      }}
                    >
                      <ChevronDown 
                        size={18} 
                        className={`transition-transform duration-300 ${showHeaderInfo ? 'rotate-180' : ''}`} 
                      />
                    </Button>
                  )}
                </div>
                {(showHeaderInfo || !isMobile) && (
                  <div className="text-sm text-white/60 flex items-center">
                    <span className="mr-1">{agent.badge}</span>
                    {isMobile && agent.tags && agent.tags.length > 0 && (
                      <span className="text-xs bg-secondary/20 px-2 py-0.5 rounded-full">
                        {agent.tags[0]}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chat container - mobile optimized */}
          <div className="bg-[#1E1E1E]/80 border border-white/10 rounded-xl h-[65vh] md:h-[70vh] flex flex-col">
            {/* Messages area */}
            <div className="flex-grow p-3 md:p-4 overflow-y-auto">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex items-start gap-2 md:gap-3 mb-3 md:mb-4 ${
                    message.sender === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.sender === "ai" && (
                    <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary flex items-center justify-center text-xs md:text-sm">
                      AI
                    </div>
                  )}
                  
                  <div 
                    className={`px-3 py-2 md:px-4 md:py-3 max-w-[85%] md:max-w-[80%] text-sm md:text-base ${
                      message.sender === "user" 
                        ? "bg-secondary/20 rounded-lg rounded-tr-none" 
                        : "bg-[#2D2D2D] rounded-lg rounded-tl-none"
                    }`}
                  >
                    {message.content}
                  </div>
                  
                  {message.sender === "user" && (
                    <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-accent flex items-center justify-center">
                      <User size={isMobile ? 14 : 16} />
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex items-start gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-secondary flex items-center justify-center text-xs md:text-sm">
                    AI
                  </div>
                  <div className="px-3 py-2 md:px-4 md:py-3 bg-[#2D2D2D] rounded-lg rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/40 rounded-full animate-pulse"></div>
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Voice wave animation */}
            {isRecording && (
              <div className="px-3 md:px-4">
                <VoiceWave isActive={true} numBars={isMobile ? 20 : 30} />
              </div>
            )}
            
            {/* Input area - mobile optimized */}
            <div className="p-3 md:p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Button
                  type="button"
                  className={`${
                    isRecording 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-secondary hover:bg-secondary/90"
                  } rounded-full w-9 h-9 md:w-10 md:h-10 flex-shrink-0 p-0`}
                  onClick={toggleRecording}
                >
                  <Mic size={isMobile ? 16 : 18} />
                </Button>
                
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder={isMobile ? "Message..." : "Type your message..."}
                    className="w-full h-9 md:h-10 text-sm md:text-base bg-[#2D2D2D] border border-white/10 rounded-full py-1 md:py-2 pr-8 md:pr-10"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isRecording}
                  />
                  <Button
                    type="button"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 md:h-8 md:w-8 p-0 bg-transparent hover:bg-white/10 text-white/80 hover:text-white rounded-full"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isRecording}
                  >
                    <Send size={isMobile ? 14 : 16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Chat;
