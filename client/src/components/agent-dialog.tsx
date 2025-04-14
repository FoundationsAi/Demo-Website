import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { VoiceWave } from '@/components/voice-wave';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { X, Mic, Send, Volume2 } from 'lucide-react';

// Stages of the dialog flow
type DialogStage = 'gender-selection' | 'mini-chat' | 'lead-capture' | 'full-demo';

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
  onClose 
}) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [stage, setStage] = useState<DialogStage>('gender-selection');
  const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
  const [message, setMessage] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [leadData, setLeadData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    businessName: '',
    industry: '',
    employees: '',
    budget: ''
  });

  // Full screen demo state (when user is in the full demo experience)
  const [demoMessages, setDemoMessages] = useState<{sender: 'user' | 'ai', content: string}[]>([]);
  const [demoInput, setDemoInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset states when dialog opens
  useEffect(() => {
    if (open) {
      setStage('gender-selection');
      setSelectedGender(null);
      setMessage('');
      setIsPlaying(false);
      setDemoMessages([]);
      setDemoInput('');
    }
  }, [open]);

  // Scroll to bottom when new messages appear in full demo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [demoMessages]);

  // Handle closing attempt
  const handleCloseAttempt = () => {
    // If we're past the gender selection and not already showing confirm dialog
    if (stage !== 'gender-selection' && !showConfirmClose) {
      setShowConfirmClose(true);
      return;
    }
    
    // Otherwise just close
    handleConfirmClose();
  };

  // Handle confirmed close
  const handleConfirmClose = () => {
    setShowConfirmClose(false);
    onOpenChange(false);
    onClose();
  };

  // Handle cancel close
  const handleCancelClose = () => {
    setShowConfirmClose(false);
  };

  // Handle gender selection
  const handleSelectGender = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    setStage('mini-chat');
  };

  // Handle submit mini chat message
  const handleSubmitMiniChat = () => {
    if (!message.trim()) return;
    
    setIsPlaying(true);
    
    // Simulate voice playback (would be replaced with actual 11 Labs API call)
    setTimeout(() => {
      setIsPlaying(false);
      
      // After playback, show lead capture form
      setTimeout(() => {
        setStage('lead-capture');
      }, 500);
    }, 3000);
  };

  // Handle lead form submission
  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!leadData.email || !leadData.firstName || !leadData.phone) {
      toast({
        title: "Please fill out required fields",
        description: "We need your name, email and phone number to continue.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate form submission
    toast({
      title: "Starting your demo",
      description: "Preparing your personalized AI experience..."
    });
    
    // Initialize the demo chat with a greeting message
    const agentName = selectedGender === 'male' ? 'Steve' : 'Sarah';
    setDemoMessages([
      {
        sender: 'ai',
        content: `Hi there! I'm ${agentName}, your AI ${agent?.name.replace('AI ', '')}. How can I assist you today?`
      }
    ]);
    
    // Move to full demo stage
    setStage('full-demo');
  };

  // Handle demo message submission
  const handleSendDemoMessage = () => {
    if (!demoInput.trim()) return;
    
    // Add user message
    setDemoMessages(prev => [...prev, {
      sender: 'user',
      content: demoInput
    }]);
    
    setDemoInput('');
    
    // Simulate AI response (would be replaced with actual API call)
    setTimeout(() => {
      const responses = [
        "I understand what you're looking for. Can you tell me more about your specific needs?",
        "That's a great question. Based on your industry, I'd recommend our premium package.",
        "I'd be happy to help with that. First, let me gather some more information.",
        "I can definitely assist with that request. What timeline are you working with?",
        "Thanks for sharing that. Would you like me to schedule a follow-up with one of our specialists?"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setDemoMessages(prev => [...prev, {
        sender: 'ai',
        content: randomResponse
      }]);
    }, 2000);
  };

  // Render dialog content based on current stage
  const renderDialogContent = () => {
    switch (stage) {
      case 'gender-selection':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center sm:text-left">
                {agent?.name}
              </DialogTitle>
              <DialogDescription className="text-center sm:text-left mt-2">
                {agent?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6">
              <h3 className="text-lg font-medium mb-4 text-center">
                Would you like to talk with a male or female voice?
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <Button 
                  onClick={() => handleSelectGender('male')}
                  className="h-auto py-6 flex flex-col items-center gap-3 bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700"
                >
                  <Volume2 size={24} />
                  <div className="text-lg font-medium">Steve (Male)</div>
                </Button>
                
                <Button 
                  onClick={() => handleSelectGender('female')}
                  className="h-auto py-6 flex flex-col items-center gap-3 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700"
                >
                  <Volume2 size={24} />
                  <div className="text-lg font-medium">Sarah (Female)</div>
                </Button>
              </div>
            </div>
          </>
        );
        
      case 'mini-chat':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Talk to {selectedGender === 'male' ? 'Steve' : 'Sarah'}
              </DialogTitle>
              <DialogDescription>
                Type a short message to hear how the AI agent responds with their voice
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6">
              <div className="relative mb-4">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a short message to hear how the agent responds..."
                  className="resize-none p-4 pr-12 min-h-[100px]"
                  maxLength={150}
                  disabled={isPlaying}
                />
                
                {/* Character counter */}
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {message.length}/150
                </div>
              </div>
              
              {/* Voice wave animation */}
              {isPlaying && (
                <div className="mb-4">
                  <div className="mb-2 text-sm text-center text-muted-foreground">
                    {selectedGender === 'male' ? 'Steve' : 'Sarah'} is speaking...
                  </div>
                  <VoiceWave isActive={true} numBars={20} className="h-12 mx-auto" />
                </div>
              )}
              
              <div className="flex justify-center">
                <Button 
                  onClick={handleSubmitMiniChat} 
                  className="gap-2"
                  disabled={!message.trim() || isPlaying}
                >
                  <Volume2 size={18} />
                  <span>Speak Message</span>
                </Button>
              </div>
            </div>
            
            {!isPlaying && (
              <DialogFooter>
                <div className="text-sm text-center w-full text-muted-foreground">
                  Powered by 11Labs realistic voice technology
                </div>
              </DialogFooter>
            )}
          </>
        );
        
      case 'lead-capture':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl text-center">
                Want to try a full demo conversation tailored to your use case—for free?
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmitLead} className="py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="firstName" 
                    value={leadData.firstName}
                    onChange={(e) => setLeadData({...leadData, firstName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="lastName" 
                    value={leadData.lastName}
                    onChange={(e) => setLeadData({...leadData, lastName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={leadData.email}
                    onChange={(e) => setLeadData({...leadData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                  <Input 
                    id="phone" 
                    type="tel"
                    value={leadData.phone}
                    onChange={(e) => setLeadData({...leadData, phone: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input 
                    id="businessName" 
                    value={leadData.businessName}
                    onChange={(e) => setLeadData({...leadData, businessName: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input 
                    id="industry" 
                    value={leadData.industry}
                    onChange={(e) => setLeadData({...leadData, industry: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="employees">Number of Employees</Label>
                  <Input 
                    id="employees" 
                    value={leadData.employees}
                    onChange={(e) => setLeadData({...leadData, employees: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget">AI Technology Budget</Label>
                  <Input 
                    id="budget" 
                    value={leadData.budget}
                    onChange={(e) => setLeadData({...leadData, budget: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-center">
                <Button 
                  type="submit"
                  className="w-full md:w-auto px-8 py-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700"
                >
                  Submit and Start Demo
                </Button>
              </div>
            </form>
          </>
        );
        
      case 'full-demo':
        return (
          <>
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mr-3">
                  <span className="text-lg">{agent?.icon || '🤖'}</span>
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    {selectedGender === 'male' ? 'Steve' : 'Sarah'} ({agent?.name})
                  </DialogTitle>
                  <DialogDescription>
                    AI {agent?.name.replace('AI ', '')}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto py-4 px-2 max-h-[400px] min-h-[300px]">
              {demoMessages.map((msg, i) => (
                <div 
                  key={i}
                  className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`px-4 py-3 rounded-2xl max-w-[80%] ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-gray-800 text-white rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Input
                  value={demoInput}
                  onChange={(e) => setDemoInput(e.target.value)}
                  placeholder="Type your message..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendDemoMessage();
                    }
                  }}
                />
                <Button 
                  onClick={handleSendDemoMessage}
                  disabled={!demoInput.trim()}
                  className="shrink-0"
                >
                  <Send size={18} />
                </Button>
              </div>
              <div className="text-xs text-center mt-3 text-muted-foreground">
                You're in a 5-minute demo with {selectedGender === 'male' ? 'Steve' : 'Sarah'}.
                You can exit anytime to try a different agent.
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      {/* Main Dialog */}
      <Dialog open={open && !showConfirmClose} onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleCloseAttempt();
        } else {
          onOpenChange(true);
        }
      }}>
        <DialogContent className={`
          ${stage === 'full-demo' ? 'sm:max-w-[600px] sm:h-[600px] flex flex-col' : 'sm:max-w-[500px]'}
          ${stage === 'lead-capture' ? 'sm:max-w-[600px]' : ''}
        `}>
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmClose} onOpenChange={setShowConfirmClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to exit?</AlertDialogTitle>
            <AlertDialogDescription>
              All progress with this agent will be lost. You can always come back and try a different agent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>Yes, exit</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};