import { useEffect, useState } from "react";

type UseScrollOptions = {
  threshold?: number;
};

/**
 * Hook for detecting scroll position
 */
export function useScroll({ threshold = 50 }: UseScrollOptions = {}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > threshold) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return { scrolled };
}

/**
 * Hook for parallax scrolling effect with mobile optimization
 */
export function useParallax(speed: number = 0.2) {
  const [offset, setOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device for reduced parallax effect
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    const handleScroll = () => {
      // Use reduced speed for mobile devices to prevent jarring effects
      const effectiveSpeed = isMobile ? speed * 0.5 : speed;
      setOffset(window.scrollY * effectiveSpeed);
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkMobile);
    };
  }, [speed, isMobile]);

  return { offset, isMobile };
}
