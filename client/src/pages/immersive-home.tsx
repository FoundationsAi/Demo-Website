import React, { useEffect, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { SmoothScroll } from '@/components/smooth-scroll';
import { SpaceIntroSection } from '@/components/sections/space-intro-section';
import { CloudTransitionSection } from '@/components/sections/cloud-transition-section';
import { FullscreenMountainSection } from '@/components/sections/fullscreen-mountain-section';
import { TextOverlaySection, TextCard } from '@/components/sections/text-overlay-section';
import { LargeNumberSection, SideInfoCard } from '@/components/sections/large-number-section';
import { AgentSelectionSection } from '@/components/sections/agent-selection-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { ScrollReveal } from '@/components/scroll-reveal';
import { HoverableCard } from '@/components/hoverable-card';
import { AnimatedText } from '@/components/animated-text';

// Sample mountain images
// In a real implementation, these would be optimized and imported properly
const mountainBg1 = "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
const mountainBg2 = "https://images.unsplash.com/photo-1579802063117-308a7cb5d140?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
const mountainBg3 = "https://images.unsplash.com/photo-1455156218388-5e61b526818b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

export const ImmersiveHome: React.FC = () => {
  // Reference for scroll progress indicator
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Ensure black background throughout
  useEffect(() => {
    document.body.style.background = '#000';
    
    return () => {
      document.body.style.background = '';
    };
  }, []);
  
  // Set up smooth scrolling
  const { scrollYProgress } = useScroll({
    container: containerRef
  });
  
  // Scroll progress indicator
  useEffect(() => {
    const updateScrollProgress = () => {
      const progress = scrollYProgress.get();
      document.documentElement.style.setProperty('--scroll-progress', progress.toString());
    };
    
    const unsubscribe = scrollYProgress.on('change', updateScrollProgress);
    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <SmoothScroll options={{ lerp: 0.075 }}>
      <div 
        ref={containerRef}
        className="immersive-experience relative overflow-hidden bg-black"
      >
        {/* Progress indicator */}
        <motion.div
          className="fixed z-50 top-0 left-0 h-1 bg-blue-500"
          style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
        />
        
        {/* 1. Space intro section with stars */}
        <SpaceIntroSection />
        
        {/* 2. Cloud transition with animation */}
        <CloudTransitionSection />
        
        {/* 3. Mountain section - cinematic */}
        <FullscreenMountainSection
          title="A NEW FRONTIER"
          backgroundImage={mountainBg1}
          textPosition="center"
        >
          <AnimatedText
            text="VOICE AI"
            as="h1"
            animation="slide"
            className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-wider text-white mt-4"
            stagger={0.03}
          />
        </FullscreenMountainSection>
        
        {/* 4. Description section */}
        <TextOverlaySection
          backgroundColor="#061022"
          textColor="text-white"
          textPosition="center"
        >
          <div className="max-w-3xl mx-auto py-24 text-center">
            <AnimatedText
              text="WHERE TECHNOLOGY MEETS EMOTION"
              as="h2"
              animation="slide"
              className="text-2xl md:text-3xl font-light tracking-widest text-blue-200 mb-8"
            />
            
            <ScrollReveal animation="fadeInUp">
              <p className="text-xl md:text-2xl leading-relaxed mb-12">
                Our revolutionary approach to voice AI transcends mere functionality.
                We've created a system that understands context, emotion, and the 
                subtle nuances of human communication, delivering responses that 
                feel genuinely human.
              </p>
            </ScrollReveal>
          </div>
        </TextOverlaySection>
        
        {/* 5. Mountain with stat */}
        <LargeNumberSection
          number="11"
          backgroundColor="#0a1528"
          textPosition="right"
          title="DISTINCTIVE VOICES"
          description="Our system offers 11 distinct AI personalities, each with unique traits, speaking styles, and knowledge bases that adapt to different contexts and user preferences."
        />
        
        {/* 6. Interactive Agent selection with 11 Labs */}
        <AgentSelectionSection />
        
        {/* 7. Mountain transition to pricing */}
        <FullscreenMountainSection
          backgroundImage={mountainBg3}
          title="TRANSFORMING POSSIBILITIES"
          subtitle="Discover how our voice AI can elevate your business"
          textPosition="center"
          actionLabel="VIEW PRICING"
          actionLink="#pricing"
        />
        
        {/* 8. Pricing section */}
        <PricingSection />
        
        {/* 9. Footer/Contact */}
        <section className="bg-black py-16 text-white">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-1">
                  <h3 className="text-2xl font-bold mb-6">Foundations AI</h3>
                  <p className="text-blue-300 mb-4">
                    Pioneering the future of voice AI technology and human-computer interaction.
                  </p>
                  <div className="flex space-x-4 mt-6">
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                      </svg>
                    </a>
                    <a href="#" className="text-blue-400 hover:text-blue-300">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                      </svg>
                    </a>
                  </div>
                </div>
                
                <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="font-semibold text-white mb-4">Company</h4>
                    <ul className="space-y-2 text-blue-300">
                      <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-4">Resources</h4>
                    <ul className="space-y-2 text-blue-300">
                      <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-4">Legal</h4>
                    <ul className="space-y-2 text-blue-300">
                      <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                      <li><a href="#" className="hover:text-white transition-colors">Licenses</a></li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="mt-16 pt-8 border-t border-blue-900/30 text-center">
                <p className="text-blue-400 text-sm">
                  © {new Date().getFullYear()} Foundations AI. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </SmoothScroll>
  );
};

export default ImmersiveHome;