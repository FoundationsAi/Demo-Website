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
 * Hook for parallax scrolling effect
 */
export function useParallax(speed: number = 0.2) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setOffset(window.scrollY * speed);
    };

    window.addEventListener("scroll", handleScroll);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [speed]);

  return { offset };
}
