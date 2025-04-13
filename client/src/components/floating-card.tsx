import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

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

export const FloatingCard: React.FC<FloatingCardProps> = ({
  children,
  className = "",
  intensity = 15,
  border = true,
  borderColor = "rgba(255, 255, 255, 0.1)",
  glare = true,
  shadow = true,
  rotation = true,
  duration = 0.2,
}) => {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });
  const [mouseIn, setMouseIn] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle mouse movement for card tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || !rotation) return;

    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to card
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (invert x-axis)
    const rotX = ((y - rect.height / 2) / (rect.height / 2)) * intensity;
    const rotY = ((x - rect.width / 2) / (rect.width / 2)) * -intensity;
    
    // Set the rotation values
    setRotateX(rotX);
    setRotateY(rotY);
    
    // Update glare position
    if (glare) {
      setGlarePosition({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
      });
    }
  };

  const handleMouseEnter = () => {
    setMouseIn(true);
  };

  const handleMouseLeave = () => {
    setMouseIn(false);
    setRotateX(0);
    setRotateY(0);
    if (glare) {
      setGlarePosition({ x: 0, y: 0 });
    }
  };

  // Generate glare gradient based on mouse position
  const glareGradient = glare
    ? `radial-gradient(
        circle at ${glarePosition.x}% ${glarePosition.y}%, 
        rgba(255, 255, 255, ${mouseIn ? 0.15 : 0}),
        transparent 80%
      )`
    : "none";

  // Generate shadow value based on rotation
  const shadowValue = shadow && mouseIn
    ? `${-rotateY / 3}px ${rotateX / 3}px 10px rgba(0, 0, 0, 0.5),
       0 5px 15px rgba(0, 0, 0, 0.3)`
    : shadow
      ? "0 5px 15px rgba(0, 0, 0, 0.2)"
      : "none";

  return (
    <motion.div
      ref={cardRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        transformStyle: "preserve-3d",
        boxShadow: shadowValue,
        border: border ? `1px solid ${borderColor}` : "none",
      }}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        mass: 1,
        duration,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {/* Glare effect */}
      {glare && (
        <motion.div
          className="absolute inset-0 z-10 pointer-events-none"
          animate={{
            background: glareGradient,
          }}
          transition={{
            duration: 0.1,
          }}
        />
      )}
    </motion.div>
  );
};

export default FloatingCard;