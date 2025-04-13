import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { AnimatedText } from "../animated-text";
import { FloatingCard } from "../floating-card";
import { useParallax } from "@/hooks/use-scroll";
import { useSpringValue } from "@react-spring/web";

export const MountainRevealSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(0);
  
  // Enhanced parallax for mountain layers
  const parallaxFar = useParallax(0.15);
  const parallaxMid = useParallax(0.35);
  const parallaxClose = useParallax(0.6);
  
  // Use spring for smoother animations
  const rotationSpring = useSpringValue(0);
  
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
  const textOpacity1 = useTransform(smoothProgress, [0.1, 0.2, 0.3, 0.4], [0, 1, 1, 0]);
  const textOpacity2 = useTransform(smoothProgress, [0.3, 0.4, 0.5, 0.6], [0, 1, 1, 0]);
  const textOpacity3 = useTransform(smoothProgress, [0.5, 0.6, 0.7, 0.8], [0, 1, 1, 0]);
  
  const y1 = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const y2 = useTransform(smoothProgress, [0, 1], ["0%", "70%"]);
  const y3 = useTransform(smoothProgress, [0, 1], ["0%", "40%"]);
  
  // Mountain layers move at different rates
  const mountainFar = useTransform(smoothProgress, [0, 1], ["100%", "0%"]);
  const mountainMid = useTransform(smoothProgress, [0, 1], ["60%", "0%"]);
  const mountainClose = useTransform(smoothProgress, [0, 1], ["30%", "0%"]);
  
  // Light rays intensity
  const rayOpacity = useTransform(smoothProgress, [0.3, 0.6], [0, 0.7]);
  const rayScale = useTransform(smoothProgress, [0.3, 0.6], [0.8, 1.2]);
  
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Atmospheric fog effect that changes with scroll
  const fogIntensity = useTransform(smoothProgress, [0, 0.5, 1], [0.8, 0.4, 0.1]);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[300vh] overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      <motion.div 
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ opacity }}
      >
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500 via-purple-400 to-indigo-800" />
        
        {/* Atmospheric fog layer */}
        <motion.div 
          className="absolute inset-0 bg-white/40 mix-blend-overlay"
          style={{ opacity: fogIntensity }}
        />
        
        {/* Sun/light source */}
        <motion.div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,236,210,1) 0%, rgba(255,236,210,0.7) 20%, rgba(255,167,38,0) 70%)",
            boxShadow: "0 0 100px 50px rgba(255,236,210,0.8), 0 0 200px 100px rgba(255,167,38,0.4)",
          }}
        />
        
        {/* Light rays */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
          style={{ 
            opacity: rayOpacity, 
            scale: rayScale,
            background: "radial-gradient(ellipse at top, rgba(255,236,210,0.2) 0%, rgba(255,236,210,0) 70%)"
          }}
        />
        
        {/* Far mountains */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full"
          style={{ 
            y: mountainFar,
            filter: "brightness(0.7) saturate(0.8)",
          }}
        >
          <svg 
            viewBox="0 0 1200 300" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path 
              d="M0 300L50 250L100 270L150 200L200 220L250 180L300 250L350 200L400 190L450 250L500 220L550 240L600 180L650 260L700 220L750 200L800 240L850 180L900 250L950 200L1000 220L1050 180L1100 240L1150 280L1200 220V300H0Z" 
              fill="#2d3748" 
            />
          </svg>
        </motion.div>
        
        {/* Middle mountains */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full"
          style={{ 
            y: mountainMid,
            filter: "brightness(0.8) saturate(0.9)",
          }}
        >
          <svg 
            viewBox="0 0 1200 350" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path 
              d="M0 350L100 250L200 320L300 200L400 280L500 180L600 300L700 150L800 270L900 200L1000 250L1100 180L1200 270V350H0Z" 
              fill="#4a5568" 
            />
          </svg>
        </motion.div>
        
        {/* Close mountains - the main peak */}
        <motion.div 
          className="absolute bottom-0 left-0 w-full"
          style={{ 
            y: mountainClose,
          }}
        >
          <svg 
            viewBox="0 0 1200 400" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path 
              d="M0 400L200 300L300 350L400 250L500 350L600 100L700 350L800 250L900 300L1000 200L1200 300V400H0Z" 
              fill="#5D3FD3" 
            />
            
            {/* Mountain peak highlight/snow */}
            <path 
              d="M550 150L600 100L650 150L630 160L620 140L610 160L600 120L590 160L580 140L570 160L550 150Z" 
              fill="white" 
              opacity="0.8"
            />
          </svg>
        </motion.div>
        
        {/* Narrative text elements */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 text-center">
          <motion.div 
            className="mb-64 max-w-3xl"
            style={{ opacity: textOpacity1, y: y1 }}
          >
            <h2 className="text-3xl md:text-6xl font-bold text-white drop-shadow-lg mb-6">
              <AnimatedText 
                text="Revolutionary Peaks of Achievement" 
                as="span" 
                animation="gradient"
                className="font-bold"
              />
            </h2>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">
              Our voice technology stands at the summit of what's possible, transforming how humans and AI interact
            </p>
          </motion.div>
          
          <motion.div 
            className="absolute max-w-3xl"
            style={{ opacity: textOpacity2, y: y2 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-6">
              <AnimatedText 
                text="The Pinnacle of Voice AI" 
                as="span" 
                animation="slide"
                className="font-bold"
              />
            </h2>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">
              Built on next-generation neural networks trained on billions of conversations, our agents understand context like never before
            </p>
          </motion.div>
          
          <motion.div 
            className="absolute max-w-3xl"
            style={{ opacity: textOpacity3, y: y3 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-6">
              <AnimatedText 
                text="Ascend to New Possibilities" 
                as="span" 
                animation="fade"
                className="font-bold"
              />
            </h2>
            <p className="text-xl md:text-2xl text-white/90 drop-shadow-md">
              Continue your journey to explore the limitless applications of our voice agents
            </p>
          </motion.div>
        </div>
        
        {/* Feature cards that appear with parallax effect */}
        <motion.div 
          className="absolute bottom-32 w-full px-4"
          style={{ opacity: textOpacity3 }}
        >
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featureCards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <FloatingCard className="glass-card p-6 rounded-xl h-full">
                    <h3 className="text-xl font-bold mb-2">{card.title}</h3>
                    <p className="text-white/70">{card.description}</p>
                  </FloatingCard>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

// Sample feature cards data
const featureCards = [
  {
    title: "Multi-turn Context",
    description: "Our AI maintains context across complex conversations, remembering details and adjusting responses accordingly.",
  },
  {
    title: "Emotional Intelligence",
    description: "Voice agents detect and respond to emotional cues in speech, creating truly empathetic interactions.",
  },
  {
    title: "Unmatched Fluency",
    description: "Natural speech patterns with dynamic pacing, tonal variation, and contextually appropriate pauses.",
  },
];

export default MountainRevealSection;