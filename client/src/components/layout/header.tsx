import React from "react";
import { Link, useLocation } from "wouter";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

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
                src="/images/mountain-logo.png" 
                alt="Foundations AI Logo" 
                className="w-12 h-10 object-contain" 
              />
              <div className="ml-2 flex flex-col">
                <span className="text-xl font-bold text-[#6366F1]">
                  Foundations
                </span>
                <span className="text-xl font-bold text-[#6366F1]">
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
            className="bg-[#5D5FEF] hover:bg-[#4B4DDC] text-white font-medium rounded-full px-8 py-5 h-auto"
            onClick={() => handleNavigate("/signup")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
