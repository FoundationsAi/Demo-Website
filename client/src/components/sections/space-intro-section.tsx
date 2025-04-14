import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AnimatedText } from '@/components/animated-text';
import { ParallaxEffect } from '@/components/parallax-effect';

/**
 * SpaceIntroSection - A full-screen space intro with animated stars
 */
export const SpaceIntroSection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize stars animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions to window size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Call initially and add resize listener
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Create stars - optimized for better performance
    const stars: { x: number; y: number; radius: number; speed: number; opacity: number }[] = [];
    const generateStars = () => {
      stars.length = 0; // Clear any existing stars
      // Reduced star count for better performance
      const starCount = Math.min(Math.floor(window.innerWidth * window.innerHeight / 1500), 300);
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.2, // Slightly smaller stars for better performance
          speed: Math.random() * 0.03, // Slower for better performance
          opacity: Math.random() * 0.7 + 0.2
        });
      }
    };
    
    generateStars();
    window.addEventListener('resize', generateStars);
    
    // Animate stars
    let animationFrameId: number;
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgb(0, 0, 0)'; // Pure black for true space
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw stars with optimized rendering for better performance
      stars.forEach(star => {
        ctx.beginPath();
        ctx.globalAlpha = star.opacity;
        
        // Only apply glow effect to a small percentage of stars for better performance
        if (star.radius > 1.1 && Math.random() > 0.7) {
          // Simplified glow effect for better performance
          ctx.fillStyle = 'rgba(210, 230, 255, 0.3)';
          ctx.arc(star.x, star.y, star.radius * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw actual star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        
        // More efficient movement calculation
        star.x += star.speed * (star.x % 2 === 0 ? 0.1 : -0.1);
        star.y += star.speed;
        
        // If star moves off screen, reset it
        if (star.y > canvas.height || star.x < 0 || star.x > canvas.width) {
          star.y = 0;
          star.x = Math.floor(Math.random() * canvas.width);
          // Fixed speed values for better performance
          star.speed = 0.03;
        }
      });
      
      // Less frequent twinkling effect for better performance
      if (Math.random() > 0.98) {
        const randomIndex = Math.floor(Math.random() * stars.length);
        const randomStar = stars[randomIndex];
        if (randomStar) {
          randomStar.opacity = 1;
          // Avoid expensive DOM access in animation loop with setTimeout
          randomStar.opacity = Math.random() * 0.7 + 0.3;
        }
      }
      
      animationFrameId = requestAnimationFrame(draw);
    };
    
    draw();
    
    // Clean up
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('resize', generateStars);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className="space-intro min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center"
      style={{ cursor: 'default', marginBottom: '-1px' }} // Ensure no gap between sections
    >
      {/* Stars canvas background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 w-full h-full"
        style={{ 
          pointerEvents: 'none',
          transform: 'translateZ(0)', // Apply hardware acceleration
          willChange: 'transform',
        }}
      />
      
      {/* Content overlay */}
      <div className="container relative z-10 mx-auto text-center px-4 py-16 sm:py-24 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 2 }}
          className="text-center mb-8"
        >
          <AnimatedText 
            text="FOUNDATIONS AI" 
            as="h1" 
            animation="fade"
            className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-extrabold tracking-wider text-white mb-8 leading-tight"
            stagger={0.05}
            delay={0.5}
          />
          
          <ParallaxEffect speed={0.2} direction="up">
            <div className="text-base sm:text-lg md:text-2xl lg:text-3xl font-light text-blue-200 mb-8 sm:mb-12 max-w-3xl mx-auto px-4 sm:px-0">
              <AnimatedText 
                text="Voice AI reimagined for the future" 
                as="div" 
                animation="slide"
                delay={1.5}
              />
            </div>
          </ParallaxEffect>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="mt-8"
        >
          <button 
            className="px-8 py-3 bg-transparent border-2 border-blue-400 text-blue-300 rounded-full text-lg hover:bg-blue-900/20 transition-all duration-300 transform hover:scale-105"
            aria-label="Begin your journey"
          >
            Begin Your Journey
          </button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 3.5, duration: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <div className="flex flex-col items-center">
            <p className="text-sm text-blue-300 mb-2">Scroll to explore</p>
            <div className="w-6 h-10 border-2 border-blue-300 rounded-full flex justify-center items-start p-1">
              <motion.div 
                className="w-1.5 h-3 bg-blue-300 rounded-full"
                animate={{ 
                  y: [0, 15, 0],
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5,
                  ease: "easeInOut" 
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SpaceIntroSection;