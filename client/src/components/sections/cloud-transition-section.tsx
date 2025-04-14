import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { AnimatedText } from '@/components/animated-text';
import { ScrollReveal } from '@/components/scroll-reveal';

interface CloudTransitionSectionProps {
  id?: string;
}

/**
 * CloudTransitionSection - Creates a seamless transition from space to mountains
 * with animated cloud movement
 */
export const CloudTransitionSection: React.FC<CloudTransitionSectionProps> = ({ id }) => {
  return (
    <section 
      id={id}
      className="relative min-h-screen w-full overflow-hidden section-wrapper"
      style={{ 
        background: 'linear-gradient(to bottom, #000000, #111a30, #1a2f59, #243882, #2e42ab)',
        margin: 0,
        padding: 0,
        marginTop: '-2px', // Ensure seamless connection with previous section
        marginBottom: '-2px', // Ensure seamless connection with next section
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Static background with stars */}
      <div className="absolute inset-0" style={{ 
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      {/* Fixed, centered content that will absolutely be visible */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center max-w-4xl mx-auto px-6">
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-widest text-white mb-6">
            BEYOND THE COSMOS
          </h2>
          
          <div className="h-1 w-48 bg-blue-500 mx-auto mb-8"></div>
          
          <p className="text-xl md:text-2xl text-white leading-relaxed max-w-2xl mx-auto font-bold">
            Where the vastness of space meets the beauty of Earth. Our journey continues through the clouds and beyond.
          </p>
        </div>
      </div>
      
      {/* Bottom gradient for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#142448] to-transparent z-50" />
    </section>
  );
};

export default CloudTransitionSection;