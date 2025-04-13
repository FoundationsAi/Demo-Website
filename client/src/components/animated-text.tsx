import React, { useLayoutEffect, useRef } from "react";
import SplitType from "split-type";
import { gsap } from "gsap";

interface AnimatedTextProps {
  text: string;
  as?: React.ElementType;
  className?: string;
  animation?: "slide" | "fade" | "glitch" | "gradient" | "wave";
  delay?: number;
  duration?: number;
  stagger?: number;
  once?: boolean;
  color?: string;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  as: Component = "div",
  className = "",
  animation = "slide",
  delay = 0,
  duration = 0.5,
  stagger = 0.02,
  once = true,
  color,
}) => {
  const textRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useLayoutEffect(() => {
    if (once && hasAnimated.current) return;

    if (!textRef.current) return;

    // Create empty timeline
    const tl = gsap.timeline();

    // Split text into chars, words, or lines
    const splitLevel = animation === "wave" ? "chars" : "words";
    const splitText = new SplitType(textRef.current, { types: [splitLevel] });
    
    const chars = splitText.chars;
    const words = splitText.words;
    const elements = animation === "wave" ? chars : words;

    if (!elements) return;

    // Reset visibility
    gsap.set(elements, { autoAlpha: 1 });

    switch (animation) {
      case "slide": 
        // Initial state
        gsap.set(elements, { 
          y: "100%", 
          opacity: 0 
        });
        
        // Animate each word/char with stagger
        tl.to(elements, {
          y: "0%",
          opacity: 1,
          duration,
          stagger,
          ease: "power3.out",
          delay
        });
        break;
        
      case "fade":
        // Initial state
        gsap.set(elements, { 
          opacity: 0,
          scale: 0.9
        });
        
        // Fade in with slight scale up
        tl.to(elements, {
          opacity: 1,
          scale: 1,
          duration,
          stagger,
          ease: "power2.out",
          delay
        });
        break;
        
      case "glitch":
        // Initial state
        gsap.set(elements, { 
          opacity: 0,
          x: "random(-20, 20)",
          y: "random(-20, 20)",
          rotation: "random(-10, 10)",
          scale: "random(0.8, 1.2)"
        });
        
        // Glitch effect
        tl.to(elements, {
          opacity: 1,
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: duration * 1.5,
          stagger: stagger / 2,
          ease: "elastic.out(1, 0.3)",
          delay
        });
        break;
        
      case "gradient":
        // For gradient, we don't use SplitType
        // Instead we animate the background position
        gsap.fromTo(textRef.current, 
          { 
            backgroundPosition: "0% 50%",
            backgroundSize: "200% 200%",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            background: "linear-gradient(90deg, #5D3FD3, #FF4D4D, #34D399, #2A6BFF)",
          },
          {
            backgroundPosition: "100% 50%",
            duration: duration * 6,
            ease: "none",
            repeat: -1,
            yoyo: true,
            delay
          }
        );
        break;
        
      case "wave":
        if (!chars) return;
        
        // Create a wave animation effect
        gsap.set(chars, { opacity: 0.3, y: 0 });
        
        // Animate each character in a wave pattern
        tl.to(chars, {
          opacity: 1,
          y: -15,
          stagger: {
            each: 0.05,
            repeat: -1,
            yoyo: true,
            from: "start"
          },
          duration: 0.6,
          ease: "sine.inOut",
          delay
        });
        break;
    }

    hasAnimated.current = true;

    // Clean up
    return () => {
      tl.kill();
      if (splitText) {
        splitText.revert();
      }
    };
  }, [text, animation, delay, duration, stagger, once, color]);

  const textStyle: React.CSSProperties = {};
  
  // If it's not gradient animation and color is provided, apply it
  if (animation !== "gradient" && color) {
    textStyle.color = color;
  }

  return (
    <Component ref={textRef} className={className} style={textStyle}>
      {text}
    </Component>
  );
};

export default AnimatedText;