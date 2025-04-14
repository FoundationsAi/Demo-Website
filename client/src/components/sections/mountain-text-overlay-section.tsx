import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface MountainTextOverlaySectionProps {
  id?: string;
  targetRef?: React.RefObject<HTMLElement>;
}

/**
 * MountainTextOverlaySection - Shows the "A NEW FRONTIER" and "VOICE AI" text
 * as a fixed overlay that appears when the mountain section comes into view
 */
export const MountainTextOverlaySection: React.FC<MountainTextOverlaySectionProps> = ({ 
  id,
  targetRef
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  // Watch window scroll to determine when we're at the mountain section
  useEffect(() => {
    const handleScroll = () => {
      // When we reach about 75% of the first screen height, show the text
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Show the text when we've scrolled about 1.75 screen heights
      if (scrollPosition > windowHeight * 1.75) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <motion.div
      id={id}
      className="fixed top-32 left-0 w-full z-30 flex flex-col items-center justify-center text-center pointer-events-none"
      animate={{ 
        opacity: isVisible ? 1 : 0,
        y: isVisible ? 0 : 50,
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
      <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider text-white mb-4 drop-shadow-lg">
        A NEW FRONTIER
      </h2>
      <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-300 drop-shadow-lg">
        VOICE AI
      </h3>
    </motion.div>
  );
};

export default MountainTextOverlaySection;