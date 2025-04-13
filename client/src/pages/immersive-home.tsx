import React, { useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import { SmoothScroll } from '@/components/smooth-scroll';
import { SpaceIntroSection } from '@/components/sections/space-intro-section';
import { FullscreenMountainSection } from '@/components/sections/fullscreen-mountain-section';
import { TextOverlaySection, TextCard } from '@/components/sections/text-overlay-section';
import { LargeNumberSection, SideInfoCard } from '@/components/sections/large-number-section';
import { ScrollReveal } from '@/components/scroll-reveal';
import { HoverableCard } from '@/components/hoverable-card';
import { AnimatedText } from '@/components/animated-text';

// Sample mountain images
// In a real implementation, these would be optimized and imported properly
const mountainBg1 = "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
const mountainBg2 = "https://images.unsplash.com/photo-1579802063117-308a7cb5d140?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
const mountainBg3 = "https://images.unsplash.com/photo-1455156218388-5e61b526818b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80";
const cloudsBg = "https://images.unsplash.com/photo-1536514498073-50e69d39c6cf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80";

export const ImmersiveHome: React.FC = () => {
  // Remove the cursor to mimic National Geographic style
  useEffect(() => {
    document.body.classList.add('cursor-default');
    
    return () => {
      document.body.classList.remove('cursor-default');
    };
  }, []);
  
  // Set up smooth scrolling
  const { scrollYProgress } = useScroll();
  
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
      <div className="immersive-experience min-h-screen overflow-hidden">
        {/* Stars and space intro section */}
        <SpaceIntroSection />
        
        {/* First Mountain Section */}
        <FullscreenMountainSection
          title="INTO THE"
          backgroundImage={cloudsBg}
          textPosition="center"
        >
          <AnimatedText
            text="FOUNDATIONS"
            as="h1"
            animation="slide"
            className="text-8xl md:text-9xl font-extrabold tracking-wider text-white mt-4"
            stagger={0.03}
          />
        </FullscreenMountainSection>
        
        {/* Mountain with text overlay */}
        <FullscreenMountainSection
          backgroundImage={mountainBg1}
          title=""
          textPosition="center"
        >
          <div className="relative mt-12">
            <AnimatedText
              text="REVOLUTIONARY AI"
              as="h2"
              animation="fade"
              className="text-6xl md:text-8xl font-extrabold tracking-widest text-white"
              stagger={0.04}
            />
          </div>
        </FullscreenMountainSection>
        
        {/* Text section explanation */}
        <TextOverlaySection
          backgroundColor="#0a0a0a"
          textColor="text-white"
          textPosition="center"
        >
          <div className="max-w-3xl mx-auto py-24 text-center">
            <AnimatedText
              text="VOICE AI REIMAGINED"
              as="h2"
              animation="slide"
              className="text-2xl md:text-3xl font-light tracking-widest text-blue-200 mb-8"
            />
            
            <ScrollReveal animation="fadeInUp">
              <p className="text-xl md:text-2xl leading-relaxed mb-12">
                A revolutionary approach to voice AI may seem like a dream.
                Yet it is in technologies like ours where the future of human-computer 
                interaction begins. This intricate system sustains a natural conversational 
                flow that feels truly human.
              </p>
            </ScrollReveal>
            
            <ScrollReveal animation="fadeInUp" delay={0.2}>
              <p className="text-xl md:text-2xl leading-relaxed">
                And what impacts our technology impacts the world.
              </p>
            </ScrollReveal>
          </div>
        </TextOverlaySection>
        
        {/* Mountain parallax section */}
        <FullscreenMountainSection
          backgroundImage={mountainBg2}
          title=""
          textPosition="right"
        >
          <SideInfoCard title="INTELLIGENT RESPONSE">
            <p>
              Our AI analyzes context, emotion, and subtleties in human communication, 
              producing natural, contextually-appropriate responses that feel human.
            </p>
          </SideInfoCard>
        </FullscreenMountainSection>
        
        {/* Large number section */}
        <LargeNumberSection
          number="11"
          backgroundColor="#0f1924"
          textPosition="right"
          title="DISTINCTIVE VOICES"
          description="Our system offers 11 distinct AI personalities, each with unique traits, speaking styles, and knowledge bases that adapt to different contexts and user preferences."
        />
        
        {/* Mountain with CTA */}
        <FullscreenMountainSection
          backgroundImage={mountainBg3}
          title="WHERE THE FUTURE BEGINS"
          subtitle="Experience the voice technology that will shape the future of human-computer interaction"
          textPosition="center"
          actionLabel="BEGIN YOUR JOURNEY"
          actionLink="#"
        />
        
        {/* Footer/Contact */}
        <TextOverlaySection
          backgroundColor="#0a0a0a"
          textColor="text-white"
          textPosition="center"
          fullHeight={false}
        >
          <div className="py-12 text-center">
            <AnimatedText
              text="FOUNDATIONS AI"
              as="h2"
              animation="fade"
              className="text-3xl md:text-4xl font-bold tracking-wider text-blue-300 mb-8"
            />
            
            <ScrollReveal animation="fadeInUp">
              <p className="text-lg md:text-xl leading-relaxed mb-8">
                Join us as we redefine the boundaries of AI voice technology.
              </p>
              
              <div className="mt-8">
                <button className="px-8 py-3 bg-blue-700 text-white font-medium rounded-sm">
                  Contact Us
                </button>
              </div>
            </ScrollReveal>
          </div>
        </TextOverlaySection>
      </div>
    </SmoothScroll>
  );
};

export default ImmersiveHome;