import React, { useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { AgentSelectionSection } from "@/components/sections/agent-selection-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { DemoSection } from "@/components/sections/demo-section";
import { CTASection } from "@/components/sections/cta-section";

export const Home: React.FC = () => {
  // Handle smooth scrolling to sections when URL contains a hash
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <FeaturesSection />
        <AgentSelectionSection />
        <HowItWorksSection />
        <DemoSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
