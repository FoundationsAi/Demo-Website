import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import SplitType from 'split-type';

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

/**
 * Animated Text component that adds attractive motion effects to typography
 */
export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  as: Component = "p",
  className = "",
  animation = "slide",
  delay = 0,
  duration = 0.5,
  stagger = 0.02,
  once = true,
  color
}) => {
  const controls = useAnimation();
  const textRef = useRef<HTMLDivElement>(null);
  const inView = useInView(textRef, { amount: 0.3, once });
  const [splitText, setSplitText] = React.useState<SplitType | null>(null);

  // Define animation variants based on the animation type
  const getVariants = () => {
    switch (animation) {
      case "slide":
        return {
          hidden: { y: "100%", opacity: 0 },
          visible: (i: number) => ({
            y: "0%",
            opacity: 1,
            transition: {
              delay: delay + (i * stagger),
              duration,
              ease: [0.22, 1, 0.36, 1]
            }
          })
        };
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: (i: number) => ({
            opacity: 1,
            transition: {
              delay: delay + (i * stagger),
              duration,
              ease: "easeOut"
            }
          })
        };
      case "glitch":
        return {
          hidden: { opacity: 0, x: 0 },
          visible: (i: number) => ({
            opacity: 1,
            x: [0, -5, 5, -3, 3, 0],
            transition: {
              delay: delay + (i * stagger),
              duration: duration * 1.5,
              x: {
                times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                duration: duration,
                ease: "easeInOut"
              }
            }
          })
        };
      case "gradient":
        // Gradient effect relies on CSS rather than motion animations
        return {
          hidden: { opacity: 0 },
          visible: (i: number) => ({
            opacity: 1,
            transition: {
              delay: delay + (i * stagger),
              duration
            }
          })
        };
      case "wave":
        return {
          hidden: { y: 0, opacity: 0 },
          visible: (i: number) => ({
            y: [0, -15, 0],
            opacity: 1,
            transition: {
              delay: delay + (i * stagger),
              y: {
                duration: duration * 1.2,
                repeat: 0,
                ease: "easeInOut"
              },
              opacity: {
                duration: duration * 0.3,
                ease: "easeIn"
              }
            }
          })
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
    }
  };

  // Initialize the SplitType instance
  useEffect(() => {
    if (textRef.current && !splitText) {
      const split = new SplitType(textRef.current, { types: "chars", wordClass: "word" });
      setSplitText(split);
    }

    return () => {
      if (splitText) {
        splitText.revert();
      }
    };
  }, [textRef, text]);

  // Control the animation based on view
  useEffect(() => {
    if (inView && splitText) {
      controls.start("visible");
    } else if (!once && !inView && splitText) {
      controls.start("hidden");
    }
  }, [controls, inView, once, splitText]);

  // Additional class for gradient effect
  const gradientClass = animation === "gradient" ? "animated-gradient-text" : "";

  return (
    <Component
      className={`animated-text-container overflow-hidden relative break-words hyphens-auto ${className} ${gradientClass}`}
      style={{ color: color }}
    >
      {/* Original text for SEO (hidden visually) */}
      <span className="sr-only">{text}</span>

      {/* Animated text */}
      <div ref={textRef} aria-hidden="true" className="animated-text">
        {text}
      </div>

      {/* Animated characters will be created by SplitType and animated by Framer Motion */}
      {splitText && splitText.chars && (
        <div className="absolute inset-0" aria-hidden="true">
          {splitText.chars.map((char, index) => (
            <motion.span
              key={index}
              className="animated-char inline-block"
              custom={index}
              initial="hidden"
              animate={controls}
              variants={getVariants()}
              style={{
                display: 'inline-block',
                width: char.clientWidth,
                height: char.clientHeight,
                position: 'absolute',
                left: char.offsetLeft,
                top: char.offsetTop,
              }}
            >
              {char.textContent}
            </motion.span>
          ))}
        </div>
      )}
    </Component>
  );
};

export default AnimatedText;