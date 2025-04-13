import React from 'react';
import { motion } from 'framer-motion';
import { ScrollReveal, ScrollRevealItem } from '@/components/scroll-reveal';

interface TextOverlaySectionProps {
  backgroundImage?: string;
  backgroundColor?: string;
  title?: string;
  subtitle?: string;
  content?: React.ReactNode;
  textPosition?: 'center' | 'left' | 'right';
  textAlignment?: 'center' | 'left' | 'right';
  textColor?: string;
  children?: React.ReactNode;
  fullHeight?: boolean;
  className?: string;
}

/**
 * TextOverlaySection - Text overlay on image in National Geographic style
 */
export const TextOverlaySection: React.FC<TextOverlaySectionProps> = ({
  backgroundImage,
  backgroundColor = '#f5f5f5',
  title,
  subtitle,
  content,
  textPosition = 'center',
  textAlignment = 'center',
  textColor = 'text-gray-900',
  children,
  fullHeight = false,
  className = '',
}) => {
  // Determine text container positioning classes
  const containerPositionClass = {
    'center': 'justify-center items-center text-center',
    'left': 'justify-start items-start text-left',
    'right': 'justify-end items-end text-right',
  }[textPosition];
  
  // Determine text alignment classes
  const textAlignmentClass = {
    'center': 'text-center mx-auto',
    'left': 'text-left ml-0',
    'right': 'text-right mr-0',
  }[textAlignment];
  
  // Create staggered animation for content
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  };

  return (
    <section 
      className={`relative ${fullHeight ? 'min-h-screen' : 'py-24'} w-full overflow-hidden ${className}`}
      style={{
        backgroundColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Optional overlay for better text contrast if using background image */}
      {backgroundImage && (
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      )}
      
      {/* Content wrapper */}
      <div className={`relative z-10 container mx-auto px-6 md:px-12 flex flex-col ${fullHeight ? 'min-h-screen' : 'h-full'} ${containerPositionClass}`}>
        <div className={`max-w-3xl ${textAlignmentClass} py-12`}>
          <ScrollReveal animation="fadeInUp">
            {title && (
              <motion.h2
                className={`text-3xl md:text-5xl font-bold mb-6 ${textColor}`}
                variants={fadeUpVariants}
              >
                {title}
              </motion.h2>
            )}
            
            {subtitle && (
              <motion.p
                className={`text-xl md:text-2xl font-light mb-8 ${textColor} opacity-90`}
                variants={fadeUpVariants}
              >
                {subtitle}
              </motion.p>
            )}
            
            {content && (
              <motion.div 
                className={`prose prose-lg max-w-none ${textColor}`}
                variants={fadeUpVariants}
              >
                {content}
              </motion.div>
            )}
            
            {children && (
              <div className="mt-8">
                {children}
              </div>
            )}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

/**
 * TextCard component for creating the side text cards like in National Geographic
 */
export const TextCard: React.FC<{ 
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}> = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <ScrollRevealItem animation="fadeInUp">
      <div className={`bg-white/95 backdrop-blur-sm p-8 rounded-sm shadow-lg max-w-md ${className}`}>
        {title && (
          <h3 className="text-xl font-bold uppercase tracking-wider text-gray-800 mb-3">
            {title}
          </h3>
        )}
        
        {subtitle && (
          <p className="text-lg font-light text-gray-600 mb-4">
            {subtitle}
          </p>
        )}
        
        <div className="text-gray-700">
          {children}
        </div>
      </div>
    </ScrollRevealItem>
  );
};

export default TextOverlaySection;