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
      className="space-intro min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center section-wrapper"
      style={{ 
        cursor: 'default', 
        margin: 0,
        padding: 0,
        marginTop: '-1px', 
        marginBottom: '0',
        position: 'relative',
        zIndex: 1,
        transformStyle: 'preserve-3d',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        backgroundColor: '#000000',
        borderBottom: 'none'
      }}
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
        <div className="text-center mb-16 relative">
          {/* Cosmic Nebula Background Effect for Title */}
          <div className="absolute inset-0 w-full h-full flex items-center justify-center">
            <div className="w-full max-w-4xl h-40 md:h-60 rounded-full bg-blue-900/10 blur-[100px] animate-pulse-slow"></div>
          </div>
          
          {/* Star/Particle Explosion Effect */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 2.5, 
              delay: 0.5,
              type: "spring",
              stiffness: 50
            }}
            className="absolute inset-0 z-0 overflow-hidden"
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full bg-blue-400"
                initial={{ 
                  x: "50%", 
                  y: "50%", 
                  scale: 0,
                  opacity: 0.8
                }}
                animate={{ 
                  x: `${50 + (Math.random() * 120 - 60)}%`, 
                  y: `${50 + (Math.random() * 120 - 60)}%`,
                  scale: Math.random() * 0.5,
                  opacity: 0
                }}
                transition={{ 
                  duration: 2 + Math.random() * 3,
                  delay: 0.8 + Math.random() * 0.5,
                  ease: "easeOut"
                }}
                style={{
                  width: `${Math.random() * 10 + 2}px`,
                  height: `${Math.random() * 10 + 2}px`,
                }}
              />
            ))}
          </motion.div>
          
          {/* Main Title with Matrix-style Loading Animation */}
          <div className="relative z-10 mb-10 overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: [0, 0.2, 0], scale: 2.5 }}
              transition={{ duration: 2, delay: 0.2 }}
              className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full"
            />
            
            {/* Matrix-style random characters that transform into actual letters */}
            <div className="flex justify-center overflow-hidden">
              {["F", "O", "U", "N", "D", "A", "T", "I", "O", "N", "S", " ", "A", "I"].map((letter, index) => (
                <div key={index} className="relative">
                  {/* Background glow pulse for each letter */}
                  <motion.div
                    className="absolute inset-0 rounded-full bg-blue-500/10 blur-lg"
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: letter === " " ? 0 : [0, 1.2, 1],
                      opacity: letter === " " ? 0 : [0, 0.8, 0]
                    }}
                    transition={{
                      duration: 2,
                      delay: 0.3 + index * 0.1,
                      ease: "easeOut"
                    }}
                  />
                  
                  {/* Random character scramble effect */}
                  <motion.div 
                    className="relative"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.1, delay: 0.5 + index * 0.1 }}
                  >
                    {letter !== " " && (
                      <motion.div
                        className="absolute top-0 left-0 w-full h-full flex justify-center items-center"
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1.5, delay: 0.7 + index * 0.15 }}
                      >
                        {Array.from({ length: 8 }).map((_, i) => (
                          <motion.span
                            key={i}
                            className="absolute text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-black text-blue-500/80"
                            initial={{ opacity: 0 }}
                            animate={{ 
                              opacity: [0, 1, 0],
                              display: i === 7 ? "none" : "block"
                            }}
                            transition={{
                              duration: 0.2,
                              delay: 0.5 + index * 0.1 + i * 0.05,
                              ease: "easeInOut"
                            }}
                          >
                            {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                          </motion.span>
                        ))}
                      </motion.div>
                    )}
                    
                    {/* Actual letter with cool 3D flip and glow */}
                    <motion.span
                      className="inline-block text-5xl sm:text-6xl md:text-7xl lg:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-300 to-blue-600"
                      initial={{ 
                        opacity: 0,
                        rotateX: 90,
                        y: letter === " " ? 0 : 20
                      }}
                      animate={{ 
                        opacity: 1,
                        rotateX: 0,
                        y: 0
                      }}
                      transition={{ 
                        type: "spring", 
                        damping: 15,
                        stiffness: 150,
                        delay: 0.9 + index * 0.15,
                        duration: 1
                      }}
                      style={{
                        textShadow: '0 0 15px rgba(100, 200, 255, 0.7)',
                        marginLeft: letter === " " ? "0.5rem" : "-0.05em",
                        WebkitBackgroundClip: "text",
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden"
                      }}
                    >
                      {letter === " " ? "\u00A0" : letter}
                    </motion.span>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Subtitle with Typing Effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3, duration: 1 }}
            className="relative z-10"
          >
            <div className="w-full h-full absolute bg-gradient-to-r from-transparent via-blue-900/20 to-transparent blur-md"></div>
            <motion.div 
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-blue-200 mb-8 sm:mb-12 max-w-3xl mx-auto px-4 sm:px-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.8, duration: 1.2 }}
            >
              <motion.span
                className="inline-block overflow-hidden whitespace-nowrap border-r-4 border-blue-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ 
                  delay: 3.2, 
                  duration: 2.5,
                  ease: "easeInOut"
                }}
              >
                Voice AI reimagined for the future
              </motion.span>
            </motion.div>
          </motion.div>
          
          {/* Decorative animated underline */}
          <motion.div 
            className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent max-w-[60%] mx-auto rounded-full"
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: "60%", opacity: 1 }}
            transition={{ delay: 4, duration: 1.2 }}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4.5, duration: 1.2 }}
          className="mt-12"
        >
          {/* Cosmic glow effect behind button */}
          <div className="relative inline-block">
            {/* Button glow effect - Fixed size and position */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-600 rounded-full opacity-70 hover:opacity-100 blur-md transition-all duration-1000 animate-pulse-slow"></div>
            
            {/* Animated particles around button - Fixed positioning */}
            <div className="absolute inset-0 w-full h-full">
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-blue-400"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.5, 0],
                    opacity: [0, 0.8, 0],
                    x: [0, (Math.random() * 60 - 30)],
                    y: [0, (Math.random() * 60 - 30)]
                  }}
                  transition={{ 
                    repeat: Infinity,
                    duration: 2 + Math.random() * 2,
                    delay: Math.random() * 2,
                    repeatDelay: Math.random()
                  }}
                  style={{
                    left: `${20 + (i * 12)}%`,
                    top: `${50}%`
                  }}
                />
              ))}
            </div>
            
            {/* Actual button with hover effects - Fixed width */}
            <motion.button 
              className="relative px-8 py-3 bg-black/20 backdrop-blur-sm border-2 border-blue-400 text-blue-200 rounded-full text-lg font-medium hover:text-white z-10 w-auto"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 0 25px rgba(66, 153, 225, 0.5)"
              }}
              whileTap={{ scale: 0.98 }}
              aria-label="Begin your journey"
              onClick={() => {
                // Scroll to the agent selection section smoothly
                const agentSection = document.querySelector('.agent-selection-section');
                if (agentSection) {
                  agentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 whitespace-nowrap">
                <span className="tracking-wide">Begin Your Journey</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5,
                    repeatDelay: 0.5
                  }}
                >
                  →
                </motion.span>
              </span>
              
              {/* Button shine effect - Fixed width */}
              <motion.div 
                className="absolute inset-0 w-full h-full overflow-hidden bg-gradient-to-r from-transparent via-blue-400/20 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ 
                  repeat: Infinity, 
                  repeatType: "loop", 
                  duration: 3,
                  ease: "easeInOut",
                  repeatDelay: 1
                }}
              />
            </motion.button>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5.5, duration: 1 }}
          className="mt-20 mb-4"
        >
          <motion.div 
            className="flex flex-col items-center"
            animate={{ y: [0, -5, 0] }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: "easeInOut"
            }}
          >
            {/* Animated reveal text */}
            <motion.p 
              className="text-sm sm:text-base font-medium tracking-widest mb-3 relative overflow-hidden"
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: "auto", 
                opacity: 1,
                transition: { delay: 6, duration: 1 }
              }}
            >
              <span className="bg-gradient-to-r from-blue-400 via-white to-blue-400 text-transparent bg-clip-text">SCROLL TO EXPLORE</span>
              
              {/* Animated underline */}
              <motion.span 
                className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 6.3, duration: 1.5 }}
              />
            </motion.p>
            
            {/* Scroll mouse with more complex animation */}
            <div className="relative">
              {/* Outer glow */}
              <div className="absolute inset-0 rounded-full bg-blue-500/20 filter blur-md animate-pulse-slow"></div>
              
              {/* Mouse body */}
              <div className="w-7 h-12 border-2 border-blue-400 bg-blue-900/20 backdrop-blur-sm rounded-full flex justify-center items-start p-1 relative overflow-hidden">
                {/* Mouse wheel dot */}
                <motion.div 
                  className="w-2 h-4 bg-blue-300 rounded-full"
                  animate={{ 
                    y: [0, 18, 0],
                    background: [
                      "rgba(147, 197, 253, 0.7)", 
                      "rgba(255, 255, 255, 0.9)",
                      "rgba(147, 197, 253, 0.7)"
                    ]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.8,
                    ease: "easeInOut"
                  }}
                />
                
                {/* Mouse shine animation */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-b from-blue-400/20 via-transparent to-transparent"
                  animate={{
                    y: ["0%", "200%"],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "easeInOut"
                  }}
                />
              </div>
              
              {/* Down arrows animation */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-80">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className="w-1.5 h-1.5 border-r-2 border-b-2 border-blue-300 transform rotate-45 mb-1"
                    animate={{
                      opacity: [0, 1, 0],
                      y: [-(index * 3), 3 + (index * 3)]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: index * 0.15,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SpaceIntroSection;