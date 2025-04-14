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
    
    // Create stars
    const stars: { x: number; y: number; radius: number; speed: number; opacity: number }[] = [];
    const generateStars = () => {
      stars.length = 0; // Clear any existing stars
      const starCount = Math.min(Math.floor(window.innerWidth * window.innerHeight / 1000), 500);
      
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5,
          speed: Math.random() * 0.05,
          opacity: Math.random() * 0.8 + 0.2
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
      
      // Draw stars with more dramatic movement
      stars.forEach(star => {
        ctx.beginPath();
        ctx.globalAlpha = star.opacity;
        
        // Make some stars larger with glow
        if (star.radius > 1.2) {
          // Add glow effect for larger stars
          const gradient = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.radius * 4
          );
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
          gradient.addColorStop(0.5, 'rgba(210, 230, 255, 0.3)');
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = gradient;
          ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Draw actual star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        
        // More dynamic movement - some stars move diagonally
        star.x += star.speed * (Math.random() > 0.5 ? 0.2 : -0.2);
        star.y += star.speed;
        
        // If star moves off screen, reset it
        if (star.y > canvas.height || star.x < 0 || star.x > canvas.width) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
          // Randomly vary the speed for more natural movement
          star.speed = Math.random() * 0.08 + 0.02;
        }
      });
      
      // Create more frequent twinkling effect
      if (Math.random() > 0.95) {
        const randomStar = stars[Math.floor(Math.random() * stars.length)];
        if (randomStar) {
          randomStar.opacity = 1;
          randomStar.radius *= 1.3; // Briefly expand
          setTimeout(() => {
            randomStar.opacity = Math.random() * 0.8 + 0.2;
            randomStar.radius /= 1.3; // Return to normal size
          }, 100 + Math.random() * 200);
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
      style={{ cursor: 'default' }}
    >
      {/* Stars canvas background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 w-full h-full"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Add a gradient at the bottom to transition into the clouds section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#000000] via-[#070f24] to-transparent z-10 pointer-events-none" />
      
      {/* Content overlay */}
      <div className="container relative z-10 mx-auto text-center px-4 py-16 sm:py-24 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            delay: 1.2, 
            duration: 2.5,
            ease: [0.25, 0.1, 0.25, 1]  // Custom easing for more dramatic effect
          }}
          className="text-center mb-8"
        >
          {/* Title with letter-by-letter reveal effect */}
          <div className="overflow-hidden mb-8">
            <motion.h1
              className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-extrabold tracking-wider text-white leading-tight"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 1.8, 
                delay: 0.6,
                ease: [0.16, 1, 0.3, 1] // Spring-like motion
              }}
            >
              FOUNDATIONS AI
            </motion.h1>
          </div>
          
          {/* Subtitle with a different animation */}
          <div className="overflow-hidden">
            <motion.div 
              className="text-base sm:text-lg md:text-2xl lg:text-3xl font-light text-blue-200 mb-8 sm:mb-12 max-w-3xl mx-auto px-4 sm:px-0"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                duration: 1.5, 
                delay: 2,
                ease: "easeOut"
              }}
            >
              Voice AI reimagined for the future
            </motion.div>
          </div>
        </motion.div>
        
        {/* Call to action button with glow effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3, duration: 0.8 }}
          className="mt-8"
        >
          <button 
            className="px-8 py-3 bg-transparent border-2 border-blue-400 text-blue-300 rounded-full text-lg hover:bg-blue-900/20 transition-all duration-300 transform hover:scale-105 relative group"
            aria-label="Begin your journey"
          >
            <span className="relative z-10">Begin Your Journey</span>
            <motion.div 
              className="absolute inset-0 rounded-full bg-blue-500/10 blur-md -z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.2, 0.8] }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity,
                repeatType: "loop"
              }}
            />
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