import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { VoiceWave } from '@/components/voice-wave';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import * as conversationalAIService from '@/lib/conversationalAIService';

interface FullPageAgentProps {
  agentId: string;
  agentName: string;
  agentType: string;
  agentIcon?: string;
}

export const FullPageAgent: React.FC<FullPageAgentProps> = ({
  agentId,
  agentName,
  agentType,
  agentIcon = '🤖'
}) => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [transcript, setTranscript] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Connect to the 11Labs Conversational AI service when component mounts
  useEffect(() => {
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: `Hi there! I'm ${agentName}, your AI ${agentType}. How can I help you today?`
    }]);

    // Set up status change listener
    const unsubscribeStatus = conversationalAIService.onConnectionStatusChange((status) => {
      setConnectionStatus(status);
      
      if (status === 'connected') {
        console.log('Connected to conversational AI agent');
        // Start speaking indication 
        setIsSpeaking(true);
      } else if (status === 'error') {
        toast({
          title: "Connection error",
          description: "Unable to connect to the AI agent. Please try again.",
          variant: "destructive"
        });
      } else if (status === 'disconnected') {
        setIsSpeaking(false);
        setIsListening(false);
      }
    });

    // Set up message listener
    const unsubscribeMessage = conversationalAIService.onMessage((message) => {
      console.log('Received message from agent:', message);
      
      // Handle different message types
      if (message.type === 'user_transcript') {
        setTranscript(message.text || '');
      } 
      else if (message.type === 'agent_response' && message.text) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: message.text
        }]);
      }
      else if (message.type === 'audio_response') {
        // Audio response is being sent
        setIsSpeaking(true);
      }
      else if (message.type === 'interruption') {
        setIsSpeaking(false);
      }
      else if (message.type === 'audio_response_end') {
        // Audio response has finished playing
        setIsSpeaking(false);
      }
    });

    // Start the conversation with the appropriate agent
    const startupConversation = async () => {
      try {
        // Detect which agent we need (Steve or Sarah based on the agent ID)
        const agentType = agentId === '0Ako2MORgNjlSpGTU75E' ? 'STEVE' : 'SARAH';
        setConnectionStatus('connecting');
        
        const success = await conversationalAIService.startConversation(agentType);
        
        if (!success) {
          toast({
            title: "Connection failed",
            description: "Failed to connect to the voice agent. Please try again.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error starting conversation:', error);
        toast({
          title: "Connection error",
          description: "There was an error connecting to the AI voice service.",
          variant: "destructive"
        });
      }
    };

    // Start the conversation
    startupConversation();

    // Cleanup function to stop conversation when component unmounts
    return () => {
      conversationalAIService.stopConversation();
      unsubscribeStatus();
      unsubscribeMessage();
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // Toggle listening state
  const toggleListening = async () => {
    if (connectionStatus !== 'connected') {
      toast({
        title: "Not connected",
        description: "Waiting for connection to the voice service...",
        variant: "default"
      });
      return;
    }

    if (isListening) {
      // If we were listening, stop
      setIsListening(false);
      setTranscript('');
    } else {
      // If we weren't listening, start
      setIsListening(true);
      
      // In a real implementation, this would trigger voice capture
      // For now, we'll simulate a user message after a short delay
      setTimeout(() => {
        if (isListening) {
          const userMessage = "Tell me more about your voice AI services";
          setTranscript(userMessage);
          
          // Add to messages after a short delay to simulate processing
          setTimeout(() => {
            setMessages(prev => [...prev, {
              role: 'user',
              content: userMessage
            }]);
            setTranscript('');
            setIsListening(false);
          }, 1000);
        }
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center">
            <span className="text-lg">{agentIcon}</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">{agentName}</h1>
            <p className="text-sm text-gray-400">AI {agentType}</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation('/')}
          className="text-gray-400 hover:text-white"
        >
          <X size={24} />
        </Button>
      </div>
      
      {/* Chat area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">{agentIcon}</span>
              </div>
            )}
            
            <div 
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-gray-800 text-white rounded-bl-none'
              }`}
            >
              {msg.content}
            </div>
            
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                <span className="text-sm">👤</span>
              </div>
            )}
          </div>
        ))}
        
        {/* Transcript */}
        {isListening && transcript && (
          <div className="flex justify-end items-end gap-3">
            <div className="max-w-[80%] px-4 py-3 rounded-2xl bg-blue-600/50 text-white rounded-br-none">
              {transcript}
            </div>
            
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
              <span className="text-sm">👤</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Voice control area */}
      <div className="p-6 border-t border-gray-800 bg-gray-950">
        <div className="flex flex-col items-center">
          {isSpeaking ? (
            <div className="mb-6 text-center">
              <div className="mb-2 text-white">{agentName} is speaking...</div>
              <VoiceWave isActive={true} numBars={24} className="h-12 mx-auto" />
            </div>
          ) : isListening ? (
            <div className="mb-6 text-center">
              <div className="mb-2 text-white">Listening...</div>
              <VoiceWave isActive={true} numBars={24} className="h-12 mx-auto text-blue-500" />
            </div>
          ) : (
            <div className="mb-6 text-center">
              <div className="text-white mb-2">Click the microphone to speak</div>
            </div>
          )}
          
          <Button
            disabled={isSpeaking}
            onClick={toggleListening}
            className={`h-16 w-16 rounded-full ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700'
            }`}
          >
            <Mic size={28} />
          </Button>
        </div>
      </div>
    </div>
  );
};