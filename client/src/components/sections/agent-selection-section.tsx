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
    <section id="agents" className="relative py-20 min-h-screen flex items-center" style={{ background: 'linear-gradient(to bottom, #8673D9, #6B93C3)' }}>
      {/* Floating particles in the background */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white opacity-30"
            style={{
              width: 5 + Math.random() * 10,
              height: 5 + Math.random() * 10,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              filter: 'blur(1px)'
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="section-container relative z-10 px-4 py-12 md:py-20">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl md:text-5xl font-bold text-blue-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            Choose Your AI Agent
          </motion.h2>
          <motion.p 
            className="text-blue-700 text-lg max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Select from our range of specialized voice AI agents, each with unique personalities and capabilities designed for specific business needs.
          </motion.p>
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
              className="bg-white/30 backdrop-blur-md border border-white/40 rounded-xl overflow-hidden hover:shadow-xl hover:shadow-white/20 transition-all duration-300 transform hover:-translate-y-1"
              variants={item}
            >
              <div className="h-2 bg-gradient-to-r from-blue-400 to-purple-400"></div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-lg font-bold text-white shadow-md">
                    AI
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-blue-800">{agent.name}</h3>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                      <span className="text-sm text-blue-700">{agent.badge}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-blue-700 mb-6">{agent.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {agent.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs rounded-full px-3 py-1 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Link href={`/chat/${agent.id}`}>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition-opacity">
                    Select Agent
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            className="bg-white/40 backdrop-blur-sm border border-white/50 text-blue-800 hover:bg-white/60 hover:text-blue-900 font-medium px-8 py-6 rounded-full transition-all duration-300 shadow-md"
          >
            View All Agents
          </Button>
        </div>
      </div>
    </section>
  );
};

export default AgentSelectionSection;
