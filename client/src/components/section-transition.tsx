import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation, useInView, useScroll, useTransform } from 'framer-motion';

interface SectionTransitionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  // Animation settings
  transitionType?: 'fade' | 'slide' | 'zoom' | 'parallax' | 'sticky' | 'reveal';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  distance?: number;
  threshold?: number;
  // Parallax settings
  parallaxSpeed?: number;
  // Sticky settings
  stickyDuration?: number;
  // Background options
  backgroundColor?: string;
  backgroundTransition?: boolean;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  children,
  id,
  className = '',
  style = {},
  transitionType = 'fade',
  direction = 'up',
  duration = 0.8,
  distance = 100,
  threshold = 0.1,
  parallaxSpeed = 0.2,
  stickyDuration = 1,
  backgroundColor,
  backgroundTransition = false,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { 
    amount: threshold, // Framer Motion uses 'amount' instead of 'threshold'
    once: false
  });
  const controls = useAnimation();
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Get scroll progress within the section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  // Parallax effect transformation
  const y = useTransform(
    scrollYProgress, 
    [0, 1], 
    [distance * parallaxSpeed, -distance * parallaxSpeed]
  );

  // Opacity based on scroll progress
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    [0, 1, 1, 0]
  );

  // Configure animation variants based on the transition type
  const getVariants = () => {
    switch (transitionType) {
      case 'slide':
        return {
          hidden: { 
            opacity: 0,
            x: direction === 'left' ? -distance : direction === 'right' ? distance : 0,
            y: direction === 'up' ? distance : direction === 'down' ? -distance : 0
          },
          visible: { 
            opacity: 1, 
            x: 0, 
            y: 0,
            transition: { duration, ease: [0.22, 1, 0.36, 1] }
          }
        };
      case 'zoom':
        return {
          hidden: { 
            opacity: 0, 
            scale: direction === 'up' || direction === 'left' ? 0.8 : 1.2 
          },
          visible: { 
            opacity: 1, 
            scale: 1,
            transition: { duration, ease: [0.22, 1, 0.36, 1] }
          }
        };
      case 'reveal':
        return {
          hidden: { 
            clipPath: direction === 'up' ? 'inset(100% 0 0 0)' : 
                      direction === 'down' ? 'inset(0 0 100% 0)' :
                      direction === 'left' ? 'inset(0 100% 0 0)' :
                      'inset(0 0 0 100%)'
          },
          visible: { 
            clipPath: 'inset(0 0 0 0)',
            transition: { duration, ease: [0.22, 1, 0.36, 1] }
          }
        };
      case 'fade':
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration } }
        };
    }
  };

  useEffect(() => {
    if (inView && !hasAnimated && transitionType !== 'parallax' && transitionType !== 'sticky') {
      controls.start('visible');
      if (transitionType !== 'fade') {
        setHasAnimated(true);
      }
    } else if (!inView && transitionType !== 'parallax' && transitionType !== 'sticky') {
      controls.start('hidden');
    }
  }, [inView, controls, hasAnimated, transitionType]);

  if (transitionType === 'parallax') {
    return (
      <div
        id={id}
        ref={sectionRef}
        className={`section-transition parallax-section ${className}`}
        style={{
          ...style,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: backgroundColor || 'transparent',
        }}
      >
        <motion.div
          style={{ y }}
          className="parallax-content"
        >
          {children}
        </motion.div>
      </div>
    );
  }

  if (transitionType === 'sticky') {
    return (
      <div
        id={id}
        ref={sectionRef}
        className={`section-transition sticky-section ${className}`}
        style={{
          ...style,
          position: 'relative',
          minHeight: `${100 * stickyDuration}vh`,
          backgroundColor: backgroundColor || 'transparent',
        }}
      >
        <motion.div
          style={{
            position: 'sticky',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            opacity: opacity,
            zIndex: 1,
          }}
        >
          {children}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      ref={sectionRef}
      className={`section-transition ${className}`}
      style={{
        ...style,
        backgroundColor: backgroundColor || 'transparent',
        position: 'relative' // Added position relative
      }}
      initial="hidden"
      animate={controls}
      variants={getVariants()}
    >
      {children}
    </motion.div>
  );
};

export default SectionTransition;