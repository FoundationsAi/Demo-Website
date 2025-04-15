import React from "react";
import { Link, useLocation } from "wouter";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { MountainLogoCustom } from "@/components/mountain-logo-custom";
import { LogIn } from "lucide-react";

export const Header: React.FC = () => {
  const { scrolled } = useScroll();
  const [location] = useLocation();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/90 backdrop-blur-sm shadow-lg" : "bg-transparent"
      } border-b border-white/10`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <MountainLogoCustom className="w-12 h-8" />
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
          <Link href="/login">
            <Button variant="ghost" className="flex items-center gap-2 text-white hover:text-white/80">
              <LogIn size={18} />
              <span>Login</span>
            </Button>
          </Link>

          <Link href="/signup">
            <Button className="bg-[#5D5FEF] hover:bg-[#4B4DDC] text-white font-medium rounded-full px-8 py-5 h-auto">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
