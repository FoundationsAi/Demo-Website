import React, { useEffect, useRef } from 'react';
import { Link } from 'wouter';
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

export const Home: React.FC = () => {
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
        
        {/* Header with Login/Register buttons */}
        <div className="fixed top-0 right-0 z-50 p-4 flex gap-3">
          <Link href="/login">
            <a className="px-4 py-2 text-sm bg-transparent border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-900/30 transition-colors">
              Login
            </a>
          </Link>
          <Link href="/register">
            <a className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Get Started
            </a>
          </Link>
        </div>
        
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
              <ScrollReveal>
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight gradient-text">
                  <AnimatedText
                    text="Technology Meets Emotion"
                    animation="gradient"
                    delay={0.2}
                    stagger={0.05}
                  />
                </h2>
                <p className="text-lg sm:text-xl md:text-2xl text-blue-200 max-w-2xl mx-auto leading-relaxed">
                  Our AI voice agents create natural, empathetic conversations indistinguishable from human interaction
                </p>
              </ScrollReveal>
            </div>
          </FullscreenMountainSection>
        </div>
        
        {/* Agent Selection Section with enhanced UI and transition */}
        <SectionWrapper
          id="agent-selection"
          className="relative z-10 py-20 md:py-32 bg-gradient-to-b from-black to-blue-950"
        >
          <AgentSelectionSection />
        </SectionWrapper>
        
        {/* Pricing Section with enhanced UI */}
        <SectionWrapper
          id="pricing"
          className="relative z-10 py-20 md:py-32 bg-gradient-to-b from-blue-950 to-black"
        >
          <PricingSection />
        </SectionWrapper>
        
        {/* Footer Section */}
        <SectionWrapper
          id="footer"
          className="relative z-10 pt-16 pb-8 bg-black"
        >
          <section className="container">
            <div className="mx-auto max-w-7xl px-4">
              <div className="text-white">
                <div className="grid md:grid-cols-4 gap-10">
                  <div className="md:col-span-2">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2">Foundations AI</h3>
                      <p className="text-blue-300 max-w-md">
                        Transforming business communication with AI voice agents that deliver natural, empathetic conversations.
                      </p>
                    </div>
                    
                    <div className="flex space-x-4 mb-8">
                      <a href="#" className="text-blue-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
                        </svg>
                      </a>
                      <a href="#" className="text-blue-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                      <a href="#" className="text-blue-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                        </svg>
                      </a>
                      <a href="#" className="text-blue-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
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
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                    <Link href="/login">
                      <a className="px-6 py-2 text-sm bg-transparent border border-blue-500 text-blue-400 rounded-lg hover:bg-blue-900/30 transition-colors">
                        Login
                      </a>
                    </Link>
                    <Link href="/register">
                      <a className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Get Started
                      </a>
                    </Link>
                  </div>
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

export default Home;