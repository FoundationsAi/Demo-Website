import React, { useEffect } from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import { Header } from "../components/layout/header";
import { Footer } from "../components/layout/footer";
import { HeroSection } from "../components/sections/hero-section";

export const Home: React.FC = () => {
  // Set title and handle smooth scrolling to sections when URL contains a hash
  useEffect(() => {
    // Set title
    document.title = "Foundations AI - Voice Agents Demo";
    
    // Smooth scroll to hash
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      const element = document.getElementById(id);
      
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  return (
    <ReactLenis root options={{ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) }}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <HeroSection />
          {/* More sections will be added in future updates */}
        </main>
        <Footer />
      </div>
    </ReactLenis>
  );
};

export default Home;
