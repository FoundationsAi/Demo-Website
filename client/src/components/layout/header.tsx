import React from "react";
import { Link, useLocation } from "wouter";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import logoImage from "../../assets/foundations-ai-logo.png";

export const Header: React.FC = () => {
  const { scrolled } = useScroll();
  const [location, setLocation] = useLocation();
  
  const handleNavigate = (path: string) => {
    console.log("Navigating to:", path);
    setLocation(path);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm shadow-lg border-b border-white/10"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <img 
                src={logoImage} 
                alt="Foundations AI Logo" 
                className="w-14 h-12 object-contain" 
              />
              <div className="ml-2 flex flex-col">
                <span className="text-xl font-bold text-[#4F9BFF]">
                  Foundations
                </span>
                <span className="text-xl font-bold text-[#4F9BFF]">
                  AI
                </span>
              </div>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-white hover:text-white/80"
            onClick={() => handleNavigate("/login")}
          >
            <LogIn size={18} />
            <span>Login</span>
          </Button>

          <Button 
            className="bg-[#4F9BFF] hover:bg-[#3E7DD5] text-white font-medium rounded-full px-8 py-5 h-auto"
            onClick={() => {
              // Scroll to pricing section if on homepage
              if (window.location.pathname === '/') {
                const pricingSection = document.getElementById('pricing-section');
                if (pricingSection) {
                  pricingSection.scrollIntoView({ behavior: 'smooth' });
                  return;
                }
              }
              // Otherwise navigate to homepage with pricing anchor
              window.location.href = '/#pricing-section';
            }}
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
