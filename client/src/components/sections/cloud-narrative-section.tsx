import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { AnimatedText } from "../animated-text";
import { useParallax } from "@/hooks/use-scroll";

export const CloudNarrativeSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [windowHeight, setWindowHeight] = useState(0);
  
  // Parallax speeds for different cloud layers
  const parallaxFar = useParallax(0.1);
  const parallaxMid = useParallax(0.25);
  const parallaxClose = useParallax(0.4);
  
  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  // Smoother progress
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  // Transform values based on scroll
  const opacity = useTransform(smoothProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const textOpacity1 = useTransform(smoothProgress, [0.1, 0.2, 0.3, 0.4], [0, 1, 1, 0]);
  const textOpacity2 = useTransform(smoothProgress, [0.3, 0.4, 0.5, 0.6], [0, 1, 1, 0]);
  const textOpacity3 = useTransform(smoothProgress, [0.5, 0.6, 0.7, 0.8], [0, 1, 1, 0]);
  
  const y1 = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const y2 = useTransform(smoothProgress, [0, 1], ["0%", "70%"]);
  const y3 = useTransform(smoothProgress, [0, 1], ["0%", "40%"]);
  
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [1, 1.2, 1.5]);
  const rotate = useTransform(smoothProgress, [0, 0.5, 1], [0, 5, 0]);
  
  // Cloud-like filter blur
  const blur = useTransform(smoothProgress, [0, 0.5, 1], [0, 8, 16]);
  
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[300vh] overflow-hidden"
      style={{ perspective: "1000px" }}
    >
      <motion.div 
        className="sticky top-0 h-screen w-full overflow-hidden"
        style={{ opacity }}
      >
        {/* Heavenly, airy cloud background */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-sky-200 to-blue-300" />
        
        {/* Far cloud layer */}
        <motion.div 
          className="absolute inset-0"
          style={{ 
            y: parallaxFar as any,
            filter: `blur(${16}px)`,
          }}
        >
          <CloudGroup 
            count={15} 
            scale={0.6} 
            opacity={0.4} 
            speed={0.2} 
            areaHeight={windowHeight} 
          />
        </motion.div>
        
        {/* Middle cloud layer */}
        <motion.div 
          className="absolute inset-0"
          style={{ 
            y: parallaxMid as any,
            filter: `blur(${8}px)`,
          }}
        >
          <CloudGroup 
            count={10} 
            scale={0.8} 
            opacity={0.6} 
            speed={0.5} 
            areaHeight={windowHeight} 
          />
        </motion.div>
        
        {/* Close cloud layer - sharp and detailed */}
        <motion.div 
          className="absolute inset-0"
          style={{ 
            y: parallaxClose as any,
            filter: "blur(0px)",
          }}
        >
          <CloudGroup 
            count={6} 
            scale={1.2} 
            opacity={0.9} 
            speed={1} 
            areaHeight={windowHeight} 
          />
        </motion.div>
        
        {/* Mysterious glowing orb - represents AI */}
        <motion.div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(162,210,255,0.5) 50%, rgba(129,161,255,0) 100%)",
            boxShadow: "0 0 60px 30px rgba(255,255,255,0.6), 0 0 100px 60px rgba(62,149,255,0.4), 0 0 140px 90px rgba(76,92,255,0.2)",
            scale,
            rotate,
          }}
        />
        
        {/* Narrative text elements */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 text-center">
          <motion.div 
            className="mb-64 max-w-3xl"
            style={{ opacity: textOpacity1, y: y1 }}
          >
            <h2 className="text-3xl md:text-6xl font-bold text-blue-800 drop-shadow-lg mb-6">
              <AnimatedText 
                text="Beyond the Digital Frontier" 
                as="span" 
                animation="gradient"
                className="font-bold"
              />
            </h2>
            <p className="text-xl md:text-2xl text-blue-700 drop-shadow-md">
              Where human imagination and artificial intelligence converge to create a new reality
            </p>
          </motion.div>
          
          <motion.div 
            className="absolute max-w-3xl"
            style={{ opacity: textOpacity2, y: y2 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-blue-800 drop-shadow-lg mb-6">
              <AnimatedText 
                text="Voice of the Future" 
                as="span" 
                animation="glitch"
                className="font-bold"
              />
            </h2>
            <p className="text-xl md:text-2xl text-blue-700 drop-shadow-md">
              Our AI agents communicate with unprecedented natural fluency, understanding context and emotion
            </p>
          </motion.div>
          
          <motion.div 
            className="absolute max-w-3xl"
            style={{ opacity: textOpacity3, y: y3 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-blue-800 drop-shadow-lg mb-6">
              <AnimatedText 
                text="Descend to the Peaks of Innovation" 
                as="span" 
                animation="fade"
                className="font-bold"
              />
            </h2>
            <p className="text-xl md:text-2xl text-blue-700 drop-shadow-md">
              Continue your journey to discover the revolutionary foundation of our technology
            </p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

// Cloud component for individual cloud shapes
interface CloudProps {
  scale: number;
  opacity: number;
  x: number;
  y: number;
  speed: number;
}

const Cloud: React.FC<CloudProps> = ({ scale, opacity, x, y, speed }) => {
  const [offset, setOffset] = useState(0);
  
  useEffect(() => {
    let animFrame: number;
    let startTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      // Gentle wave movement
      setOffset(Math.sin(elapsed * 0.001 * speed) * 20);
      animFrame = requestAnimationFrame(animate);
    };
    
    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [speed]);
  
  return (
    <div 
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        opacity,
        transform: `scale(${scale}) translate(${offset}px, 0)`,
        width: '200px',
        height: '100px',
      }}
    >
      <div className="cloud-body">
        <div className="cloud w-full h-full bg-white rounded-full blur-lg" />
        <div className="cloud-puff absolute -top-10 left-10 w-20 h-20 bg-white rounded-full blur-lg" />
        <div className="cloud-puff absolute -top-12 left-24 w-24 h-24 bg-white rounded-full blur-lg" />
        <div className="cloud-puff absolute -top-8 left-40 w-20 h-20 bg-white rounded-full blur-lg" />
        <div className="cloud-puff absolute -top-10 left-56 w-16 h-16 bg-white rounded-full blur-lg" />
      </div>
    </div>
  );
};

// Create groups of clouds
interface CloudGroupProps {
  count: number;
  scale: number;
  opacity: number;
  speed: number;
  areaHeight: number;
}

const CloudGroup: React.FC<CloudGroupProps> = ({ count, scale, opacity, speed, areaHeight }) => {
  // Generate random but consistent cloud positions
  const clouds = React.useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: (i / count) * 100, // Distribute vertically
      scale: scale * (0.8 + Math.random() * 0.4), // Slight scale variations
      opacity: opacity * (0.8 + Math.random() * 0.4), // Slight opacity variations
      speed: speed * (0.8 + Math.random() * 0.4), // Varied animation speeds
    }));
  }, [count, scale, opacity, speed, areaHeight]);
  
  return (
    <div className="h-full w-full">
      {clouds.map((cloud) => (
        <Cloud 
          key={cloud.id} 
          x={cloud.x} 
          y={cloud.y} 
          scale={cloud.scale} 
          opacity={cloud.opacity} 
          speed={cloud.speed} 
        />
      ))}
    </div>
  );
};

export default CloudNarrativeSection;