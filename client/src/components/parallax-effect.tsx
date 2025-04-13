import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxEffectProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
  invert?: boolean;
}

/**
 * A simplified parallax effect component that creates scroll-based movement
 */
export const ParallaxEffect: React.FC<ParallaxEffectProps> = ({
  children,
  speed = 0.2,
  direction = 'up',
  className = '',
  style = {},
  invert = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Calculate movement values based on direction
  const movementFactor = speed * 100 * (invert ? -1 : 1);
  
  // Apply transformation based on direction
  const x = direction === 'left' ? 
    useTransform(scrollYProgress, [0, 1], [0, -movementFactor]) :
    direction === 'right' ? 
    useTransform(scrollYProgress, [0, 1], [0, movementFactor]) : 0;
    
  const y = direction === 'up' ? 
    useTransform(scrollYProgress, [0, 1], [0, -movementFactor]) :
    direction === 'down' ? 
    useTransform(scrollYProgress, [0, 1], [0, movementFactor]) : 0;

  return (
    <motion.div
      ref={ref}
      className={`parallax-effect ${className}`}
      style={{
        ...style,
        position: 'relative'
      }}
    >
      <motion.div 
        style={{ x, y }} 
        className="parallax-content"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

/**
 * Container for multiple parallax elements
 */
export const ParallaxContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`parallax-container relative overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export default ParallaxEffect;