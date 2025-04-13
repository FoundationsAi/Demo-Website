import React from "react";
import { motion } from "framer-motion";
import { howItWorksSteps } from "@/lib/utils";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7 } }
};

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="relative py-20 bg-gradient-to-b from-[#2D1B4E] to-primary">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="section-title">How It Works</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Building and deploying voice AI agents has never been easier with our simple four-step process.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {howItWorksSteps.map((step, index) => (
            <motion.div 
              key={index}
              className="bg-[#1E1E1E]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 relative"
              variants={item}
            >
              <div className="absolute -top-5 -left-5 w-12 h-12 rounded-full bg-primary border-4 border-secondary flex items-center justify-center text-xl font-bold">
                {step.step}
              </div>
              <h3 className="text-xl font-semibold mt-6 mb-4">{step.title}</h3>
              <p className="text-white/70 mb-5">{step.description}</p>
              
              <div className="w-full h-36 bg-[#2D2D2D]/50 rounded-lg flex items-center justify-center overflow-hidden">
                <svg
                  className="w-16 h-16 text-secondary/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                  <path stroke="currentColor" strokeWidth="2" d="M16.5 7.5v0" />
                </svg>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
