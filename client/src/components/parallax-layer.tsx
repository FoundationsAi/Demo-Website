import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxLayerProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  zIndex?: number;
  className?: string;
  offset?: [string, string]; // ScrollOffset format: e.g. ['start end', 'end start']
  style?: React.CSSProperties;
  shouldMoveOnMobile?: boolean;
}

/**
 * ParallaxLayer component for creating scroll-based parallax effects
 */
export const ParallaxLayer: React.FC<ParallaxLayerProps> = ({
  children,
  speed = 0.2,
  direction = 'up',
  zIndex = 0,
  className = '',
  offset = ['start end', 'end start'],
  style = {},
  shouldMoveOnMobile = false
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset
  });

  // Determine movement direction and calculate transform values
  const getTransform = () => {
    const distance = 100; // Base distance value
    const effectiveSpeed = speed * distance;

    switch (direction) {
      case 'up':
        return useTransform(scrollYProgress, [0, 1], [0, -effectiveSpeed]);
      case 'down':
        return useTransform(scrollYProgress, [0, 1], [0, effectiveSpeed]);
      case 'left':
        return useTransform(scrollYProgress, [0, 1], [0, -effectiveSpeed]);
      case 'right':
        return useTransform(scrollYProgress, [0, 1], [0, effectiveSpeed]);
      default:
        return useTransform(scrollYProgress, [0, 1], [0, -effectiveSpeed]);
    }
  };

  // Apply transform based on direction
  const y = direction === 'up' || direction === 'down' ? getTransform() : 0;
  const x = direction === 'left' || direction === 'right' ? getTransform() : 0;

  return (
    <motion.div
      ref={ref}
      style={{
        ...style,
        zIndex,
        x: shouldMoveOnMobile ? x : undefined,
        y: shouldMoveOnMobile ? y : undefined,
        position: 'relative'
      }}
      className={`parallax-layer ${className}`}
      data-parallax-speed={speed}
      data-parallax-direction={direction}
    >
      {/* Apply parallax effect only on larger screens */}
      <motion.div
        style={{
          x,
          y,
          position: 'relative'
        }}
        className="parallax-content hidden md:block"
      >
        {children}
      </motion.div>
      
      {/* Static content for mobile */}
      <div className="static-content md:hidden">
        {children}
      </div>
    </motion.div>
  );
};

/**
 * ParallaxGroup component that contains multiple parallax layers
 */
export const ParallaxGroup: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style = {} }) => {
  return (
    <div
      className={`parallax-group relative ${className}`}
      style={{
        ...style,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {children}
    </div>
  );
};

export default ParallaxLayer;