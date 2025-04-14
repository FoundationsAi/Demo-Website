import React, { useEffect, useState, useRef } from "react";

interface VoiceWaveProps {
  isActive?: boolean;
  numBars?: number;
  className?: string;
  mode?: 'speaking' | 'listening' | 'inactive';
  audioIntensity?: number;
  analyzeAudio?: boolean;
  intensityThresholds?: {
    low: number;
    medium: number;
    high: number;
  };
}

/**
 * Enhanced Voice Visualization Component with dynamic animations
 */
export const VoiceWave: React.FC<VoiceWaveProps> = ({
  isActive = false,
  numBars = 18,
  className = "",
  mode = 'listening',
  audioIntensity = 0,
  intensityThresholds = { low: 0.2, medium: 0.5, high: 0.75 }
}) => {
  const [dots, setDots] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const animationRef = useRef<number>();
  
  // Initialize bar heights
  useEffect(() => {
    const initialHeights = Array.from({ length: numBars }).map(() => Math.floor(Math.random() * 6) + 4);
    setBarHeights(initialHeights);
  }, [numBars]);
  
  // Animate the bars based on mode
  useEffect(() => {
    if (!isActive) return;
    
    const updateHeights = () => {
      setBarHeights(prevHeights => {
        const centerPoint = Math.floor(numBars / 2);
        const maxDistance = Math.floor(numBars / 2);
        
        return prevHeights.map((_, i) => {
          // Calculate distance from center for bell curve effect
          const distanceFromCenter = Math.abs(i - centerPoint);
          const positionFactor = 1 - (distanceFromCenter / maxDistance) * 0.8;
          
          // Different animation patterns based on mode
          const baseHeight = mode === 'inactive' ? 4 : 6;
          let variance;
          
          if (mode === 'speaking') {
            // More pronounced for speaking
            variance = Math.random() * 20 + 4;
          } else if (mode === 'listening') {
            // Gentler for listening
            variance = Math.random() * 10 + 2;
          } else {
            // Minimal for inactive
            variance = Math.random() * 3;
          }
          
          // Calculate final height
          return Math.max(4, Math.floor(baseHeight + (variance * positionFactor)));
        });
      });
      
      animationRef.current = requestAnimationFrame(updateHeights);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(updateHeights);
    
    // Clean up
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, mode, numBars]);
  
  // Simple dots animation for status text
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4); // cycle 0,1,2,3
    }, 500);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  // For simple display, just use fixed colors based on mode that match the dark theme
  const getColor = () => {
    return mode === 'speaking' ? 'text-purple-300' : 'text-blue-300';
  };
  
  // Get dots string
  const getDotsString = () => '.'.repeat(dots);
  
  return (
    <div className={`text-center flex flex-col items-center justify-center ${className}`}>
      {/* Enhanced voice visualization with animated bars */}
      <div className="flex justify-center items-end h-12 space-x-[2px]">
        {barHeights.map((height, i) => {
          // Get gradient color classes based on height to create a more dynamic visualization
          const isCenter = i === Math.floor(numBars / 2) || i === Math.floor(numBars / 2) - 1 || i === Math.floor(numBars / 2) + 1;
          const colorClass = mode === 'speaking' 
            ? isCenter ? 'bg-gradient-to-b from-purple-300 to-purple-500' : 'bg-purple-400' 
            : isCenter ? 'bg-gradient-to-b from-blue-300 to-blue-500' : 'bg-blue-400';
          
          // Higher bars get glow effect
          const glowClass = height > 12 ? (mode === 'speaking' ? 'shadow-sm shadow-purple-500/50' : 'shadow-sm shadow-blue-500/50') : '';
          
          return (
            <div
              key={i}
              style={{ 
                height: `${height}px`,
                transition: 'height 150ms ease-in-out'
              }}
              className={`w-[2px] rounded-full ${colorClass} ${glowClass} opacity-90`}
            />
          );
        })}
      </div>
      
      {/* Listening/Speaking status text with enhanced styling */}
      <div className={`text-sm mt-3 tracking-wide font-medium ${
        mode === 'speaking' 
          ? 'bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-blue-300' 
          : 'bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-200'
      }`}>
        {mode === 'listening' 
          ? `Listening${getDotsString()}` 
          : mode === 'speaking' 
            ? `AI is speaking${getDotsString()}` 
            : ''}
      </div>
    </div>
  );
};

export default VoiceWave;