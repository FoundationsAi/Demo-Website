import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export const CTASection: React.FC = () => {
  return (
    <section className="relative py-16 bg-gradient-to-r from-primary to-[#2D1B4E] overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full opacity-10">
        {/* Mountain pattern in background */}
        <svg viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <path
            d="M0,192L60,202.7C120,213,240,235,360,234.7C480,235,600,213,720,192C840,171,960,149,1080,160C1200,171,1320,213,1380,234.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            fill="url(#cta-gradient)"
          />
          <defs>
            <linearGradient
              id="cta-gradient"
              x1="0"
              y1="320"
              x2="1440"
              y2="320"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#34D399" />
              <stop offset="1" stopColor="#2A6BFF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Customer Experience?</h2>
          <p className="text-white/80 text-lg mb-10">
            Deploy voice AI agents that deliver consistent, high-quality interactions 24/7. Start with a demo today.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/get-started">
              <Button className="gradient-button">
                Join Foundations AI
              </Button>
            </Link>
            <Link href="#demo">
              <Button variant="outline" className="outline-button">
                Schedule Demo
              </Button>
            </Link>
          </div>
          
          <div className="mt-8 flex justify-center items-center">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-primary bg-white/20 flex items-center justify-center overflow-hidden"
                >
                  <span className="text-xs text-white/80">U{i}</span>
                </div>
              ))}
            </div>
            <div className="ml-3 text-sm text-white/70">
              Trusted by 2,500+ businesses worldwide
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
