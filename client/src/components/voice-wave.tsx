import React, { useEffect, useState } from "react";

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
 * Simple Voice Visualization Component that matches client's design
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
  
  // Simple dots animation for "Listening..." text
  useEffect(() => {
    if (!isActive) return;
    
    const interval = setInterval(() => {
      setDots(prev => (prev + 1) % 4); // cycle 0,1,2,3
    }, 500);
    
    return () => clearInterval(interval);
  }, [isActive]);
  
  // For simple display, just use fixed colors based on mode
  const getColor = () => {
    return mode === 'speaking' ? 'text-purple-500' : 'text-blue-500';
  };
  
  // Get dots string
  const getDotsString = () => '.'.repeat(dots);
  
  return (
    <div className={`text-center flex flex-col items-center justify-center ${className}`}>
      {/* Simple dotted line visualization as shown in client screenshot */}
      <div className="flex justify-center my-2">
        {Array.from({ length: numBars }).map((_, i) => (
          <div
            key={i}
            className={`mx-[1px] rounded-full ${getColor()} opacity-80 h-1 w-1`}
          />
        ))}
      </div>
      
      {/* Listening/Speaking status text */}
      <div className={`text-sm mt-2 tracking-wide ${getColor()}`}>
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