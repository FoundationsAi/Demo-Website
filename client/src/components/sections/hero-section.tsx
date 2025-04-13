import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceWave } from "@/components/voice-wave";
import { Mic, Send } from "lucide-react";
import { useParallax } from "@/hooks/use-scroll";

export const HeroSection: React.FC = () => {
  const [message, setMessage] = useState("");
  const { offset } = useParallax(0.15);

  // Example conversation
  const conversations = [
    {
      sender: "AI",
      message: "Hello! I'm Emma, your AI sales assistant. How can I help you today?"
    },
    {
      sender: "You",
      message: "Hi Emma! I'm interested in your voice AI solutions."
    },
    {
      sender: "AI",
      message: "Great! Our voice AI solutions offer natural conversations with customers. Would you like to know about specific use cases or pricing?"
    }
  ];

  return (
    <section className="relative min-h-screen pt-20 overflow-hidden" id="hero">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-primary"></div>
        <motion.div 
          className="absolute top-20 right-10 w-72 h-72 bg-secondary/20 rounded-full filter blur-3xl"
          animate={{ 
            y: [0, 20, 0],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          style={{ y: -offset / 2 }}
        />
        <motion.div 
          className="absolute bottom-10 left-10 w-80 h-80 bg-accent/10 rounded-full filter blur-3xl"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          style={{ y: offset / 2 }}
        />
      </div>

      <div className="relative container mx-auto px-4 py-20 md:py-32 flex flex-col md:flex-row items-center">
        <motion.div 
          className="md:w-1/2 md:pr-8 mb-10 md:mb-0 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Experience the Future of{" "}
            <span className="gradient-text">Voice AI</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-lg">
            Our state-of-the-art voice agents deliver natural, engaging conversations for your business needs. Seamlessly integrate with your existing tech stack.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="#agents">
              <Button className="gradient-button">
                Start Talking Now
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" className="outline-button">
                View Demo
              </Button>
            </Link>
          </div>
          
          {/* Metrics */}
          <div className="flex flex-wrap gap-8 mt-12">
            <div>
              <div className="text-3xl font-bold text-accent">99.9%</div>
              <div className="text-white/60 text-sm">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">500ms</div>
              <div className="text-white/60 text-sm">Response Latency</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">18+</div>
              <div className="text-white/60 text-sm">Languages</div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="md:w-1/2 relative z-10"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          {/* Voice Chat Interface */}
          <div className="bg-[#1E1E1E]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="flex items-center mb-6 gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-secondary/90 to-secondary flex items-center justify-center">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold">Sales Agent Emma</div>
                <div className="text-white/60 text-sm">Active and listening</div>
              </div>
            </div>
            
            {/* Conversation Simulation */}
            <div className="space-y-4 mb-6">
              {conversations.map((convo, index) => (
                <div 
                  key={index}
                  className={`flex items-start gap-3 ${
                    convo.sender === "You" ? "justify-end" : ""
                  }`}
                >
                  {convo.sender !== "You" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                      AI
                    </div>
                  )}
                  <div 
                    className={`${
                      convo.sender === "You" 
                        ? "bg-secondary/20 rounded-lg rounded-tr-none" 
                        : "bg-[#2D2D2D] rounded-lg rounded-tl-none"
                    } px-4 py-3 text-white/90 max-w-[80%]`}
                  >
                    {convo.message}
                  </div>
                  {convo.sender === "You" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-medium">
                      You
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Voice Wave Visualization */}
            <VoiceWave />
            
            {/* Input Area */}
            <div className="flex gap-2">
              <Button 
                className="bg-secondary hover:bg-secondary/90 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 transition-all p-0"
                aria-label="Start voice input"
              >
                <Mic size={20} />
              </Button>
              <div className="relative flex-grow">
                <Input 
                  type="text"
                  placeholder="Type your message..."
                  className="w-full bg-[#2D2D2D] border border-white/10 rounded-full py-2 px-4 pr-10"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button 
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent hover:bg-transparent text-white/80 hover:text-white p-1 h-auto"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Client Logos */}
      <div className="relative container mx-auto px-4 py-12 mb-12">
        <p className="text-center text-white/60 mb-8">Trusted by innovative companies</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="opacity-60 hover:opacity-100 transition-opacity">
              <div className="h-8 w-28 bg-white/10 rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
