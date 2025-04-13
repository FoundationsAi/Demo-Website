import React from "react";
import { cn } from "@/lib/utils";

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
  isActive = true,
  numBars = 20,
  className,
  barClassName,
}) => {
  // Create an array of random heights if active, otherwise all bars are small
  const barHeights = Array.from({ length: numBars }).map((_, i) => {
    if (isActive) {
      // Create a variation pattern for the animation
      const baseHeight = 4 + Math.sin(i * 0.5) * 6; // Base height between 1 and 8
      return Math.max(4, Math.min(16, baseHeight));
    }
    return 2; // Small height when inactive
  });

  return (
    <div className={cn("flex items-end gap-1 h-16 my-6", className)}>
      {barHeights.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1.5 bg-gradient-to-t from-secondary to-accent rounded-full",
            isActive ? "animate-wave" : "",
            barClassName
          )}
          style={{
            height: `${height * 4}px`,
            animationDelay: isActive ? `calc(0.1s * ${index + 1})` : "0s",
          }}
        />
      ))}
    </div>
  );
};

export default VoiceWave;
