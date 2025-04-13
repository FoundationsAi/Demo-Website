import React, { useEffect, useState } from 'react';
import { ReactLenis, useLenis } from '@studio-freight/react-lenis';

interface SmoothScrollProps {
  children: React.ReactNode;
  options?: {
    duration?: number;
    easing?: (t: number) => number;
    smooth?: boolean;
    smoothTouch?: boolean;
    touchMultiplier?: number;
    direction?: 'vertical' | 'horizontal';
    gestureDirection?: 'vertical' | 'horizontal' | 'both';
    infinite?: boolean;
    orientation?: 'vertical' | 'horizontal';
    wrapper?: HTMLElement | Window;
    content?: HTMLElement;
    wheelEventsTarget?: HTMLElement | Window;
    smoothWheel?: boolean;
    syncTouch?: boolean;
    syncTouchLerp?: number;
    touchInertiaMultiplier?: number;
    wheelMultiplier?: number;
    lerp?: number;
  };
}

// Export a hook to access the Lenis instance from anywhere
export const useSmoothScroll = () => {
  const lenis = useLenis();
  
  return {
    lenis,
    scrollTo: (target: string | number | HTMLElement, options?: {
      offset?: number;
      immediate?: boolean;
      duration?: number;
      easing?: (t: number) => number;
      lock?: boolean;
      force?: boolean;
    }) => {
      if (lenis) {
        lenis.scrollTo(target, options);
      }
    },
    stop: () => lenis?.stop(),
    start: () => lenis?.start()
  };
};

export const SmoothScroll: React.FC<SmoothScrollProps> = ({ children, options }) => {
  const [mounted, setMounted] = useState(false);
  
  // Only enable on client side
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    // Return children without smooth scrolling on server or before mount
    return <>{children}</>;
  }
  
  const defaultOptions = {
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease out
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 1.5,
    lerp: 0.1
  };
  
  return (
    <ReactLenis root options={{ ...defaultOptions, ...options }}>
      {children}
    </ReactLenis>
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