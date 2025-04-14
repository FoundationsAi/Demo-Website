import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface MountainTextOverlaySectionProps {
  id?: string;
  targetRef?: React.RefObject<HTMLElement>;
}

/**
 * MountainTextOverlaySection - Shows the "A NEW FRONTIER" and "VOICE AI" text
 * as a pure overlay with no screen height consumption
 */
export const MountainTextOverlaySection: React.FC<MountainTextOverlaySectionProps> = ({ 
  id,
  targetRef
}) => {
  // Create scroll-based animations using the provided target or the document
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start", "end start"]
  });
  
  // Transform values for text animations - start at top and fade out as we scroll
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.3, 0.4], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.1, 0.3, 0.4], [50, 0, 0, -50]);
  
  return (
    <motion.div
      id={id}
      className="fixed top-32 left-0 w-full z-30 flex flex-col items-center justify-center text-center pointer-events-none"
      style={{ 
        opacity,
        y,
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