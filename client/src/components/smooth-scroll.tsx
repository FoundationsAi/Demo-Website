import React, { useEffect, useState, useMemo } from 'react';

interface SmoothScrollProps {
  children: React.ReactNode;
  options?: {
    duration?: number;
    easing?: (t: number) => number;
    smooth?: boolean;
    smoothTouch?: boolean;
    touchMultiplier?: number;
    lerp?: number;
  };
}

// Simplified scroll helper function (non-hook implementation)
// Fixed to avoid Fast Refresh incompatibility
const createSmoothScroller = () => {
  return {
    scrollTo: (target: string | number | HTMLElement, options?: any) => {
      if (typeof target === 'string') {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: 'smooth' });
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    },
    stop: () => {},
    start: () => {}
  };
};

// Create a singleton instance for consistent reference
const smoothScrollerInstance = createSmoothScroller();

// Export a simple function that returns the singleton instance
// This approach avoids Fast Refresh compatibility issues
export const useSmoothScroll = () => {
  return smoothScrollerInstance;
};

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children, options }) => {
  const [mounted, setMounted] = useState(false);

  // Only enable on client side
  useEffect(() => {
    setMounted(true);

    // Make background black to prevent white flashes between sections
    document.body.style.background = '#000';
    document.documentElement.style.background = '#000';

    // Ensure all sections flow seamlessly together and optimize performance
    const style = document.createElement('style');
    style.innerHTML = `
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        height: 100% !important;
        overflow-x: hidden !important;
        background-color: #000 !important;
      }

      section {
        margin: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        margin-top: -2px !important;
        margin-bottom: -2px !important;
        position: relative;
        z-index: 1;
      }

      /* Fix for full-page sections to eliminate any gaps */
      .section-wrapper {
        margin: 0 !important;
        padding: 0 !important;
        margin-top: -2px !important;
        margin-bottom: -2px !important;
        position: relative;
        overflow: hidden;
        background-color: #000;
      }

      /* Optimize for better performance - apply hardware acceleration only where needed */
      .parallax-element, .animated-element, .motion-div {
        will-change: transform, opacity;
        transform: translateZ(0);
        backface-visibility: hidden;
      }

      /* Optimize images and heavy elements */
      img, video, canvas, iframe {
        will-change: transform;
        backface-visibility: hidden;
        filter: translateZ(0);
      }

      /* Ensure mouse cursor remains visible */
      * {
        cursor: auto !important;
      }

      /* Prevent scrollbar jumps */
      html {
        scrollbar-gutter: stable;
        overflow-x: hidden;
      }

      /* Better touch scrolling for mobile */
      body {
        -webkit-overflow-scrolling: touch;
        overflow-x: hidden;
      }

      /* Reduce animation workload */
      @media (prefers-reduced-motion: reduce) {
        *, ::before, ::after {
          animation-duration: 0.01s !important;
          transition-duration: 0.01s !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.body.style.background = '';
      document.documentElement.style.background = '';
      document.head.removeChild(style);
    };
  }, []);

  if (!mounted) {
    // Return children without smooth scrolling on server or before mount
    return <>{children}</>;
  }

  // Simple smooth scrolling for better performance
  return (
    <div className="smooth-scroll relative" style={{position: 'relative', height: '100vh'}}> {children} </div>
  );
};

// Scroll trigger component that performs actions when scrolled into view
interface ScrollTriggerProps {
  children: React.ReactNode;
  onEnter?: () => void;
  onExit?: () => void;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  className?: string;
  id?: string;
}

export const ScrollTrigger: React.FC<ScrollTriggerProps> = ({
  children,
  onEnter,
  onExit,
  threshold = 0.15, // Increased threshold for better performance
  rootMargin = "10px", // Added margin for earlier triggering
  once = true, // Default to once for better performance
  className = "",
  id
}) => {
  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (onEnter) onEnter();
            if (once) observer.unobserve(ref);
          } else {
            setIsVisible(false);
            if (onExit) onExit();
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(ref);

    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [ref, onEnter, onExit, threshold, rootMargin, once]);

  return (
    <div 
      ref={setRef} 
      className={`scroll-trigger ${isVisible ? 'is-visible' : ''} ${className}`}
      id={id}
      style={{ position: 'relative' }} // Added for proper positioning
    >
      {children}
    </div>
  );
};

export default SmoothScroll;