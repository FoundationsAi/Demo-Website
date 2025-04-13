import React, { useEffect, useRef } from "react";

interface VoiceWaveProps {
  isActive?: boolean;
  numBars?: number;
  className?: string;
  barClassName?: string;
}

/**
 * Voice Wave Animation Component
 */
export const VoiceWave: React.FC<VoiceWaveProps> = ({
  isActive = false,
  numBars = 30,
  className = "",
  barClassName = ""
}) => {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!isActive) return;
    
    // Create array of bars with refs
    barsRef.current = Array(numBars).fill(null);
    
    // Set up animation for each bar
    const animateBars = () => {
      barsRef.current.forEach((bar, index) => {
        if (!bar) return;
        
        // Random height calculation based on index (center bars are taller)
        const centerIndex = Math.floor(numBars / 2);
        const distanceFromCenter = Math.abs(index - centerIndex);
        const maxHeightFactor = 1 - (distanceFromCenter / centerIndex) * 0.6;
        
        // Calculate a random height with some constraints
        const minHeight = 15; // Minimum height percentage
        const randomFactor = Math.random() * 0.5 + 0.5; // Random factor between 0.5 and 1
        const height = minHeight + randomFactor * maxHeightFactor * (100 - minHeight);
        
        // Apply the calculated height with a transition
        bar.style.height = `${height}%`;
      });
    };
    
    // Animate on a timer to create the effect
    const intervalId = setInterval(animateBars, 100);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      barsRef.current.forEach(bar => {
        if (bar) bar.style.height = "10%";
      });
    };
  }, [isActive, numBars]);

  return (
    <div 
      className={`flex items-end justify-center gap-[2px] h-20 ${className}`}
      aria-label="Voice visualization"
      role="img"
    >
      {Array.from({ length: numBars }).map((_, index) => (
        <div
          key={index}
          ref={el => barsRef.current[index] = el}
          className={`w-[3px] rounded-full transition-all duration-100 ease-out ${
            isActive 
              ? 'bg-gradient-to-t from-secondary via-accent to-secondary/50' 
              : 'bg-white/30'
          } ${barClassName}`}
          style={{
            height: '10%',
            opacity: isActive ? 1 : 0.5
          }}
        />
      ))}
    </div>
  );
};

export default VoiceWave;