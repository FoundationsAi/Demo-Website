import React from "react";
import { motion } from "framer-motion";
import { features, integrations } from "@/lib/utils";
import {
  Calendar,
  CreditCard,
  ExternalLink,
  Mic,
  MessageSquare,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Map feature icons to Lucide components
const featureIcons: Record<string, React.ReactNode> = {
  "microphone": <Mic className="h-6 w-6 text-white" />,
  "users": <Users className="h-6 w-6 text-white" />,
  "message-square": <MessageSquare className="h-6 w-6 text-white" />,
  "calendar": <Calendar className="h-6 w-6 text-white" />,
  "credit-card": <CreditCard className="h-6 w-6 text-white" />,
  "external-link": <ExternalLink className="h-6 w-6 text-white" />
};

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

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative py-20 bg-gradient-to-b from-primary to-[#2D1B4E]">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="section-title">Powerful Voice AI Features</h2>
          <p className="text-white/70 text-lg">
            Our AI agents combine cutting-edge voice technology with seamless integration capabilities.
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.id}
              className="feature-card"
              variants={item}
            >
              <div className="feature-icon">
                {featureIcons[feature.icon]}
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-white/70 mb-4">{feature.description}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-white/60">{feature.badge}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Integration Section */}
        <motion.div 
          className="mt-24 bg-[#1E1E1E]/30 backdrop-blur-sm border border-white/10 rounded-xl p-8 md:p-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Seamlessly Integrate With Your Tech Stack</h3>
            <p className="text-white/70 max-w-2xl mx-auto">
              Connect with your existing CRM, telephony, and automation platforms with native and external integrations.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
            {integrations.map((integration, index) => (
              <motion.div 
                key={index}
                className="bg-[#2D2D2D] p-4 rounded-lg w-28 h-16 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <span className="text-white/80 font-medium">{integration.name}</span>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Button variant="outline" className="outline-button">
              See All Integrations
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
