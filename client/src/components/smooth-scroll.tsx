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
    duration: 1.0, // Reduced duration for faster response
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease out
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 1.3, // Reduced from 1.5
    wheelMultiplier: 0.8, // Better wheel control
    syncTouch: true, // Better touch sync
    lerp: 0.06, // Lower lerp value for better performance (0.1 -> 0.06)
    orientation: 'vertical' as const,
    gestureOrientation: 'vertical' as const,
    smoothWheel: true,
    wheelEventsTarget: window, // Use window for better wheel event capture
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
  
  // Memoize the callback functions to prevent unnecessary observer recreations
  const handleIntersect = React.useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry) => {
      const isIntersecting = entry.isIntersecting;
      
      // Only update state and call callbacks if the visibility changes
      if (isIntersecting !== isVisible) {
        if (isIntersecting) {
          setIsVisible(true);
          if (onEnter) onEnter();
        } else {
          setIsVisible(false);
          if (onExit) onExit();
        }
      }
    });
  }, [isVisible, onEnter, onExit]);
  
  // Use a ref for the observer to avoid recreating it unnecessarily
  const observerRef = React.useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    if (!ref) return;
    
    // Use passive: true for better performance
    const options = {
      threshold,
      rootMargin,
      passive: true
    };
    
    // Create observer only if needed
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(handleIntersect, options);
    }
    
    const currentObserver = observerRef.current;
    const currentRef = ref;
    
    currentObserver.observe(currentRef);
    
    return () => {
      if (currentRef && currentObserver) {
        currentObserver.unobserve(currentRef);
      }
    };
  }, [ref, handleIntersect, threshold, rootMargin, once]);
  
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