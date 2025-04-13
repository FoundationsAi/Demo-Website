import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { AnimatedText } from "../animated-text";
import { FloatingCard } from "../floating-card";
import { ParticleBackground } from "../particle-background";
import { VoiceWave } from "../voice-wave";

export const TechnologyFoundationSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Smoother progress with spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  // Transform values based on scroll
  const opacity = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const sectionScale = useTransform(smoothProgress, [0, 0.2], [0.8, 1]);
  
  // Content animation based on scroll
  const textOpacity = useTransform(smoothProgress, [0.1, 0.3, 0.8, 0.9], [0, 1, 1, 0]);
  const cardOpacity = useTransform(smoothProgress, [0.3, 0.5, 0.8, 0.9], [0, 1, 1, 0]);
  
  // Neural connection animations
  const networkOpacity = useTransform(smoothProgress, [0.2, 0.4], [0, 1]);
  const networkScale = useTransform(smoothProgress, [0.2, 0.6], [0.5, 1.2]);
  
  // Control voice wave animation
  useEffect(() => {
    const activateVoice = () => {
      if (scrollYProgress.get() > 0.4 && scrollYProgress.get() < 0.8) {
        setIsVoiceActive(true);
      } else {
        setIsVoiceActive(false);
      }
    };
    
    const unsubscribe = scrollYProgress.onChange(activateVoice);
    return () => unsubscribe();
  }, [scrollYProgress]);
  
  // Generate dynamic neural network nodes
  const generateNodes = (count: number) => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 5,
    }));
  };
  
  // Add mobile detection for optimized rendering
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on initial load
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Reduce nodes for mobile devices
  const nodes = React.useMemo(() => generateNodes(isMobile ? 40 : 100), [isMobile]);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[300vh] overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      <motion.div 
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ opacity, scale: sectionScale }}
      >
        {/* Lighter background with particle effects - continue the heavenly theme */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-indigo-500 to-purple-600" />
        <ParticleBackground variant="intense" className="opacity-60" />
        
        {/* Grid effect - more subtle for heavenly feel */}
        <div className="absolute inset-0 grid-background opacity-20" />
        
        {/* Neural network visualization */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: networkOpacity, scale: networkScale }}
        >
          <div className="relative w-full h-full max-w-4xl max-h-4xl">
            {/* Neural nodes */}
            {nodes.map((node) => (
              <motion.div
                key={node.id}
                className="absolute rounded-full bg-blue-400"
                style={{
                  left: `${node.x}%`,
                  top: `${node.y}%`,
                  width: `${node.size}px`,
                  height: `${node.size}px`,
                  boxShadow: `0 0 ${node.size * 2}px ${node.size / 2}px rgba(59, 130, 246, 0.6)`,
                }}
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              />
            ))}
            
            {/* Neural connections - dynamic lines */}
            <svg className="absolute inset-0 w-full h-full">
              {nodes.slice(0, isMobile ? 15 : 30).map((node, i) => {
                // Create connections between nearby nodes
                const connections = nodes
                  .slice(0, isMobile ? 20 : 50)
                  .filter((other) => {
                    const dx = Math.abs(node.x - other.x);
                    const dy = Math.abs(node.y - other.y);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance < (isMobile ? 25 : 20) && node.id !== other.id;
                  })
                  .slice(0, isMobile ? 2 : 3); // Limit connections per node for mobile
                
                return connections.map((other, j) => (
                  <motion.line
                    key={`${i}-${j}`}
                    x1={`${node.x}%`}
                    y1={`${node.y}%`}
                    x2={`${other.x}%`}
                    y2={`${other.y}%`}
                    stroke="rgba(59, 130, 246, 0.3)"
                    strokeWidth="0.5"
                    animate={{
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  />
                ));
              }).flat()}
            </svg>
          </div>
        </motion.div>
        
        {/* Floating technological orbs */}
        <motion.div 
          className="absolute inset-0"
          style={{ opacity: cardOpacity }}
        >
          <TechOrbs />
        </motion.div>
        
        {/* Main content container */}
        <div className="relative z-10 container mx-auto h-full flex flex-col justify-center items-center px-4">
          {/* Main heading */}
          <motion.div
            className="text-center mb-12"
            style={{ opacity: textOpacity }}
          >
            <h2 className="text-4xl md:text-7xl font-bold mb-6">
              <AnimatedText 
                text="The Foundation" 
                as="span" 
                animation="glitch"
                className="block mb-2"
              />
              <AnimatedText 
                text="of Voice Revolution" 
                as="span" 
                animation="gradient"
                className="block"
              />
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
              Built on breakthrough neural architectures and trained on billions of conversations
            </p>
          </motion.div>
          
          {/* Voice wave visualization */}
          <motion.div 
            className="mb-16"
            style={{ opacity: textOpacity }}
          >
            <VoiceWave 
              isActive={isVoiceActive}
              numBars={60}
              className="mx-auto"
            />
          </motion.div>
          
          {/* Technology cards */}
          <motion.div
            className="w-full"
            style={{ opacity: cardOpacity }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {techFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <FloatingCard 
                    className="glass-card p-6 rounded-xl h-full border border-white/20 bg-white/20 backdrop-blur-md"
                    intensity={10}
                    glare={true}
                  >
                    <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-blue-800">{feature.title}</h3>
                    <p className="text-sm md:text-base text-blue-700">{isMobile ? feature.mobileDescription || feature.description : feature.description}</p>
                  </FloatingCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

// Floating tech orbs effect component
const TechOrbs: React.FC = () => {
  // Access isMobile from parent component context
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on initial load
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const orbsData = React.useMemo(() => {
    return Array.from({ length: isMobile ? 5 : 10 }).map((_, i) => ({
      id: i,
      size: isMobile ? (20 + Math.random() * 80) : (30 + Math.random() * 120),
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: isMobile ? (15 + Math.random() * 20) : (20 + Math.random() * 40),
      delay: Math.random() * 10,
      color: orbColors[Math.floor(Math.random() * orbColors.length)],
    }));
  }, [isMobile]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {orbsData.map((orb) => (
        <motion.div
          key={orb.id}
          className="absolute rounded-full blur-3xl mix-blend-screen pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            backgroundColor: orb.color,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            opacity: 0.2,
          }}
          animate={{
            x: [
              -orb.size / 2, 
              orb.size / 2, 
              -orb.size / 3, 
              orb.size / 4,
              -orb.size / 2
            ],
            y: [
              -orb.size / 3, 
              orb.size / 4, 
              -orb.size / 2, 
              orb.size / 3,
              -orb.size / 3
            ],
            opacity: [0.1, 0.3, 0.2, 0.3, 0.1],
            scale: [1, 1.1, 0.9, 1.2, 1],
          }}
          transition={{
            duration: orb.duration,
            ease: "linear",
            repeat: Infinity,
            delay: orb.delay,
          }}
        />
      ))}
    </div>
  );
};

// Color palette for the orbs - lighter, more heavenly colors
const orbColors = [
  '#8673D9', // Light Purple
  '#60A5FA', // Light Blue
  '#93C5FD', // Sky Blue
  '#A5B4FC', // Indigo
  '#C4B5FD', // Lavender
];

// Define feature data type
type TechFeature = {
  title: string;
  description: string;
  mobileDescription?: string;
};

// Tech features data
const techFeatures: TechFeature[] = [
  {
    title: "Quantum Neural Processing",
    description: "Our revolutionary architecture processes context across billions of parameters simultaneously for unprecedented understanding and response generation.",
    mobileDescription: "Advanced AI processes context across billions of parameters simultaneously."
  },
  {
    title: "Multi-modal Integration",
    description: "Seamlessly combines voice recognition, contextual memory, and emotional intelligence for conversations that feel truly human.",
    mobileDescription: "Combines voice recognition with emotional intelligence for human-like interaction."
  },
  {
    title: "Adaptive Voice Synthesis",
    description: "Dynamically adjusts speech patterns, pacing, and vocal characteristics to match conversation context and emotional tone.",
    mobileDescription: "Adjusts speech patterns to match conversation context and emotion."
  },
];

export default TechnologyFoundationSection;