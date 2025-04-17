import React from 'react';

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  zIndex?: number;
}

/**
 * SectionWrapper - A utility component that ensures sections connect seamlessly with no gaps
 * This wrapper applies consistent margins and styling to eliminate unwanted spaces between sections
 */
export const SectionWrapper: React.FC<SectionWrapperProps> = ({ 
  children,
  id,
  className = '',
  zIndex = 0
}) => {
  return (
    <div 
      id={id}
      className={`relative section-wrapper ${className}`}
      style={{ 
        margin: 0,
        padding: 0,
        backgroundColor: '#000', // Maintain black background throughout
        position: 'relative',
        zIndex: zIndex
      }}
    >
      {children}
    </div>
  );
};

export default SectionWrapper;