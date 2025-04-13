import React from "react";

interface MountainLogoProps {
  className?: string;
  animate?: boolean;
}

/**
 * Mountain Logo SVG component
 */
export const MountainLogo: React.FC<MountainLogoProps> = ({ 
  className = "", 
  animate = true 
}) => {
  return (
    <svg
      className={`${className} ${animate ? 'neon-glow' : ''}`}
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M40 10L70 70H10L40 10Z"
        fill="url(#gradient)"
        stroke="rgba(255, 255, 255, 0.6)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M40 30L55 70H25L40 30Z"
        fill="url(#inner-gradient)"
        stroke="rgba(255, 255, 255, 0.8)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="40"
        cy="20"
        r="3"
        fill="white"
        className={animate ? "pulse" : ""}
      />
      <defs>
        <linearGradient id="gradient" x1="40" y1="10" x2="40" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5D3FD3" />
          <stop offset="1" stopColor="#2A6BFF" />
        </linearGradient>
        <linearGradient id="inner-gradient" x1="40" y1="30" x2="40" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#34D399" />
          <stop offset="1" stopColor="#2A6BFF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default MountainLogo;