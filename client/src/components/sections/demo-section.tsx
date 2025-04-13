import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCases } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Clipboard, 
  Calendar, 
  Mail, 
  DollarSign, 
  LifeBuoy, 
  Phone,
  Check 
} from "lucide-react";

// Map use case icons
const useCaseIcons: Record<string, React.ReactNode> = {
  "clipboard": <Clipboard className="h-10 w-10 mb-3 text-secondary" />,
  "calendar": <Calendar className="h-10 w-10 mb-3 text-secondary" />,
  "mail": <Mail className="h-10 w-10 mb-3 text-secondary" />,
  "dollar-sign": <DollarSign className="h-10 w-10 mb-3 text-secondary" />,
  "life-buoy": <LifeBuoy className="h-10 w-10 mb-3 text-secondary" />,
  "phone": <Phone className="h-10 w-10 mb-3 text-secondary" />
};

export const DemoSection: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    email: "",
    agentType: "sales"
  });
  const [selectedUseCase, setSelectedUseCase] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleAgentTypeChange = (type: string) => {
    setFormData({ ...formData, agentType: type });
  };

  const handleUseCaseSelect = (id: string) => {
    setSelectedUseCase(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to proceed.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await apiRequest("POST", "/api/schedule-demo", {
        ...formData,
        useCase: selectedUseCase
      });
      
      toast({
        title: "Demo Scheduled",
        description: "You'll receive a call from our AI agent shortly!",
        variant: "default"
      });
      
      // Reset form
      setFormData({
        phone: "",
        name: "",
        email: "",
        agentType: "sales"
      });
      setSelectedUseCase("");
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem scheduling your demo. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="demo" className="relative py-20 bg-primary">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="section-title">Try Our Live Demo</h2>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Experience the power of our voice AI agents firsthand. Select a use case and receive a call from one of our agents.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Demo Form */}
          <motion.div 
            className="bg-[#1E1E1E]/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 md:p-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold mb-6">Receive a live call from our agent</h3>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-white/80 mb-2 text-sm" htmlFor="phone">Phone Number</label>
                <Input
                  type="tel"
                  id="phone"
                  placeholder="(123) 456-7890"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-[#2D2D2D] border border-white/10 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2 text-sm" htmlFor="name">Name</label>
                <Input
                  type="text"
                  id="name"
                  placeholder="John Smith"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-[#2D2D2D] border border-white/10 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2 text-sm" htmlFor="email">Email Address</label>
                <Input
                  type="email"
                  id="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-[#2D2D2D] border border-white/10 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-white/80 mb-2 text-sm">Select Agent Type</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { id: "sales", label: "Sales" },
                    { id: "receptionist", label: "Receptionist" },
                    { id: "support", label: "Support" }
                  ].map((agent) => (
                    <div key={agent.id} className="relative">
                      <input
                        type="radio"
                        id={agent.id}
                        name="agent"
                        className="absolute opacity-0"
                        checked={formData.agentType === agent.id}
                        onChange={() => handleAgentTypeChange(agent.id)}
                      />
                      <label
                        htmlFor={agent.id}
                        className={`flex flex-col items-center p-3 bg-[#2D2D2D] border ${
                          formData.agentType === agent.id ? "border-secondary" : "border-white/10"
                        } rounded-md cursor-pointer hover:bg-[#333333] transition-all`}
                      >
                        {agent.id === "sales" && <DollarSign className="h-6 w-6 mb-2 text-secondary" />}
                        {agent.id === "receptionist" && <Phone className="h-6 w-6 mb-2 text-secondary" />}
                        {agent.id === "support" && <LifeBuoy className="h-6 w-6 mb-2 text-secondary" />}
                        <span className="text-sm">{agent.label}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full gradient-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Get A Call"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
          
          {/* Use Cases */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 gap-4 content-start"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            {useCases.map((useCase) => (
              <div 
                key={useCase.id}
                className={`
                  bg-[#1E1E1E]/50 backdrop-blur-sm border 
                  ${selectedUseCase === useCase.id ? "border-secondary" : "border-white/10"}
                  rounded-xl p-5 flex flex-col items-center text-center 
                  hover:scale-105 hover:shadow-lg hover:shadow-secondary/5 transition-all 
                  duration-300 cursor-pointer
                `}
                onClick={() => handleUseCaseSelect(useCase.id)}
              >
                {useCaseIcons[useCase.icon]}
                <h4 className="text-base font-medium">{useCase.title}</h4>
                {selectedUseCase === useCase.id && (
                  <div className="absolute top-2 right-2 bg-secondary/20 text-secondary rounded-full p-1">
                    <Check size={12} />
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;
