import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ScrollReveal } from '@/components/scroll-reveal';

interface LargeNumberSectionProps {
  number: string;
  year?: string;
  title?: string;
  description?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  foregroundImage?: string;
  textPosition?: 'left' | 'right';
  children?: React.ReactNode;
  overlayOpacity?: number;
}

/**
 * LargeNumberSection - Component for displaying large numbers with overlay text
 * Based on National Geographic style examples
 */
export const LargeNumberSection: React.FC<LargeNumberSectionProps> = ({
  number,
  year,
  title,
  description,
  backgroundImage,
  backgroundColor = '#f5f5f5',
  foregroundImage,
  textPosition = 'right',
  children,
  overlayOpacity = 0.3,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const numberOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0.3, 1, 1, 0.3]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  
  // Position classes for layout
  const textPositionClasses = textPosition === 'left' 
    ? 'mr-auto left-8 md:left-16 lg:left-24' 
    : 'ml-auto right-8 md:right-16 lg:right-24';
  
  return (
    <section 
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
      style={{ 
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background overlay */}
      <div 
        className="absolute inset-0" 
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
      />
      
      {/* Large Number */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ opacity: numberOpacity }}
      >
        <h2 className="text-white text-[8rem] sm:text-[12rem] md:text-[20rem] lg:text-[30rem] font-bold opacity-40">
          {number}
        </h2>
      </motion.div>
      
      {/* Foreground silhouettes or images */}
      {foregroundImage && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          <img 
            src={foregroundImage} 
            alt="Foreground elements" 
            className="absolute bottom-0 w-full h-auto object-contain object-bottom"
          />
        </div>
      )}
      
      {/* Text content */}
      <motion.div 
        className={`absolute z-20 bottom-12 sm:bottom-16 md:bottom-24 ${textPositionClasses} max-w-xs sm:max-w-sm md:max-w-md px-4 sm:px-0`}
        style={{ opacity: contentOpacity, y }}
      >
        <ScrollReveal>
          {year && (
            <p className="text-blue-300 font-light text-xl mb-3">
              {year}
            </p>
          )}
          
          {title && (
            <h3 className="text-white text-2xl md:text-3xl font-bold mb-4">
              {title}
            </h3>
          )}
          
          {description && (
            <p className="text-gray-200 text-base md:text-lg mb-6">
              {description}
            </p>
          )}
          
          {children}
        </ScrollReveal>
      </motion.div>
    </section>
  );
};

interface SideInfoCardProps {
  title: string;
  children: React.ReactNode;
  position?: 'left' | 'right';
}

/**
 * SideInfoCard - Component for displaying information cards on the side
 */
export const SideInfoCard: React.FC<SideInfoCardProps> = ({
  title,
  children,
  position = 'right'
}) => {
  const positionClass = position === 'left' 
    ? 'left-4 sm:left-8 md:left-16' 
    : 'right-4 sm:right-8 md:right-16';
  
  return (
    <ScrollReveal animation="fadeInUp">
      <div className={`absolute ${positionClass} top-1/4 z-20 max-w-xs bg-white/10 backdrop-blur-md p-6 rounded-sm border border-white/20`}>
        <h4 className="text-white uppercase text-sm font-bold tracking-wider mb-3">
          {title}
        </h4>
        <div className="text-gray-200 text-sm">
          {children}
        </div>
      </div>
    </ScrollReveal>
  );
};

export default LargeNumberSection;