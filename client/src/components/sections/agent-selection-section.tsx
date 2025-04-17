import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import { agents } from '@/lib/utils';
import { HoverableCard } from '@/components/hoverable-card';
import { ScrollReveal } from '@/components/scroll-reveal';
import { VoiceWave } from '@/components/voice-wave';
import { AnimatedText } from '@/components/animated-text';
import { useIsMobile } from '@/hooks/use-mobile';
import { AgentDialog } from '@/components/agent-dialog';
import { Button } from '@/components/ui/button';

/**
 * AgentSelectionSection - Interactive section for selecting and trying AI agents
 * with voice capabilities powered by 11 Labs
 */
export const AgentSelectionSection: React.FC = () => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputText, setInputText] = useState('');
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAgentForDialog, setSelectedAgentForDialog] = useState<any>(null);
  const isMobile = useIsMobile();
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const titleInView = useInView(titleRef, { once: false, amount: 0.5 });
  const titleControls = useAnimation();
  
  // Particle config for the background
  const particleCount = 30;
  const [particles, setParticles] = useState<Array<{x: number, y: number, size: number, color: string, speed: number}>>([]);
  
  // Initialize particles
  useEffect(() => {
    const newParticles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100 + 155)}, 255, ${Math.random() * 0.5 + 0.2})`,
      speed: Math.random() * 0.2 + 0.1
    }));
    setParticles(newParticles);
    
    // Start the animation sequence when component mounts
    titleControls.start({
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    });
  }, []);
  
  // Animation for particles
  useEffect(() => {
    const moveParticles = () => {
      setParticles(prev => 
        prev.map(particle => ({
          ...particle,
          y: particle.y - particle.speed,
          x: particle.x + (Math.random() - 0.5) * 0.2,
          // Reset particle when it reaches the top
          ...(particle.y < 0 ? { y: 100, x: Math.random() * 100 } : {})
        }))
      );
    };
    
    const interval = setInterval(moveParticles, 50);
    return () => clearInterval(interval);
  }, []);
  
  // Parallax effect for section elements
  useEffect(() => {
    if (!sectionRef.current) return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const sectionTop = sectionRef.current?.offsetTop || 0;
      const sectionHeight = sectionRef.current?.offsetHeight || 0;
      const relativePosition = scrollPosition - sectionTop;
      
      // Only apply effects when section is in view
      if (relativePosition > -window.innerHeight && relativePosition < sectionHeight) {
        // Apply parallax to title
        if (titleRef.current) {
          titleRef.current.style.transform = `translateY(${relativePosition * 0.1}px)`;
        }
      }
    };
    
    // Only add scroll listener if not on mobile to avoid performance issues
    if (!isMobile) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isMobile]);
  
  // Enhanced mock function for using 11Labs API when integrated
  const speakWithAgent = (agentId: string, text: string) => {
    if (!text.trim()) return;
    
    // Add subtle animation to show processing
    setIsPlaying(true);
    console.log(`Agent ${agentId} is speaking: ${text}`);
    
    // Simulate voice playback time with a slightly more realistic timing
    setTimeout(() => {
      setIsPlaying(false);
      setInputText('');
    }, 3000);
  };
  
  // Letter animation variants for the title
  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    })
  };
  
  // Splitting text for letter animation
  const titleText = "INTERACT WITH OUR AI";
  const titleLetters = titleText.split("");
  
  // Agent card animation variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.2 + i * 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    }),
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.98,
      transition: {
        duration: 0.1
      }
    }
  };
  
  // Get skill color based on skill name for visual variety
  const getSkillColor = (skill: string) => {
    const colors = [
      "bg-blue-600/70",
      "bg-indigo-600/70",
      "bg-purple-600/70",
      "bg-cyan-600/70",
      "bg-sky-600/70"
    ];
    
    // Simple hash function to get consistent colors for same skills
    const hash = skill.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  return (
    <section 
      ref={sectionRef}
      className="agent-selection-section relative bg-gradient-to-b from-[#142448] via-[#0c1a36] to-[#091324] text-white py-16 md:py-32 min-h-screen flex flex-col justify-center overflow-hidden section-wrapper"
      style={{ 
        margin: 0,
        padding: 0,
        paddingTop: '10vh',
        paddingBottom: '50vh',
        marginTop: '-2px',
        marginBottom: '-2px',
        position: 'relative',
        zIndex: 1,
        transformStyle: 'preserve-3d',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
    >
      {/* Animated floating particles background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        {particles.map((particle, index) => (
          <div
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              filter: 'blur(1px)',
              opacity: 0.7,
              transition: 'top 0.5s linear'
            }}
          />
        ))}
      </div>
      
      {/* Background mountains silhouette with enhanced opacity */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none z-0 opacity-30">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path fill="#ffffff" fillOpacity="1" d="M0,224L48,213.3C96,203,192,181,288,186.7C384,192,480,224,576,234.7C672,245,768,235,864,202.7C960,171,1056,117,1152,106.7C1248,96,1344,128,1392,144L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      {/* Radial gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{ 
          background: 'radial-gradient(circle at center, rgba(12, 27, 59, 0.1) 0%, rgba(8, 16, 35, 0.9) 100%)',
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col">
        {/* Enhanced title section with letter-by-letter animation */}
        <div className="text-center mb-12 md:mb-20 relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute -top-24 left-1/2 w-96 h-96 -translate-x-1/2 radial-pulse-blue opacity-30 pointer-events-none"
          />
          
          <motion.h2 
            ref={titleRef}
            className="relative text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-wider inline-block"
          >
            <div className="flex justify-center overflow-hidden py-2">
              {titleLetters.map((letter, i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate={titleInView ? "visible" : "hidden"}
                  className="inline-block mx-[1px] sm:mx-[2px]"
                  style={{ 
                    display: letter === " " ? "inline-block" : "inline-block",
                    width: letter === " " ? "0.5em" : "auto",
                    textShadow: "0 0 15px rgba(59, 130, 246, 0.7)"
                  }}
                >
                  {letter}
                </motion.span>
              ))}
            </div>
            
            {/* Animated underline */}
            <motion.div 
              className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent rounded-full mt-2 mx-auto"
              initial={{ width: 0, opacity: 0 }}
              animate={titleInView ? { width: "100%", opacity: 1 } : { width: 0, opacity: 0 }}
              transition={{ delay: titleLetters.length * 0.05 + 0.2, duration: 0.8 }}
            />
          </motion.h2>
          
          <AnimatedText
            text="Explore our advanced AI personalities and experience voice AI that sounds truly human."
            as="p"
            animation="slide"
            className="text-base sm:text-lg md:text-xl text-blue-300 max-w-3xl mx-auto leading-relaxed px-4 sm:px-6 hyphens-auto font-light"
            delay={0.8}
            stagger={0.01}
          />
        </div>
        
        {/* Card grid with improved responsive layout for all screen sizes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-8 w-full max-w-7xl mx-auto px-2 sm:px-4">
          {agents.map((agent, index) => (
            <motion.div 
              key={agent.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              onClick={() => {
                setSelectedAgentForDialog(agent);
                setIsDialogOpen(true);
              }}
              onMouseEnter={() => setHoveredAgent(agent.id)}
              onMouseLeave={() => setHoveredAgent(null)}
              className="h-full"
            >
              <div 
                className={`relative h-full overflow-hidden rounded-xl backdrop-blur-sm cursor-pointer transition-all duration-300 border-2 ${
                  selectedAgent === agent.id 
                    ? 'bg-gradient-to-br from-blue-900/60 to-indigo-900/60 border-blue-400' 
                    : hoveredAgent === agent.id
                      ? 'bg-gradient-to-br from-gray-900/80 to-blue-900/30 border-blue-500/50'
                      : 'bg-gradient-to-br from-gray-900/80 to-blue-950/50 border-transparent'
                }`}
                style={{
                  boxShadow: selectedAgent === agent.id 
                    ? '0 0 20px rgba(59, 130, 246, 0.5), inset 0 0 30px rgba(59, 130, 246, 0.2)' 
                    : hoveredAgent === agent.id
                      ? '0 5px 15px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1)'
                      : 'none'
                }}
              >
                {/* Radial gradient highlight on hover */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 pointer-events-none opacity-0 transition-opacity duration-300"
                  initial={false}
                  animate={{
                    opacity: hoveredAgent === agent.id || selectedAgent === agent.id ? 1 : 0
                  }}
                />
                
                {/* Card content - improved responsiveness for all screen sizes */}
                <div className="p-4 xs:p-5 sm:p-6 lg:p-7 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <motion.div 
                      className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center z-10 transition-colors duration-500`}
                      initial={false}
                      animate={{
                        background: selectedAgent === agent.id 
                          ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)' 
                          : hoveredAgent === agent.id
                            ? 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)' 
                            : 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)'
                      }}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <motion.span 
                        className="text-3xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "reverse",
                          ease: "easeInOut",
                          delay: index * 0.2
                        }}
                      >
                        {agent.icon}
                      </motion.span>
                      
                      {/* Pulsating glow effect */}
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          boxShadow: [
                            '0 0 0 rgba(59, 130, 246, 0)',
                            '0 0 20px rgba(59, 130, 246, 0.7)',
                            '0 0 0 rgba(59, 130, 246, 0)'
                          ]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          repeatType: "loop"
                        }}
                      />
                    </motion.div>
                    
                    {/* Enhanced voice wave animation */}
                    <div className="relative h-10 w-20 overflow-hidden">
                      <VoiceWave 
                        isActive={isPlaying && selectedAgent === agent.id}
                        numBars={6}
                        className={`h-10 ${selectedAgent === agent.id ? "text-blue-400" : "text-blue-600"}`}
                      />
                      
                      {/* Glow effect for active voice */}
                      {isPlaying && selectedAgent === agent.id && (
                        <motion.div
                          className="absolute inset-0 bg-blue-500/20 rounded-md filter blur-md"
                          animate={{
                            opacity: [0.2, 0.8, 0.2]
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Agent details with improved responsive typography */}
                  <div>
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent leading-tight">
                      {agent.name}
                    </h3>
                    <p className="text-xs xs:text-sm sm:text-base text-blue-100/90 mb-4 sm:mb-6 line-clamp-3 leading-relaxed">
                      {agent.description}
                    </p>
                  </div>
                  
                  {/* Skills with enhanced animation and styling */}
                  <div className="mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {agent.skills.map((skill, skillIndex) => (
                        <motion.span 
                          key={skill}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.5 + index * 0.1 + skillIndex * 0.1,
                            duration: 0.3
                          }}
                          className={`px-3 py-1 ${getSkillColor(skill)} rounded-full text-xs sm:text-sm backdrop-blur-sm border border-blue-500/30 font-medium relative z-10`}
                        >
                          {skill}
                        </motion.span>
                      ))}
                    </div>
                  </div>
                  
                  {/* "Select Agent" button that appears on hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: hoveredAgent === agent.id ? 1 : 0,
                      y: hoveredAgent === agent.id ? 0 : 20
                    }}
                    transition={{ duration: 0.2 }}
                    className="mt-5 text-center"
                  >
                    <div className="inline-block px-4 py-2 bg-blue-600/80 hover:bg-blue-600 rounded-full text-sm font-medium transition-colors duration-200">
                      Select Agent
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Enhanced Agent interaction area */}
        <AnimatePresence mode="wait">
          {selectedAgent !== null && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 sm:mt-12 max-w-3xl mx-auto w-full backdrop-blur-xl p-4 xs:p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl border border-blue-400/30 relative z-20 mx-4 sm:mx-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(7, 18, 42, 0.7) 100%)',
                boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 20px rgba(59, 130, 246, 0.3)'
              }}
            >
              {/* Background glow effect */}
              <motion.div
                className="absolute inset-0 -z-10 rounded-2xl overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="absolute -inset-[100px] bg-blue-600/10 blur-3xl rounded-full" />
              </motion.div>
              
              {/* Agent header with enhanced styling */}
              <div className="flex flex-wrap sm:flex-nowrap items-center mb-8 gap-4 sm:gap-0">
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mr-4 shadow-lg"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <span className="text-2xl">{agents.find(a => a.id === selectedAgent)?.icon}</span>
                  
                  {/* Circle pulse effect */}
                  <div className="absolute inset-0 rounded-full animation-pulse-blue opacity-70" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="flex-1"
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {agents.find(a => a.id === selectedAgent)?.name}
                  </h3>
                  <p className="text-blue-300 text-sm sm:text-base">
                    Advanced AI Voice Agent with Natural Language Processing
                  </p>
                </motion.div>
                
                <motion.div 
                  className="ml-auto"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                >
                  <div className="relative">
                    <VoiceWave isActive={isPlaying} numBars={8} className="h-10 w-28 text-blue-400" />
                    {isPlaying && (
                      <div className="absolute inset-0 bg-blue-500/10 rounded-md filter blur-md animation-pulse-slow" />
                    )}
                  </div>
                </motion.div>
              </div>
              
              {/* Enhanced input area */}
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <div className="relative">
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message to hear the agent speak with realistic human voice..."
                    className="w-full bg-blue-950/50 border border-blue-700/70 rounded-xl p-4 text-white placeholder-blue-400/90 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none shadow-inner"
                    rows={4}
                    disabled={isPlaying}
                    style={{
                      boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.2)'
                    }}
                  />
                  
                  {/* Character counter with animated progress */}
                  <div className="absolute bottom-3 right-3 text-xs text-blue-400/80 flex items-center gap-2">
                    <div className="w-16 h-1 bg-blue-900/50 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500"
                        initial={false}
                        animate={{ width: `${Math.min((inputText.length / 150) * 100, 100)}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                    <span>{inputText.length}/150</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Enhanced button area */}
              <motion.div 
                className="flex flex-col sm:flex-row justify-between gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-5 py-3 bg-transparent border border-blue-500 text-blue-400 rounded-xl hover:bg-blue-900/30 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Back to Selection
                </button>
                
                <button
                  onClick={() => speakWithAgent(selectedAgent, inputText)}
                  disabled={!inputText.trim() || isPlaying}
                  className={`px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                    !inputText.trim() || isPlaying
                      ? 'bg-gray-700/80 cursor-not-allowed text-gray-300'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white'
                  }`}
                  style={{
                    boxShadow: !inputText.trim() || isPlaying 
                      ? 'none' 
                      : '0 4px 15px -3px rgba(59, 130, 246, 0.5)'
                  }}
                >
                  {isPlaying ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing Voice...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"></path>
                      </svg>
                      Generate Voice Response
                    </>
                  )}
                </button>
              </motion.div>
              
              {/* Enhanced attribution and info */}
              <motion.div 
                className="mt-8 pt-6 border-t border-blue-800/30 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <p className="text-sm text-blue-300/80 flex flex-wrap items-center justify-center gap-2">
                  <span>Voice synthesis powered by</span>
                  <span className="font-semibold text-blue-300 flex items-center">
                    <span className="w-4 h-4 bg-blue-500 rounded-full inline-block mr-1.5 animation-pulse-slow"></span>
                    11Labs Advanced AI Technology
                  </span>
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* CTA Button removed as requested */}
      </div>
      
      {/* Agent Dialog */}
      <AgentDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        agent={selectedAgentForDialog}
        onClose={() => {
          setSelectedAgentForDialog(null);
          setIsDialogOpen(false);
        }}
      />
    </section>
  );
};