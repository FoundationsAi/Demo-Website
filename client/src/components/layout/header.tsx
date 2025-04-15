import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { MountainLogo } from "@/components/mountain-logo";
import { scrollToSection } from "@/lib/utils";
import { LogIn, Menu, X } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  isSection?: boolean;
}

const navItems: NavItem[] = [
  { name: "Features", href: "#features", isSection: true },
  { name: "Agents", href: "#agents", isSection: true },
  { name: "How It Works", href: "#how-it-works", isSection: true },
  { name: "Demo", href: "#demo", isSection: true },
];

export const Header: React.FC = () => {
  const { scrolled } = useScroll();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location, navigate] = useLocation();
  const isHomePage = location === "/";
  
  // Function to handle navigation programmatically
  const handleDirectNavigation = (to: string, e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Navigating programmatically to:', to);
    navigate(to);
  };

  // Handle navigation click for both anchor and span elements
  const handleNavClick = (e: React.MouseEvent<HTMLElement>, item: NavItem) => {
    if (item.isSection && isHomePage) {
      e.preventDefault();
      scrollToSection(item.href.substring(1));
      setIsMenuOpen(false);
    } else if (!isHomePage) {
      setIsMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-primary/90 backdrop-blur-sm shadow-lg" : "bg-transparent"
      } border-b border-white/10`}
    >
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-end">
        <div className="flex items-center gap-4">
          <Link href="/login" className="flex">
            <Button variant="ghost" className="text-white hover:text-blue-200 hover:bg-blue-900/20">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </Link>
          
          <Link href="/get-started" className="flex">
            <Button className="gradient-button">
              Get Started
            </Button>
          </Link>
          
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu - with animation and improved accessibility */}
      <div 
        className={`md:hidden bg-primary/95 backdrop-blur-sm absolute w-full transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-[400px] border-b border-white/10 shadow-lg' : 'max-h-0'
        }`}
        aria-hidden={!isMenuOpen}
        aria-expanded={isMenuOpen}
        role="navigation"
      >
        <div className="flex flex-col space-y-3 py-4 px-6">
          <Link href="/login">
            <span
              className="text-white/90 hover:text-white transition-all py-2 flex items-center cursor-pointer font-medium"
              role="menuitem"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </span>
          </Link>
          
          <Link href="/get-started">
            <Button className="gradient-button mt-2 w-full py-2">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
