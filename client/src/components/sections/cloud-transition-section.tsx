import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AnimatedText } from '@/components/animated-text';
import { ScrollReveal } from '@/components/scroll-reveal';

interface CloudTransitionSectionProps {
  id?: string;
}

/**
 * CloudTransitionSection - Creates a seamless transition from space to mountains
 * with realistic cloud imagery based on National Geographic style
 */
export const CloudTransitionSection: React.FC<CloudTransitionSectionProps> = ({ id }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Transform values for parallax effects (reduced for better performance)
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5, 1], ['20px', '0px', '-20px']);
  
  // Simple parallax for background clouds
  const cloudParallax = useTransform(scrollYProgress, [0, 1], ['0%', '-10%']);
  
  return (
    <section 
      id={id}
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ 
        background: 'linear-gradient(to bottom, #000000, #070f24, #111a30, #1a2f59, #243882, #2e42ab, #142448)',
        position: 'relative', 
      }}
    >
      {/* Static cloud background that mimics National Geographic style */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Upper atmosphere transition */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070f24] via-[#0c1a3d] to-transparent opacity-60"></div>
        
        {/* Distant cloud layer - subtle and wispy */}
        <motion.div 
          className="absolute bottom-[40%] left-0 right-0 h-[40%]"
          style={{ y: cloudParallax }}
        >
          <div className="absolute inset-0 bg-[#d5e0f0]/10 rounded-[100%] blur-xl translate-y-[80%] scale-x-[1.7] scale-y-[0.6] opacity-30"></div>
          <div className="absolute inset-0 bg-[#d5e0f0]/20 rounded-[100%] blur-lg translate-y-[60%] translate-x-[10%] scale-x-[1.4] scale-y-[0.5] opacity-40"></div>
          <div className="absolute inset-0 bg-[#ffffff]/20 rounded-[100%] blur-xl translate-y-[40%] translate-x-[-20%] scale-x-[1.3] scale-y-[0.3] opacity-30"></div>
        </motion.div>
        
        {/* Mid-level clouds */}
        <motion.div 
          className="absolute bottom-[20%] left-0 right-0 h-[50%]"
          style={{ y: cloudParallax }}
        >
          <div className="absolute inset-0 bg-[#d5e0f0]/30 rounded-[100%] blur-xl translate-y-[100%] scale-x-[2] scale-y-[0.5] opacity-50"></div>
          <div className="absolute inset-0 bg-[#ffffff]/40 rounded-[100%] blur-lg translate-y-[80%] translate-x-[5%] scale-x-[1.8] scale-y-[0.4] opacity-60"></div>
          <div className="absolute inset-0 bg-[#d5e0f0]/30 rounded-[100%] blur-xl translate-y-[60%] translate-x-[-10%] scale-x-[1.5] scale-y-[0.3] opacity-50"></div>
        </motion.div>
        
        {/* Lower clouds - more defined */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-[50%]"
          style={{ y: cloudParallax }}
        >
          <div className="absolute inset-0 bg-[#ffffff]/60 rounded-[100%] blur-md translate-y-[130%] scale-x-[2.2] scale-y-[0.6] opacity-70"></div>
          <div className="absolute inset-0 bg-[#f0f4fa]/70 rounded-[100%] blur-md translate-y-[100%] translate-x-[15%] scale-x-[1.8] scale-y-[0.5] opacity-80"></div>
          <div className="absolute inset-0 bg-[#ffffff]/80 rounded-[100%] blur-md translate-y-[80%] translate-x-[-5%] scale-x-[2] scale-y-[0.4] opacity-90"></div>
        </motion.div>
      </div>
      
      {/* Text content - optimized for performance */}
      <motion.div 
        className="relative z-40 flex items-center justify-center min-h-screen"
        style={{ opacity, y: textY }}
      >
        <div className="text-center max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <AnimatedText
              text="BEYOND THE COSMOS"
              as="h2"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-wider sm:tracking-widest text-white mb-8"
              animation="slide"
              stagger={0.02}
            />
            
            <div className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              <p>Where the vastness of space meets the beauty of Earth. Our journey continues through the clouds and beyond.</p>
            </div>
          </ScrollReveal>
        </div>
      </motion.div>
      
      {/* Add a subtle gradient that matches the mountain section's gradient colors */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#142448] to-transparent z-50 pointer-events-none" />
    </section>
  );
};

export default CloudTransitionSection;