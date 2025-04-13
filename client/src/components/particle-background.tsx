import React, { useEffect, useRef } from "react";

interface ParticleBackgroundProps {
  className?: string;
  variant?: "hero" | "subtle" | "intense";
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ 
  className = "",
  variant = "hero" 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    
    // Initial resize
    resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Particle configuration based on variant
    const config = {
      particleCount: variant === 'hero' ? 80 : variant === 'intense' ? 120 : 40,
      particleSizeMin: variant === 'hero' ? 1 : variant === 'intense' ? 2 : 0.5,
      particleSizeMax: variant === 'hero' ? 3 : variant === 'intense' ? 5 : 1.5,
      connectionDistance: variant === 'hero' ? 150 : variant === 'intense' ? 180 : 100,
      speed: variant === 'hero' ? 0.3 : variant === 'intense' ? 0.5 : 0.2,
      colors: variant === 'hero' 
        ? ['#5D3FD3', '#34D399', '#2A6BFF', '#FFFFFF'] 
        : variant === 'intense'
          ? ['#FF4D4D', '#FFFC4D', '#34D399', '#2A6BFF']
          : ['#5D3FD3', '#FFFFFF']
    };
    
    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < config.particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: (Math.random() - 0.5) * config.speed,
        dy: (Math.random() - 0.5) * config.speed,
        size: config.particleSizeMin + Math.random() * (config.particleSizeMax - config.particleSizeMin),
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        opacity: 0.1 + Math.random() * 0.5,
      });
    }
    
    // Track mouse position for interaction
    let mouseX = 0;
    let mouseY = 0;
    let mouseActive = false;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseActive = true;
    };
    
    const handleMouseLeave = () => {
      mouseActive = false;
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    // Animation function
    const animate = () => {
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Update position
        p.x += p.dx;
        p.y += p.dy;
        
        // Boundary check
        if (p.x < 0 || p.x > canvas.width) p.dx = -p.dx;
        if (p.y < 0 || p.y > canvas.height) p.dy = -p.dy;
        
        // Mouse interaction (if mouse is active)
        if (mouseActive) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            // Push particles away from mouse
            const force = (100 - distance) / 500;
            p.dx -= dx * force;
            p.dy -= dy * force;
          }
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color; // Base color
        ctx.globalAlpha = p.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      
      // Draw connections between particles
      ctx.strokeStyle = variant === 'intense' ? '#FFFFFF' : '#5D3FD3';
      ctx.lineWidth = 0.2;
      ctx.globalAlpha = 0.15;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < config.connectionDistance) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      
      ctx.globalAlpha = 1;
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [variant]);
  
  return (
    <div className={`absolute inset-0 z-0 ${className}`}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        aria-hidden="true"
      />
    </div>
  );
};

// Type definition for particles
interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  size: number;
  color: string;
  opacity: number;
}

export default ParticleBackground;