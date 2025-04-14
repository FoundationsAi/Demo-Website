import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AnimatedText } from '@/components/animated-text';
import { SectionTransition } from '@/components/section-transition';
import { ScrollReveal } from '@/components/scroll-reveal';

interface FullscreenMountainSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  backgroundImage: string;
  textPosition?: 'center' | 'left' | 'right';
  textColor?: string;
  children?: React.ReactNode;
  actionLabel?: string;
  actionLink?: string;
  overlay?: boolean;
}

/**
 * Fullscreen Mountain Section - Mimics National Geographic fullscreen sections
 */
export const FullscreenMountainSection: React.FC<FullscreenMountainSectionProps> = ({
  id,
  title,
  subtitle,
  backgroundImage,
  textPosition = 'center',
  textColor = 'text-white',
  children,
  actionLabel,
  actionLink,
  overlay = true
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 1, 1, 0]);
  
  // Text position classes
  const textPositionClass = {
    'center': 'text-center mx-auto justify-center items-center',
    'left': 'text-left ml-0 mr-auto justify-start items-start',
    'right': 'text-right mr-0 ml-auto justify-end items-end',
  }[textPosition];
  
  // Dynamic styles for background
  const bgStyle = {
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  };

  return (
    <section 
      id={id} 
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-black section-wrapper"
      style={{ 
        margin: 0, 
        padding: 0,
        marginTop: '0', // Adjust for perfect connection
        marginBottom: '-2px', // Ensure seamless connection with next section
        position: 'relative', // Ensure proper position context
        zIndex: 1, // Maintain proper stacking order
        transformStyle: 'preserve-3d', // Fix for potential Safari issues
        transform: 'translateZ(0)', // Hardware acceleration
        backfaceVisibility: 'hidden', // Prevent rendering artifacts
        backgroundColor: '#000000', // Ensure black background
        borderTop: 'none'
      }}
    >
      {/* Parallax Background */}
      <motion.div 
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{
          ...bgStyle,
          y,
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Optional overlay for better text contrast */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent pointer-events-none" />
      )}
      
      {/* Content Container */}
      <div className="relative z-10 h-full w-full max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col">
        <div className={`flex flex-col max-w-2xl ${textPositionClass} h-full py-24`}>
          <div className="mt-auto mb-4">
            <ScrollReveal animation="fadeInUp" threshold={0.15}>
              <h2 className={`text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 ${textColor} px-4 text-center sm:text-center break-words`}>
                {title.split(' ').map((word, i) => (
                  <span key={i} className="inline-block">
                    {word}
                    {i < title.split(' ').length - 1 && ' '}
                  </span>
                ))}
              </h2>
            </ScrollReveal>
            
            {subtitle && (
              <ScrollReveal animation="fadeInUp" delay={0.15} threshold={0.15}> {/* Reduced delay for better performance */}
                <p className={`text-lg md:text-xl opacity-90 mt-4 ${textColor}`}>
                  {subtitle}
                </p>
              </ScrollReveal>
            )}
            
            {children && (
              <ScrollReveal animation="fadeInUp" delay={0.25} threshold={0.15}> {/* Reduced delay for better performance */}
                <div className="mt-6 max-w-prose">
                  {children}
                </div>
              </ScrollReveal>
            )}
            
            {actionLabel && (
              <ScrollReveal animation="fadeInUp" delay={0.35} threshold={0.15}> {/* Reduced delay for better performance */}
                <div className="mt-8">
                  <a 
                    href={actionLink || "#"}
                    className="px-8 py-3 bg-yellow-400 text-black font-medium rounded-full inline-flex items-center justify-center transition transform hover:scale-105"
                  >
                    {actionLabel}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-2" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </a>
                </div>
              </ScrollReveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FullscreenMountainSection;