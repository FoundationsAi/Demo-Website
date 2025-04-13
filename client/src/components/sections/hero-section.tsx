import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Mic } from "lucide-react";
import { Link } from "wouter";

import { AnimatedText } from "../animated-text";
import { FloatingCard } from "../floating-card";
import { MountainLogo } from "../mountain-logo";
import { ParticleBackground } from "../particle-background";
import { VoiceWave } from "../voice-wave";

export const HeroSection: React.FC = () => {
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const toggleVoice = () => {
    setIsVoiceActive(!isVoiceActive);
    // In a real application, this would trigger voice recognition
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Interactive particle background */}
      <ParticleBackground variant="hero" />
      
      {/* Futuristic grid overlay */}
      <div className="absolute inset-0 grid-background opacity-20" />
      
      <div className="section-container relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          {/* Logo with glow effect */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <MountainLogo className="w-24 h-24 md:w-32 md:h-32" />
          </motion.div>
          
          {/* Main title with gradient animation */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4">
            <AnimatedText 
              text="Foundations AI" 
              animation="gradient" 
              as="span" 
              className="block mb-2"
            />
            <AnimatedText 
              text="Voice Agents Demo" 
              animation="slide" 
              delay={0.5} 
              className="block" 
            />
          </h1>
          
          {/* Subtitle with shimmer effect */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="shimmer-text text-xl md:text-2xl max-w-xl mx-auto mb-8 font-light"
          >
            Experience the future of conversational AI with our revolutionary voice agents
          </motion.p>
          
          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-8">
            <Link href="/agent-select">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="gradient-button flex items-center"
              >
                Try It Now <ArrowRight className="ml-2 h-5 w-5" />
              </motion.a>
            </Link>
            
            <button 
              onClick={toggleVoice}
              className="outline-button flex items-center"
            >
              <Mic className={`mr-2 h-5 w-5 ${isVoiceActive ? 'text-accent' : 'text-white'}`} />
              Speak to Demo
            </button>
          </div>
          
          {/* Voice wave animation component */}
          <div className="mt-12">
            <VoiceWave 
              isActive={isVoiceActive}
              numBars={40}
              className="mx-auto"
            />
          </div>
        </div>
        
        {/* Floating feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 + index * 0.2 }}
            >
              <FloatingCard className="glass-card p-6 rounded-xl h-full">
                <div className="feature-icon rounded-full">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/70">{feature.description}</p>
              </FloatingCard>
            </motion.div>
          ))}
        </div>
        
        {/* Scroll indicator */}
        <motion.div 
          className="flex justify-center mt-16"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "loop" }}
        >
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex justify-center pt-2">
            <div className="w-1 h-2 bg-white rounded-full" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// Sample feature data
const features = [
  {
    title: "Natural Conversations",
    description: "Our AI agents understand context and respond naturally to create fluid conversations.",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  {
    title: "Voice Recognition",
    description: "Speak naturally and our AI understands your voice with impressive accuracy.",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    )
  },
  {
    title: "Personalized Agents",
    description: "Choose from a variety of AI personalities tailored to different needs and preferences.",
    icon: (props: React.SVGProps<SVGSVGElement>) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }
];

export default HeroSection;