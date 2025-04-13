import React from "react";

interface MountainLogoProps {
  className?: string;
  animate?: boolean;
}

/**
 * Mountain Logo SVG component
 */
export const MountainLogo: React.FC<MountainLogoProps> = ({ 
  className = "w-10 h-10", 
  animate = false 
}) => {
  return (
    <div className={`${className} ${animate ? "animate-float" : ""}`}>
      <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M22 21H2L9 7L13 14L15 11L22 21Z"
          stroke="url(#gradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient
            id="gradient"
            x1="2"
            y1="21"
            x2="22"
            y2="7"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#34D399" />
            <stop offset="1" stopColor="#2A6BFF" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default MountainLogo;
