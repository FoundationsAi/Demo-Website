import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { VoiceWave } from '@/components/voice-wave';
import { Mic, Volume2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

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
  const [_, navigate] = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [transcript, setTranscript] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Connect to the WebSocket on component mount
  useEffect(() => {
    initWebSocket();
    
    // Add a welcome message
    setMessages([{
      role: 'assistant',
      content: `Hi there! I'm ${agentName}, your AI ${agentType}. How can I help you today?`
    }]);

    // Start speaking immediately - simulate auto-greeting
    setTimeout(() => {
      setIsSpeaking(true);
      // Simulate greeting duration
      setTimeout(() => {
        setIsSpeaking(false);
      }, 3000);
    }, 800);

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize WebSocket connection
  const initWebSocket = () => {
    try {
      const ws = new WebSocket(`wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`);
      
      ws.onopen = () => {
        console.log('WebSocket connection established');
        
        // Send initialization data
        ws.send(JSON.stringify({
          type: 'conversation_initiation_client_data',
          history: [],
          autoplay_response: true,
          allow_interruption: true
        }));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        handleWebSocketMessage(data);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "Connection error",
          description: "Unable to connect to the AI agent. Please try again.",
          variant: "destructive"
        });
      };
      
      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('Error initializing WebSocket:', error);
    }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'user_transcript':
        setTranscript(data.text);
        break;
        
      case 'agent_response':
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.text
        }]);
        break;
        
      case 'audio_response':
        // Audio is being sent
        setIsSpeaking(true);
        // Typically the audio playback would be handled here
        break;
        
      case 'interruption':
        // Handle interruption
        setIsSpeaking(false);
        break;
        
      case 'ping':
        // Send a pong response
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'pong',
            sequence_number: data.sequence_number
          }));
        }
        break;
    }
  };

  // Start/stop listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Start listening for user input
  const startListening = () => {
    setIsListening(true);
    // In a real implementation, this would use the browser's audio API
    // to capture the user's voice and send it to the WebSocket
    
    // Simulate speaking for demo purposes
    setTimeout(() => {
      setTranscript('This is a simulated user message');
      setMessages(prev => [...prev, {
        role: 'user',
        content: 'This is a simulated user message'
      }]);
      stopListening();
      
      // Simulate AI response
      setTimeout(() => {
        const agentResponse = `As your AI ${agentType}, I'm here to assist you with any questions or requests you may have. I can provide information, help with tasks, or engage in conversation on various topics. What specific area would you like to explore today?`;
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: agentResponse
        }]);
        
        setIsSpeaking(true);
        setTimeout(() => {
          setIsSpeaking(false);
        }, 5000);
      }, 1000);
    }, 3000);
  };

  // Stop listening
  const stopListening = () => {
    setIsListening(false);
    setTranscript('');
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
          onClick={() => navigate('/')}
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
              <VoiceWave isActive={true} numBars={24} barClassName="bg-blue-500" className="h-12 mx-auto" />
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