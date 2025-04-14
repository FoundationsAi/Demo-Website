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
      className={`relative ${className}`}
      style={{ 
        margin: 0,
        padding: 0,
        marginTop: '-1px', // Eliminate gap with previous section
        marginBottom: '-1px', // Eliminate gap with next section
        backgroundColor: '#000' // Maintain black background throughout
      }}
    >
      {children}
    </div>
  );
};

export default SectionWrapper;