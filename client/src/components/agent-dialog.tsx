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
import { X, Mic, Send, Volume2, ExternalLink } from 'lucide-react';

// Stages of the dialog flow
type DialogStage = 'gender-selection' | 'lead-capture' | 'full-demo' | 'widget-fallback';

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
  
  // Add effect to embed widget when in full-demo stage
  useEffect(() => {
    if (stage === 'full-demo') {
      // Short delay to ensure the container is rendered
      const timer = setTimeout(() => {
        embedWidget();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [stage, selectedGender]);

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

  // Get appropriate voice names based on agent type
  const getVoiceNames = () => {
    // Default fallback names
    let maleName = "Michael";
    let femaleName = "Sarah";
    
    // Customize based on agent type
    switch (agent?.id) {
      case "customer-service":
        maleName = "Chris";
        femaleName = "Emily";
        break;
      case "sales":
        maleName = "Steve";
        femaleName = "Rachel";
        break;
      case "receptionist":
        maleName = "Robert";
        femaleName = "Jessica";
        break;
      case "mortgage":
        maleName = "Thomas";
        femaleName = "Amanda";
        break;
      case "healthcare":
        maleName = "David";
        femaleName = "Sophia";
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
  const handleSelectGender = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    // Skip mini-chat and go directly to lead capture
    setStage('lead-capture');
  };

  // Handle submit mini chat message
  const handleSubmitMiniChat = async () => {
    if (!message.trim()) return;
    
    setIsPlaying(true);
    
    try {
      // Get agent type from agent id
      const agentType = agent?.id || 'default';
      const gender = selectedGender || 'male';
      
      // Use 11 Labs Conversational AI agents
      await import('@/lib/conversationalAIService').then(async ({ sendMessageToAgent, playAudio, setupAudioEventListeners }) => {
        try {
          // Send message to the appropriate Conversational AI agent
          const response = await sendMessageToAgent(message, agentType, gender);
          
          // Play the audio response
          await playAudio(response.audio);
          
          // Set up event listener for when audio playback ends
          setupAudioEventListeners(
            undefined, // onStart callback
            () => {
              // When audio finishes playing
              setIsPlaying(false);
              
              // After a short delay, proceed to lead capture
              setTimeout(() => {
                setStage('lead-capture');
              }, 500);
            },
            (error) => {
              // On error
              console.error("Audio playback error:", error);
              setIsPlaying(false);
              toast({
                title: "Voice playback error",
                description: "There was an error playing the audio response.",
                variant: "destructive"
              });
            }
          );
        } catch (error) {
          console.error("Failed to get agent response:", error);
          setIsPlaying(false);
          toast({
            title: "Agent communication failed",
            description: "We couldn't connect to the AI agent. Please try again later.",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error("Error in agent communication:", error);
      setIsPlaying(false);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Helper function to generate AI responses based on user input
  const getAIResponse = (userMessage: string, agentName: string): string => {
    // Simple response generation based on agent type and user message
    const message = userMessage.toLowerCase();
    const greetings = ["hi", "hello", "hey", "greetings"];
    const questions = ["how", "what", "why", "when", "where", "who", "can", "could", "would"];
    
    // Default response templates
    let responses = [
      `Thank you for your message. I'm ${agentName} and I'd be happy to help you with that request.`,
      `That's something I can definitely assist with. As an AI ${agentName.replace('AI ', '')}, I'm designed to handle these kinds of inquiries efficiently.`,
      `Great question! I understand what you're asking about and can provide the information you need.`,
      `I appreciate you sharing that. Let me think about the best way to help you with this request.`,
      `I'm analyzing your question and can provide a detailed response. Would you like more specific information?`
    ];
    
    // Customize based on agent type
    if (agent?.id === "sales") {
      if (message.includes("price") || message.includes("cost") || message.includes("pricing")) {
        return `Our pricing is flexible and designed to meet your specific needs. We offer several tiers starting at $49/month for our basic package. I'd be happy to walk you through our options and find the best fit for your requirements.`;
      } else if (message.includes("demo") || message.includes("try") || message.includes("test")) {
        return `I'd be excited to set up a personalized demo for you! Our demos typically take about 30 minutes and can be customized to focus on the features most relevant to your business. When would be a good time for you?`;
      }
    } else if (agent?.id === "customer-service") {
      if (message.includes("problem") || message.includes("issue") || message.includes("not working")) {
        return `I'm sorry to hear you're experiencing an issue. Let's troubleshoot this together. Could you provide a few more details about what's happening? This will help me find the quickest resolution for you.`;
      } else if (message.includes("refund") || message.includes("cancel") || message.includes("money back")) {
        return `I understand you're interested in a refund or cancellation. I'm here to make this process as smooth as possible. Can you confirm which service or product this is regarding? I'll guide you through the next steps.`;
      }
    } else if (agent?.id === "healthcare") {
      if (message.includes("appointment") || message.includes("schedule") || message.includes("book")) {
        return `I'd be happy to help you schedule an appointment. We have openings this week on Tuesday afternoon and Thursday morning. Would either of those work for you? I can also check other availability if needed.`;
      } else if (message.includes("symptom") || message.includes("pain") || message.includes("feeling")) {
        return `Thank you for sharing that information about your symptoms. While I can't provide medical advice, I can help schedule you with the appropriate specialist who can properly assess your condition. Would you prefer an in-person or telehealth appointment?`;
      }
    }
    
    // Generic response handling based on message content
    if (greetings.some(g => message.includes(g))) {
      return `Hello! I'm your AI ${agentName.replace('AI ', '')}. How can I assist you today?`;
    } else if (questions.some(q => message.startsWith(q))) {
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
        variant: "destructive"
      });
      return;
    }
    
    // Simulate form submission
    toast({
      title: "Starting your demo",
      description: "Preparing your personalized AI experience..."
    });
    
    // Save lead data (in a real implementation, this would send to a CRM or database)
    console.log("Lead data captured:", leadData);
    
    // Move to full demo stage
    setStage('full-demo');
  };
  
  // Function to embed the 11Labs widget directly
  const embedWidget = () => {
    // Only perform this if we're in the browser
    if (typeof window !== 'undefined') {
      // Create the widget element
      const widgetEl = document.createElement('elevenlabs-convai');
      
      // Set the agent ID based on selected gender
      const agentId = selectedGender === 'male' ? '0Ako2MORgNjlSpGTU75E' : 'Jw7iQ8oXMG3MZeuyLfmH';
      widgetEl.setAttribute('agent-id', agentId);
      
      // Find the widget container element
      const container = document.getElementById('widget-container');
      if (container) {
        // Clear any existing content
        container.innerHTML = '';
        // Append the widget
        container.appendChild(widgetEl);
        
        // Add the script if it doesn't exist yet
        if (!document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]')) {
          const scriptEl = document.createElement('script');
          scriptEl.src = 'https://elevenlabs.io/convai-widget/index.js';
          scriptEl.async = true;
          document.body.appendChild(scriptEl);
        }
      }
    }
  };

  // Handle demo message submission
  const handleSendDemoMessage = async () => {
    if (!demoInput.trim()) return;
    
    // Add user message to chat
    setDemoMessages(prev => [...prev, {
      sender: 'user',
      content: demoInput
    }]);
    
    // Save user input and clear input field
    const userMessage = demoInput;
    setDemoInput('');
    
    // Set speaking state
    setIsPlaying(true);
    
    try {
      // Get agent type and gender
      const agentType = agent?.id || 'default';
      const gender = selectedGender || 'male';
      
      // Format previous messages for the AI history
      const conversationHistory = demoMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      
      // Use 11 Labs Conversational AI agents
      await import('@/lib/conversationalAIService').then(async ({ sendMessageToAgent, playAudio, setupAudioEventListeners }) => {
        try {
          // Send message to the appropriate Conversational AI agent
          const response = await sendMessageToAgent(userMessage, agentType, gender, conversationHistory);
          
          // Add AI response to chat
          setDemoMessages(prev => [...prev, {
            sender: 'ai',
            content: response.text
          }]);
          
          // Play the audio response
          if (response.audio) {
            await playAudio(response.audio);
            
            // Set up event listener for when audio playback ends
            setupAudioEventListeners(
              undefined, // onStart callback
              () => {
                // When audio finishes playing
                setIsPlaying(false);
              },
              (error) => {
                // On error
                console.error("Audio playback error:", error);
                setIsPlaying(false);
                toast({
                  title: "Voice playback error",
                  description: "There was an error playing the audio response.",
                  variant: "destructive"
                });
              }
            );
          } else {
            // If no audio was returned, stop "speaking" state
            setIsPlaying(false);
            toast({
              title: "No audio response",
              description: "The AI agent responded but didn't provide audio. You can continue via text.",
              variant: "default"
            });
          }
        } catch (error) {
          console.error("Failed to get agent response:", error);
          setIsPlaying(false);
          
          // Add a fallback response in case of error
          const fallbackResponse = "I'm sorry, I'm having trouble connecting to my voice service. Please try again or continue our conversation via text.";
          setDemoMessages(prev => [...prev, {
            sender: 'ai',
            content: fallbackResponse
          }]);
          
          toast({
            title: "Agent communication failed",
            description: "We couldn't connect to the AI agent. Please try again later.",
            variant: "destructive"
          });
        }
      });
    } catch (error) {
      console.error("Error in agent communication:", error);
      setIsPlaying(false);
      
      // Add a fallback response
      setDemoMessages(prev => [...prev, {
        sender: 'ai',
        content: "I apologize, but I'm experiencing a technical issue. Please try again in a moment."
      }]);
    }
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
                  <div className="text-lg font-medium">{maleName} (Male)</div>
                </Button>
                
                <Button 
                  onClick={() => handleSelectGender('female')}
                  className="h-auto py-6 flex flex-col items-center gap-3 bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700"
                >
                  <Volume2 size={24} />
                  <div className="text-lg font-medium">{femaleName} (Female)</div>
                </Button>
              </div>
            </div>
          </>
        );
        
      case 'widget-fallback':
        return (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                Talk to {selectedGender === 'male' ? maleName : femaleName}
              </DialogTitle>
              <DialogDescription>
                Chat with our AI agent using the 11Labs widget
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-6">
              <div className="flex justify-center items-center min-h-[300px]">
                <div className="text-center">
                  <p className="mb-4">Our embedded AI agent is currently undergoing maintenance.</p>
                  <p className="mb-4">You can also try our 11Labs widget experience:</p>
                  <Button 
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                    onClick={() => window.open('https://elevenlabs.io/speech-synthesis', '_blank')}
                  >
                    <Volume2 size={18} />
                    <span>Try 11Labs Widget</span>
                  </Button>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <div className="text-sm text-center w-full text-muted-foreground">
                Powered by 11Labs realistic voice technology
              </div>
            </DialogFooter>
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
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mr-3">
                  <span className="text-lg">{agent?.icon || '🤖'}</span>
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    {selectedGender === 'male' ? maleName : femaleName} ({agent?.name})
                  </DialogTitle>
                  <DialogDescription>
                    AI {agent?.name.replace('AI ', '')}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            
            <div className="flex-1 py-6 px-4 flex flex-col items-center justify-center">
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold mb-2">Voice Conversation with {selectedGender === 'male' ? maleName : femaleName}</h3>
                  <p className="text-muted-foreground">
                    Click the button below to begin speaking with your AI {agent?.name.replace('AI ', '')}
                  </p>
                </div>
                
                <Button 
                  size="lg"
                  className="h-auto py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-full shadow-lg transition-all duration-300 hover:scale-105"
                  onClick={() => {
                    // Get the agent ID based on gender
                    const agentId = selectedGender === 'male' ? '0Ako2MORgNjlSpGTU75E' : 'Jw7iQ8oXMG3MZeuyLfmH';
                    const agentName = selectedGender === 'male' ? maleName : femaleName;
                    
                    // Open our custom full-page agent experience
                    const agentType = agent?.id || 'default';
                    const url = `/agent-chat?agentId=${agentId}&gender=${selectedGender}&type=${agentType}&name=${agentName}`;
                    
                    // Close this dialog and open the full page experience
                    onOpenChange(false);
                    window.location.href = url;
                  }}
                >
                  <div className="flex flex-col items-center gap-3">
                    <Mic size={32} />
                    <span className="text-lg">Start Voice Conversation</span>
                  </div>
                </Button>
                
                <div className="mt-8 text-center">
                  <div className="mb-4">- or -</div>
                  
                  {/* Widget container for direct embedding */}
                  <Button
                    onClick={embedWidget}
                    className="mb-6 bg-blue-600 hover:bg-blue-700"
                  >
                    Try Embedded Widget
                  </Button>
                  
                  {/* Container for the 11Labs widget */}
                  <div id="widget-container" className="w-full min-h-[200px] mb-4 rounded-lg overflow-hidden"></div>
                  
                  {/* Show the 11Labs widget embed code */}
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md max-w-md text-xs text-left overflow-x-auto mt-4">
                    <pre>
                      {selectedGender === 'male' 
                        ? '<elevenlabs-convai agent-id="0Ako2MORgNjlSpGTU75E"></elevenlabs-convai>\n<script src="https://elevenlabs.io/convai-widget/index.js" async></script>'
                        : '<elevenlabs-convai agent-id="Jw7iQ8oXMG3MZeuyLfmH"></elevenlabs-convai>\n<script src="https://elevenlabs.io/convai-widget/index.js" async></script>'
                      }
                    </pre>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-4">
                    You can also embed this agent on your website using the code above.
                  </p>
                </div>
                
                <div className="text-center mt-6">
                  <p className="text-sm text-muted-foreground">
                    Powered by 11Labs realistic voice technology
                  </p>
                </div>
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