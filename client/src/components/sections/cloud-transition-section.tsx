import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AnimatedText } from '@/components/animated-text';
import { ScrollReveal } from '@/components/scroll-reveal';

interface CloudTransitionSectionProps {
  id?: string;
}

/**
 * CloudTransitionSection - Creates a seamless transition from space to mountains
 * with animated cloud movement
 */
export const CloudTransitionSection: React.FC<CloudTransitionSectionProps> = ({ id }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Transform values for parallax effects
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const topCloudY = useTransform(scrollYProgress, [0, 1], ['-10%', '-30%']);
  const middleCloudY = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);
  const bottomCloudY = useTransform(scrollYProgress, [0, 1], ['10%', '0%']);
  const textY = useTransform(scrollYProgress, [0, 0.5, 1], ['50px', '0px', '-50px']);
  
  // Create cloud elements with optimized rendering
  const createClouds = (count: number, className: string) => {
    // Reduce cloud count for better performance
    const optimizedCount = Math.max(3, Math.floor(count * 0.7));
    
    return Array.from({ length: optimizedCount }).map((_, index) => {
      // Simplified animation values for better performance
      const speed = className.includes('slow') ? 120 : className.includes('medium') ? 80 : 60;
      const delay = Math.floor(Math.random() * 10);
      const top = `${Math.floor((Math.random() * 60) + 10)}%`;
      const size = Math.floor((Math.random() * 5) + 5) / 10; // Simplified scale calculation
      const opacity = Math.floor((Math.random() * 4) + 5) / 10; // Simplified opacity calculation
      
      return (
        <div 
          key={`${className}-${index}`}
          className={`cloud ${className}`}
          style={{
            top,
            left: `-${Math.floor(Math.random() * 20 + 10)}%`,
            transform: `scale(${size})`,
            opacity,
            animationDelay: `${delay}s`,
            animationDuration: `${speed}s`,
            willChange: 'transform',
            backfaceVisibility: 'hidden',
          }}
        />
      );
    });
  };
  
  return (
    <section 
      id={id}
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden section-wrapper"
      style={{ 
        background: 'linear-gradient(to bottom, #000000, #111a30, #1a2f59, #243882, #2e42ab)',
        margin: 0,
        padding: 0,
        marginTop: '-2px', // Ensure seamless connection with previous section
        marginBottom: '-2px', // Ensure seamless connection with next section
        position: 'relative',
        zIndex: 1,
        transformStyle: 'preserve-3d', // Fix for potential Safari issues
        transform: 'translateZ(0)', // Hardware acceleration
        backfaceVisibility: 'hidden' // Prevent rendering artifacts
      }}
    >
      {/* Top cloud layer (fast moving) - reduced count for better performance */}
      <motion.div 
        className="absolute inset-0 z-10"
        style={{ 
          opacity, 
          y: topCloudY,
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden" 
        }}
      >
        {createClouds(3, 'cloud-fast')}
      </motion.div>
      
      {/* Middle cloud layer (medium speed) - reduced count for better performance */}
      <motion.div 
        className="absolute inset-0 z-20"
        style={{ 
          opacity, 
          y: middleCloudY,
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden"
        }}
      >
        {createClouds(5, 'cloud-medium')}
      </motion.div>
      
      {/* Bottom cloud layer (slow moving) - reduced count for better performance */}
      <motion.div 
        className="absolute inset-0 z-30"
        style={{ 
          opacity, 
          y: bottomCloudY,
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden"
        }}
      >
        {createClouds(4, 'cloud-slow')}
      </motion.div>
      
      {/* Text content - with hardware acceleration */}
      <motion.div 
        className="relative z-40 flex items-center justify-center min-h-screen"
        style={{ 
          opacity, 
          y: textY,
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden"
        }}
      >
        <div className="text-center max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <div className="bg-black/80 backdrop-blur-lg p-6 rounded-xl border border-blue-500/30 shadow-[0_0_50px_rgba(0,0,0,0.7)] mb-8">
              <AnimatedText
                text="BEYOND THE COSMOS"
                as="h2"
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-wider sm:tracking-widest text-blue-100 mb-2 drop-shadow-[0_0_20px_rgba(100,200,255,0.9)]"
                animation="slide"
                stagger={0.03}
              />
            </div>
            
            <div className="text-xl md:text-2xl text-white leading-relaxed max-w-2xl mx-auto font-medium bg-black/80 backdrop-blur-lg p-8 rounded-xl border border-blue-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
              <p className="drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">Where the vastness of space meets the beauty of Earth. Our journey continues through the clouds and beyond.</p>
            </div>
          </ScrollReveal>
        </div>
      </motion.div>
      
      {/* Bottom gradient for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#142448] to-transparent z-50" />
    </section>
  );
};

export default CloudTransitionSection;