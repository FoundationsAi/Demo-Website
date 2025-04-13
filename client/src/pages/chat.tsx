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
import { ArrowLeft, Mic, Send, User } from "lucide-react";

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
  const [agent, setAgent] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Find agent by ID
  useEffect(() => {
    const foundAgent = agents.find(a => a.id === agentId);
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
        agentId,
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
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Chat header */}
          <div className="flex items-center mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-4"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft size={20} />
            </Button>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-white font-bold mr-3">
                AI
              </div>
              <div>
                <h1 className="text-xl font-semibold">{agent.name}</h1>
                <p className="text-sm text-white/60">{agent.badge}</p>
              </div>
            </div>
          </div>
          
          {/* Chat container */}
          <div className="bg-[#1E1E1E]/80 border border-white/10 rounded-xl h-[70vh] flex flex-col">
            {/* Messages area */}
            <div className="flex-grow p-4 overflow-y-auto">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`flex items-start gap-3 mb-4 ${
                    message.sender === "user" ? "justify-end" : ""
                  }`}
                >
                  {message.sender === "ai" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      AI
                    </div>
                  )}
                  
                  <div 
                    className={`px-4 py-3 max-w-[80%] ${
                      message.sender === "user" 
                        ? "bg-secondary/20 rounded-lg rounded-tr-none" 
                        : "bg-[#2D2D2D] rounded-lg rounded-tl-none"
                    }`}
                  >
                    {message.content}
                  </div>
                  
                  {message.sender === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <User size={16} />
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    AI
                  </div>
                  <div className="px-4 py-3 bg-[#2D2D2D] rounded-lg rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse"></div>
                      <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Voice wave animation */}
            {isRecording && (
              <div className="px-4">
                <VoiceWave isActive={true} />
              </div>
            )}
            
            {/* Input area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Button
                  type="button"
                  className={`${
                    isRecording 
                      ? "bg-red-500 hover:bg-red-600" 
                      : "bg-secondary hover:bg-secondary/90"
                  } rounded-full w-10 h-10 flex-shrink-0 p-0`}
                  onClick={toggleRecording}
                >
                  <Mic size={18} />
                </Button>
                
                <div className="relative flex-grow">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    className="w-full bg-[#2D2D2D] border border-white/10 rounded-full py-2 pr-10"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isRecording}
                  />
                  <Button
                    type="button"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-transparent hover:bg-white/10 text-white/80 hover:text-white rounded-full"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isRecording}
                  >
                    <Send size={16} />
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
