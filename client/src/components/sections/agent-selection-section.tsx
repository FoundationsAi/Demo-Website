import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { agents } from '@/lib/utils';
import { HoverableCard } from '@/components/hoverable-card';
import { ScrollReveal } from '@/components/scroll-reveal';
import { VoiceWave } from '@/components/voice-wave';
import { AnimatedText } from '@/components/animated-text';

/**
 * AgentSelectionSection - Interactive section for selecting and trying AI agents
 * with voice capabilities powered by 11 Labs
 */
export const AgentSelectionSection: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputText, setInputText] = useState('');
  
  // Mock function for using 11Labs API when integrated
  const speakWithAgent = (agentId: string, text: string) => {
    if (!text.trim()) return;
    
    // In a real implementation, this would call the 11Labs API
    setIsPlaying(true);
    console.log(`Agent ${agentId} is speaking: ${text}`);
    
    // Simulate voice playback time
    setTimeout(() => {
      setIsPlaying(false);
      setInputText('');
    }, 3000);
  };
  
  return (
    <section className="relative bg-gradient-to-b from-[#142448] to-[#0a1528] text-white py-24 min-h-screen flex flex-col justify-center section-wrapper"
      style={{ 
        margin: 0,
        padding: 0,
        marginTop: '-2px',
        marginBottom: '-2px',
        position: 'relative',
        zIndex: 1,
        transformStyle: 'preserve-3d',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}>
      {/* Background mountains silhouette */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none z-0 opacity-20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,202.7C960,171,1056,117,1152,106.7C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <ScrollReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-wider">
              INTERACT WITH OUR AI
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-300 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0 hyphens-auto">
              See your future agents in action. Select an agent with a distinct 
              personality, knowledge base and communication style to engage with.
            </p>
          </ScrollReveal>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {agents.map((agent, index) => (
            <ScrollReveal key={agent.id} delay={index * 0.1}>
              <motion.div 
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedAgent(agent.id)}
              >
                <HoverableCard 
                  className={`h-full ${selectedAgent === agent.id ? 'bg-blue-900/40' : 'bg-gray-900/70'} backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer border-2 ${selectedAgent === agent.id ? 'border-blue-400' : 'border-transparent'}`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-16 h-16 ${selectedAgent === agent.id ? 'bg-blue-600' : 'bg-blue-800'} rounded-full flex items-center justify-center transition-colors duration-300`}>
                        <span className="text-2xl">{agent.icon}</span>
                      </div>
                      <VoiceWave isActive={isPlaying && selectedAgent === agent.id} numBars={4} className="h-10" />
                    </div>
                    
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">{agent.name}</h3>
                    <p className="text-sm sm:text-base text-blue-100 mb-4">{agent.description}</p>
                    
                    <div className="mt-auto">
                      <div className="flex flex-wrap gap-2">
                        {agent.skills.map((skill) => (
                          <span 
                            key={skill}
                            className="px-3 py-1 bg-blue-900/50 rounded-full text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </HoverableCard>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
        
        {/* Agent interaction area */}
        <AnimatePresence>
          {selectedAgent !== null && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
              className="mt-12 max-w-3xl mx-auto bg-blue-900/30 backdrop-blur-md p-8 rounded-lg border border-blue-400/30"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl">{agents.find(a => a.id === selectedAgent)?.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{agents.find(a => a.id === selectedAgent)?.name}</h3>
                  <p className="text-blue-300 text-sm">AI Voice Agent</p>
                </div>
                <div className="ml-auto">
                  <VoiceWave isActive={isPlaying} className="h-8 w-20" />
                </div>
              </div>
              
              <div className="mb-6">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message to hear the agent speak..."
                  className="w-full bg-blue-950/50 border border-blue-800 rounded-lg p-3 text-white placeholder-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  disabled={isPlaying}
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-4 py-2 bg-transparent border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-900/30"
                >
                  Back to Selection
                </button>
                
                <button
                  onClick={() => speakWithAgent(selectedAgent, inputText)}
                  disabled={!inputText.trim() || isPlaying}
                  className={`px-6 py-2 rounded-lg ${!inputText.trim() || isPlaying ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} flex items-center`}
                >
                  {isPlaying ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                      </svg>
                      Speak Message
                    </>
                  )}
                </button>
              </div>
              
              <div className="mt-6 text-sm text-blue-300 text-center">
                <p>Voice synthesis powered by 11 Labs AI technology</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="text-center mt-16">
          <Link href="/chat">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
              Engage in Full Conversation
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};