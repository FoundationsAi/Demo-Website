import React from 'react';

interface SectionWrapperProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

/**
 * SectionWrapper - A utility component that ensures sections connect seamlessly with no gaps
 * This wrapper applies consistent margins and styling to eliminate unwanted spaces between sections
 */
export const SectionWrapper: React.FC<SectionWrapperProps> = ({ 
  children,
  id,
  className = ''
}) => {
  return (
    <div 
      id={id}
      className={`relative section-wrapper ${className}`}
      style={{ 
        margin: 0,
        padding: 0,
        paddingTop: '4vh', // Add vertical spacing between sections
        paddingBottom: '4vh', // Add vertical spacing between sections
        backgroundColor: '#000', // Maintain black background throughout
        position: 'relative',
        zIndex: 0
      }}
    >
      {children}
    </div>
  );
};

export default SectionWrapper;