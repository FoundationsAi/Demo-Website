import React, { useEffect } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { CloudNarrativeSection } from "../components/sections/cloud-narrative-section";
import { MountainRevealSection } from "../components/sections/mountain-reveal-section";
import { TechnologyFoundationSection } from "../components/sections/technology-foundation-section";
import { AgentSelectionSection } from "../components/sections/agent-selection-section";
import { FeaturesSection } from "../components/sections/features-section";
import { CTASection } from "../components/sections/cta-section";

export const Home: React.FC = () => {
  // Set title and handle smooth scrolling to sections when URL contains a hash
  useEffect(() => {
    // Set title
    document.title = "Foundations AI - Voice Agents Demo";
    
    // Smooth scroll to hash
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    
    // Custom cursor effect for a more futuristic feel
    const createCustomCursor = () => {
      const cursor = document.createElement('div');
      cursor.classList.add('custom-cursor');
      cursor.innerHTML = `
        <div class="cursor-dot"></div>
        <div class="cursor-outline"></div>
      `;
      document.body.appendChild(cursor);
      
      const dot = cursor.querySelector('.cursor-dot') as HTMLElement;
      const outline = cursor.querySelector('.cursor-outline') as HTMLElement;
      
      let mouseX = 0;
      let mouseY = 0;
      let outlineX = 0;
      let outlineY = 0;
      
      const animate = () => {
        // Calculate smooth outline position
        outlineX += (mouseX - outlineX) * 0.15;
        outlineY += (mouseY - outlineY) * 0.15;
        
        // Apply positions
        if (dot) {
          dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        }
        if (outline) {
          outline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
        }
        
        requestAnimationFrame(animate);
      };
      
      document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });
      
      // Links and interactive elements cursor effect
      document.querySelectorAll('a, button, [role="button"]').forEach(el => {
        el.addEventListener('mouseenter', () => {
          cursor.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
          cursor.classList.remove('active');
        });
      });
      
      requestAnimationFrame(animate);
      
      // Add cursor styles
      const style = document.createElement('style');
      style.innerHTML = `
        body {
          cursor: none !important;
        }
        .custom-cursor {
          pointer-events: none;
          position: fixed;
          z-index: 9999;
          mix-blend-mode: difference;
        }
        .cursor-dot {
          position: absolute;
          top: -8px;
          left: -8px;
          width: 16px;
          height: 16px;
          background-color: white;
          border-radius: 50%;
          transform-origin: center;
          transition: transform 0.15s ease-out;
        }
        .cursor-outline {
          position: absolute;
          top: -24px;
          left: -24px;
          width: 48px;
          height: 48px;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-radius: 50%;
          transform-origin: center;
          transition: transform 0.3s ease-out;
        }
        .custom-cursor.active .cursor-dot {
          transform: translate(0, 0) scale(1.5);
        }
        .custom-cursor.active .cursor-outline {
          transform: translate(0, 0) scale(1.3);
          border-color: white;
        }
      `;
      document.head.appendChild(style);
    };
    
    // Only run on non-touch devices
    if (!('ontouchstart' in window)) {
      createCustomCursor();
    }
  }, []);

  return (
    <ReactLenis root options={{ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          {/* Narrative Journey - Start in the clouds */}
          <CloudNarrativeSection />
          
          {/* Transition to the mountain peaks */}
          <MountainRevealSection />
          
          {/* Foundation technology section */}
          <TechnologyFoundationSection />
          
          {/* Agent selection section */}
          <AgentSelectionSection />
          
          {/* Features showcase */}
          <FeaturesSection />
          
          {/* Call to action */}
          <CTASection />
        </main>
        <Footer />
      </div>
    </ReactLenis>
  );
};

export default Home;
