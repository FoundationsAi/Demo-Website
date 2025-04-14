import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MountainTextOverlaySectionProps {
  id?: string;
  targetRef?: React.RefObject<HTMLElement>;
}

/**
 * MountainTextOverlaySection - Shows the "A NEW FRONTIER" and "VOICE AI" text
 * as a fixed overlay that appears when the mountain section comes into view
 * and disappears when scrolling past it
 */
export const MountainTextOverlaySection: React.FC<MountainTextOverlaySectionProps> = ({ 
  id,
  targetRef
}) => {
  const [visibility, setVisibility] = useState({
    isVisible: false,
    inMountainSection: false
  });
  
  // Watch window scroll to determine when we're at the mountain section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show the text only when we're in the mountain section - adjusted for visibility after our layout changes
      // Since mountain section is now the second page, we adjust the values
      const inMountainStart = windowHeight * 0.75; // Show once we're almost at the mountain section
      const inMountainEnd = windowHeight * 2.5; // Hide after we're past it
      
      if (scrollPosition > inMountainStart && scrollPosition < inMountainEnd) {
        setVisibility({
          isVisible: true,
          inMountainSection: true
        });
      } else {
        setVisibility({
          isVisible: false,
          inMountainSection: scrollPosition >= inMountainStart && scrollPosition <= inMountainEnd
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Don't render at all if we're past the mountain section to avoid interference
  if (!visibility.inMountainSection && !visibility.isVisible) {
    return null;
  }
  
  return (
    <motion.div
      id={id}
      className="fixed top-24 left-0 w-full z-30 flex flex-col items-center justify-center text-center pointer-events-none"
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity: visibility.isVisible ? 1 : 0,
        y: visibility.isVisible ? 0 : 50,
      }}
      transition={{
        opacity: { duration: 0.5, ease: 'easeInOut' },
        y: { duration: 0.7, ease: 'easeOut' }
      }}
      style={{
        willChange: "transform, opacity",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden"
      }}
    >
      <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider text-white mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] animate-pulse-slow">
        A NEW FRONTIER
      </h2>
      <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] bg-black/10 backdrop-blur-sm px-8 py-2 rounded-lg">
        VOICE AI
      </h3>
    </motion.div>
  );
};

export default MountainTextOverlaySection;