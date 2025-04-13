import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface FloatingCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  border?: boolean;
  borderColor?: string;
  glare?: boolean;
  shadow?: boolean;
  rotation?: boolean;
  duration?: number;
}

/**
 * Floating Card component that creates an interactive 3D-like hover effect
 */
export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = '',
  intensity = 10,
  border = false,
  borderColor = 'rgba(255, 255, 255, 0.2)',
  glare = true,
  shadow = true,
  rotation = true,
  duration = 0.3
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // Motion values for tracking mouse position and card rotation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the movement with springs
  const rotateX = useSpring(0, { damping: 20, stiffness: 300 });
  const rotateY = useSpring(0, { damping: 20, stiffness: 300 });
  const shadowX = useSpring(0, { damping: 25, stiffness: 400 });
  const shadowY = useSpring(0, { damping: 25, stiffness: 400 });
  const glareX = useSpring(50, { damping: 20, stiffness: 300 });
  const glareY = useSpring(50, { damping: 20, stiffness: 300 });
  const glareOpacity = useSpring(0, { damping: 20, stiffness: 300 });
  const scale = useSpring(1, { damping: 20, stiffness: 300 });

  // Transform our rotations based on mouse position
  const transformedRotateX = useTransform(rotateX, val => `rotateX(${rotation ? val : 0}deg)`);
  const transformedRotateY = useTransform(rotateY, val => `rotateY(${rotation ? val : 0}deg)`);
  
  // Transform shadow position
  const shadowTransform = useTransform(
    [shadowX, shadowY],
    ([x, y]: [number, number]) => shadow ? `${x * 0.15}px ${y * 0.15}px 30px rgba(0, 0, 0, 0.2)` : 'none'
  );

  // Monitor the card size
  useEffect(() => {
    if (cardRef.current) {
      setSize({
        width: cardRef.current.offsetWidth,
        height: cardRef.current.offsetHeight
      });
    }
  }, []);

  // Function to handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    
    // Get relative mouse position
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    
    // Convert to normalized coordinates (-1 to 1)
    const normalizedX = (relativeX / rect.width) * 2 - 1;
    const normalizedY = (relativeY / rect.height) * 2 - 1;
    
    // Set motion values with intensity factor
    mouseX.set(normalizedX);
    mouseY.set(normalizedY);
    
    // Apply rotations (inverted)
    rotateX.set(-normalizedY * intensity);
    rotateY.set(normalizedX * intensity);
    
    // Apply shadow
    shadowX.set(normalizedX * intensity);
    shadowY.set(normalizedY * intensity);
    
    // Apply glare effect position
    glareX.set(relativeX / rect.width * 100);
    glareY.set(relativeY / rect.height * 100);
  };

  // Handle mouse enter/leave
  const handleMouseEnter = () => {
    setIsHovered(true);
    scale.set(1.02);
    glareOpacity.set(glare ? 0.15 : 0);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    rotateX.set(0);
    rotateY.set(0);
    shadowX.set(0);
    shadowY.set(0);
    glareX.set(50);
    glareY.set(50);
    glareOpacity.set(0);
    scale.set(1);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`floating-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        transformStyle: 'preserve-3d',
        transformOrigin: 'center center',
        transform: [transformedRotateX, transformedRotateY],
        scale,
        boxShadow: shadowTransform,
        border: border ? `1px solid ${borderColor}` : 'none',
        transition: `border ${duration}s ease`,
        willChange: 'transform',
        borderColor: isHovered && border ? borderColor : 'transparent'
      }}
    >
      {/* Glare effect */}
      {glare && (
        <motion.div
          className="glare-effect"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            borderRadius: 'inherit',
            opacity: glareOpacity,
            background: 'radial-gradient(circle at var(--glareX) var(--glareY), rgba(255, 255, 255, 0.8), transparent 50%)',
            '--glareX': glareX.get() + '%',
            '--glareY': glareY.get() + '%',
            zIndex: 2,
            mixBlendMode: 'overlay'
          }}
        />
      )}
      
      {/* Content */}
      <div 
        className="card-content"
        style={{ 
          position: 'relative',
          zIndex: 1,
          backfaceVisibility: 'hidden'
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default FloatingCard;