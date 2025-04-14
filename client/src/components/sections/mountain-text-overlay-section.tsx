import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface MountainTextOverlaySectionProps {
  id?: string;
}

/**
 * MountainTextOverlaySection - Shows the "A NEW FRONTIER" and "VOICE AI" text
 * at the top of the mountain section, with scroll-based animation
 */
export const MountainTextOverlaySection: React.FC<MountainTextOverlaySectionProps> = ({ 
  id 
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Create scroll-based animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  // Transform values for text animations
  const opacity = useTransform(scrollYProgress, [0.1, 0.2, 0.4, 0.5], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0.1, 0.2, 0.4, 0.5], [50, 0, 0, -50]);
  
  return (
    <section
      id={id}
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden"
      style={{ 
        marginTop: '-1px',
        marginBottom: '-1px',
        zIndex: 10, // Ensure this is above the mountain section
        pointerEvents: 'none' // Make this section non-interactive so users can interact with content below
      }}
    >
      <motion.div
        className="fixed top-1/4 left-0 w-full flex flex-col items-center justify-center text-center"
        style={{ 
          opacity,
          y,
          willChange: "transform, opacity",
          transform: "translateZ(0)",
          backfaceVisibility: "hidden"
        }}
      >
        <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider text-white mb-4">
          A NEW FRONTIER
        </h2>
        <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-blue-300">
          VOICE AI
        </h3>
      </motion.div>
    </section>
  );
};

export default MountainTextOverlaySection;