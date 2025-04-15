import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

// Define available animation effects - simplified for better performance
const animations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 30 },  // Reduced distance for better performance
    visible: { opacity: 1, y: 0 }
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -30 }, // Reduced distance for better performance
    visible: { opacity: 1, y: 0 }
  },
  fadeInLeft: {
    hidden: { opacity: 0, x: -30 }, // Reduced distance for better performance
    visible: { opacity: 1, x: 0 }
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 30 },  // Reduced distance for better performance
    visible: { opacity: 1, x: 0 }
  },
  zoomIn: {
    hidden: { opacity: 0, scale: 0.97 }, // Reduced scale for better performance
    visible: { opacity: 1, scale: 1 }
  },
  zoomOut: {
    hidden: { opacity: 0, scale: 1.03 }, // Reduced scale for better performance
    visible: { opacity: 1, scale: 1 }
  },
  slideUp: {
    hidden: { y: 50 },               // Reduced distance for better performance
    visible: { y: 0 }
  },
  slideDown: {
    hidden: { y: -50 },              // Reduced distance for better performance
    visible: { y: 0 }
  },
  slideLeft: {
    hidden: { x: -50 },              // Reduced distance for better performance
    visible: { x: 0 }
  },
  slideRight: {
    hidden: { x: 50 },               // Reduced distance for better performance
    visible: { x: 0 }
  },
  // Special one for staggered children
  staggered: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }
};

interface ScrollRevealProps {
  children: React.ReactNode;
  animation?: keyof typeof animations;
  duration?: number;
  delay?: number;
  ease?: string;
  threshold?: number;
  className?: string;
  once?: boolean;
  staggerChildren?: number;
  delayChildren?: number;
  // For more precise control
  customVariants?: {
    hidden: any;
    visible: any;
  };
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fadeInUp',
  duration = 0.4, // Reduced for better performance
  delay = 0,
  ease = "easeOut",
  threshold = 0.15, // Increased for earlier triggering
  className = "",
  once = true,
  staggerChildren = 0.05, // Reduced for better performance
  delayChildren = 0,
  customVariants
}) => {
  const controls = useAnimation();
  const ref = useRef(null);
  // Framer Motion's useInView uses 'amount' instead of 'threshold'
  const inView = useInView(ref, { 
    amount: threshold,
    once 
  });

  // Get the variants based on the animation type or use custom variants
  const variants = customVariants || animations[animation];

  // Add transition properties to the "visible" state
  const visibleWithTransition = {
    ...variants.visible,
    transition: {
      duration,
      delay,
      ease,
      // Add staggered animation for children if it's a parent component
      ...(staggerChildren && {
        staggerChildren,
        delayChildren
      })
    }
  };

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else if (!once) {
      controls.start('hidden');
    }
  }, [controls, inView, once]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={`will-change-transform ${className}`}
      exit="hidden" // This helps with unmounting animations
      style={{ 
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
        position: "relative" // Adding position relative to fix Framer Motion warning
      }}
    >
      {children}
    </motion.div>
  );
};

// Item component for staggered animations
export const ScrollRevealItem: React.FC<Omit<ScrollRevealProps, 'staggerChildren' | 'delayChildren'>> = ({
  children,
  animation = 'fadeInUp',
  duration = 0.4, // Reduced for better performance
  delay = 0,
  ease = "easeOut",
  className = "",
  customVariants
}) => {
  // Get the variants based on the animation type or use custom variants
  const variants = customVariants || animations[animation];

  return (
    <motion.div
      variants={{
        ...variants,
        visible: {
          ...variants.visible,
          transition: {
            duration,
            delay,
            ease
          }
        }
      }}
      className={`will-change-transform ${className}`}
      style={{ 
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
        position: "relative" // Adding position relative to fix Framer Motion warning
      }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;