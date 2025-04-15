import React, { useEffect, useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { SmoothScroll } from '@/components/smooth-scroll';
import { SectionWrapper } from '@/components/section-wrapper';
import { SpaceIntroSection } from '@/components/sections/space-intro-section';
import { FullscreenMountainSection } from '@/components/sections/fullscreen-mountain-section';
import { MountainTextOverlaySection } from '@/components/sections/mountain-text-overlay-section';
import { AgentSelectionSection } from '@/components/sections/agent-selection-section';
import { PricingSection } from '@/components/sections/pricing-section';
import { ScrollReveal } from '@/components/scroll-reveal';
import { AnimatedText } from '@/components/animated-text';

// Sample mountain images
// In a real implementation, these would be optimized and imported properly
const mountainBg1 = "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
const mountainBg2 = "https://images.unsplash.com/photo-1579802063117-308a7cb5d140?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
const mountainBg3 = "https://images.unsplash.com/photo-1455156218388-5e61b526818b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";

export const ImmersiveHome = () => {
  // Reference for scroll progress indicator
  const containerRef = useRef<HTMLDivElement>(null);
  const mountainSectionRef = useRef<HTMLDivElement>(null);
  
  // Ensure black background throughout
  useEffect(() => {
    document.body.style.background = '#000';
    
    return () => {
      document.body.style.background = '';
    };
  }, []);
  
  // Set up smooth scrolling
  const { scrollYProgress } = useScroll({
    target: containerRef, // Changed from container to target
    offset: ["start end", "end start"]
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
        style={{ position: 'relative' }} // Added explicit positioning for scroll animations
      >
        {/* Progress indicator */}
        <motion.div
          className="fixed z-50 top-0 left-0 h-1 bg-blue-500"
          style={{ scaleX: scrollYProgress, transformOrigin: "0%" }}
        />
        
        {/* Fixed text overlay that appears during mountain section */}
        <MountainTextOverlaySection />
        
        {/* Space and Mountain sections with seamless transition */}
        <div className="relative">
          <SpaceIntroSection />
        </div>
        
        {/* Mountain section directly connected to space section - no gaps */}
        <div 
          ref={mountainSectionRef} 
          className="relative" 
          style={{ 
            marginTop: '-2px',
            borderTop: 'none',
            zIndex: 10
          }}
        >
          <FullscreenMountainSection
            title="" // Empty title is required by the component props
            backgroundImage={mountainBg1}
            textPosition="center"
          >
            {/* Technology meets emotion content now in the mountain section */}
            <div className="max-w-4xl mx-auto text-center relative">
              {/* Background visual effects */}
              <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-blue-600/30 blur-3xl"></div>
                <div className="absolute bottom-20 right-1/4 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl"></div>
                <div className="absolute top-40 right-10 w-32 h-32 rounded-full bg-purple-600/30 blur-2xl"></div>
              </div>
              
              <div className="relative z-10">
                <div className="mb-10 md:mb-12 animate-fade-in-down">
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-widest text-white drop-shadow-[0_0_25px_rgba(100,200,255,0.8)] whitespace-nowrap sm:whitespace-normal animate-pulse">
                    WHERE TECHNOLOGY MEETS
                  </h2>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-widest text-white drop-shadow-[0_0_25px_rgba(100,200,255,0.8)] animate-pulse">
                    EMOTION
                  </h2>
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/15 to-indigo-900/15 backdrop-blur-lg p-8 md:p-10 rounded-xl border border-blue-500/30 shadow-[0_4px_30px_rgba(0,100,255,0.3)]">
                  <ScrollReveal animation="fadeInUp">
                    <p className="text-xl md:text-2xl leading-relaxed mb-8 text-white">
                      Our revolutionary approach to voice AI transcends mere functionality.
                      We've created a system that understands context, emotion, and the 
                      subtle nuances of human communication, delivering responses that 
                      feel genuinely human.
                    </p>
                    
                    <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-4 lg:gap-6 mt-10">
                      <div 
                        className="w-full sm:w-64 md:w-60 lg:w-72 bg-blue-900/25 p-6 lg:p-8 rounded-lg border border-blue-400/30 backdrop-blur-md shadow-[0_0_25px_rgba(59,130,246,0.2)] hover:shadow-[0_0_35px_rgba(59,130,246,0.3)] transition-all duration-300 hover:scale-[1.03]"
                      >
                        <div className="flex justify-center">
                          <div 
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/40 to-blue-600/40 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(59,130,246,0.4)] animate-pulse"
                          >
                            <div className="text-blue-200 text-2xl">🧠</div>
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-blue-100 mb-3 text-center">Contextual Understanding</h3>
                        <p className="text-blue-200 text-center leading-relaxed">Breaks language barriers by looking beyond simple words</p>
                      </div>
                      
                      <div 
                        className="w-full sm:w-64 md:w-60 lg:w-72 bg-purple-900/25 p-6 lg:p-8 rounded-lg border border-purple-400/30 backdrop-blur-md shadow-[0_0_25px_rgba(147,51,234,0.2)] hover:shadow-[0_0_35px_rgba(147,51,234,0.3)] transition-all duration-300 hover:scale-[1.03]"
                      >
                        <div className="flex justify-center">
                          <div 
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-600/40 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(147,51,234,0.4)] animate-pulse"
                          >
                            <div className="text-purple-200 text-2xl">💫</div>
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-purple-100 mb-3 text-center">Emotional Intelligence</h3>
                        <p className="text-purple-200 text-center leading-relaxed">Perceives and responds to emotional nuances naturally</p>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </div>
          </FullscreenMountainSection>
        </div>
        
        {/* 3. Interactive Agent selection with 11 Labs */}
        <SectionWrapper>
          <AgentSelectionSection />
        </SectionWrapper>
        
        {/* 4. Pricing section */}
        <SectionWrapper>
          <PricingSection />
        </SectionWrapper>
        
        {/* 5. Footer/Contact */}
        <SectionWrapper>
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
        </SectionWrapper>
      </div>
    </SmoothScroll>
  );
};

export default ImmersiveHome;