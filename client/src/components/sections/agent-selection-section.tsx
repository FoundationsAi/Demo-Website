import React from "react";
import { motion } from "framer-motion";
import { agents } from "@/lib/utils";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const AgentSelectionSection: React.FC = () => {
  return (
    <section id="agents" className="relative py-20 bg-[#2D1B4E]">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="section-title">Choose Your AI Agent</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Select from our range of specialized voice AI agents, each with unique personalities and capabilities designed for specific business needs.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {agents.map((agent) => (
            <motion.div 
              key={agent.id}
              className="bg-[#1E1E1E]/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300"
              variants={item}
            >
              <div className="h-2 bg-gradient-to-r from-secondary to-accent"></div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center text-lg font-bold">
                    AI
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{agent.name}</h3>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                      <span className="text-sm text-white/60">{agent.badge}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-white/70 mb-6">{agent.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {agent.tags.map((tag, index) => (
                    <span key={index} className="bg-secondary/20 text-secondary/90 text-xs rounded-full px-3 py-1">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Link href={`/chat/${agent.id}`}>
                  <Button className="w-full gradient-button">
                    Select Agent
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-12 text-center">
          <Button variant="outline" className="outline-button">
            View All Agents
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AgentSelectionSection;
