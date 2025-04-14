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
  // Simple approach with fixed, guaranteed visibility
  return (
    <section 
      id={id}
      className="relative min-h-screen w-full overflow-hidden section-wrapper flex flex-col justify-center items-center"
      style={{ 
        background: 'linear-gradient(to bottom, #000000, #111a30, #1a2f59, #243882, #2e42ab)',
        margin: 0,
        padding: 0,
        marginTop: '-2px',
        marginBottom: '-2px',
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Static background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-transparent"></div>
      
      {/* White starfield background */}
      <div className="absolute inset-0" style={{ 
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
        backgroundSize: '30px 30px'
      }}></div>
      
      {/* Main content container with strong visibility */}
      <div className="relative z-50 container mx-auto px-4 py-12 text-center">
        {/* BEYOND THE COSMOS header - large, bright, impossible to miss */}
        <div className="bg-black inline-block py-6 px-8 mx-auto mb-12 rounded-xl border-4 border-blue-500 shadow-[0_0_50px_rgba(0,100,255,0.6)]">
          <h1 className="text-5xl md:text-7xl font-black uppercase text-white" 
            style={{
              textShadow: `
                0 0 10px #fff,
                0 0 20px #fff,
                0 0 30px #0066ff,
                0 0 40px #0066ff,
                0 0 50px #0066ff
              `
            }}>
            Beyond the Cosmos
          </h1>
        </div>
          
        {/* Description text - ultra high contrast */}
        <div className="max-w-2xl mx-auto bg-black p-8 rounded-xl border-2 border-blue-600 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
          <p className="text-xl md:text-2xl text-white font-bold leading-relaxed mb-0">
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