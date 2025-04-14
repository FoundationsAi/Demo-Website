import React, { useEffect, useState } from 'react';

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

// Simplified hook for better performance
export const useSmoothScroll = () => {
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

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children, options }) => {
  const [mounted, setMounted] = useState(false);
  
  // Only enable on client side
  useEffect(() => {
    setMounted(true);
    
    // Make background black to prevent white flashes between sections
    document.body.style.background = '#000';
    document.documentElement.style.background = '#000';
    
    // Ensure all sections flow seamlessly together
    const style = document.createElement('style');
    style.innerHTML = `
      section {
        margin: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
      }
      
      /* Optimize for better performance */
      .parallax-element, .animated-element {
        will-change: transform;
        transform: translateZ(0);
      }
      
      /* Optimize images and heavy elements */
      img, video, canvas, iframe {
        will-change: transform;
      }
      
      /* Ensure mouse cursor remains visible */
      * {
        cursor: auto !important;
      }
      
      /* Prevent scrollbar jumps */
      html {
        scrollbar-gutter: stable;
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
  return <>{children}</>;
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
  threshold = 0.1,
  rootMargin = "0px",
  once = false,
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
    >
      {children}
    </div>
  );
};

export default SmoothScroll;