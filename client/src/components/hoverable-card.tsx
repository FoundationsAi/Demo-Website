import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HoverableCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  border?: boolean;
  borderColor?: string;
  glare?: boolean;
  shadow?: boolean;
  rotation?: boolean;
}

/**
 * A card component that responds to hover with 3D-like effects
 */
export const HoverableCard: React.FC<HoverableCardProps> = ({
  children,
  className = '',
  intensity = 10,
  border = false,
  borderColor = 'rgba(255, 255, 255, 0.2)',
  glare = true,
  shadow = true,
  rotation = true
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePosition, setGlarePosition] = useState({ x: '50%', y: '50%' });
  const [shadowOffset, setShadowOffset] = useState({ x: 0, y: 0 });

  // Function to handle mouse move for rotation and effects
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate cursor position relative to card center
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation (inverted so it follows cursor)
    const rotateYValue = (mouseX / (rect.width / 2)) * intensity;
    const rotateXValue = -(mouseY / (rect.height / 2)) * intensity;
    
    // Apply rotation if enabled
    if (rotation) {
      setRotateX(rotateXValue);
      setRotateY(rotateYValue);
    }
    
    // Calculate shadow offset
    if (shadow) {
      setShadowOffset({
        x: (mouseX / (rect.width / 2)) * 10,
        y: (mouseY / (rect.height / 2)) * 10
      });
    }
    
    // Calculate glare position relative to mouse
    if (glare) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      setGlarePosition({ x: `${glareX}%`, y: `${glareY}%` });
    }
  };

  // Handle mouse enter/leave
  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setShadowOffset({ x: 0, y: 0 });
    setGlarePosition({ x: '50%', y: '50%' });
  };
  
  const boxShadowValue = shadow && isHovered
    ? `${shadowOffset.x}px ${shadowOffset.y}px 20px rgba(0, 0, 0, 0.2)`
    : 'none';

  return (
    <motion.div
      ref={cardRef}
      className={`hoverable-card ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'relative',
        borderRadius: 'inherit',
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        boxShadow: boxShadowValue,
        border: border ? `1px solid ${isHovered ? borderColor : 'transparent'}` : 'none',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
        willChange: 'transform, box-shadow'
      }}
    >
      {/* Glare effect */}
      {glare && isHovered && (
        <div
          className="glare-effect"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 'inherit',
            pointerEvents: 'none',
            background: `radial-gradient(circle at ${glarePosition.x} ${glarePosition.y}, rgba(255, 255, 255, 0.15), transparent 50%)`,
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
          zIndex: 1
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default HoverableCard;