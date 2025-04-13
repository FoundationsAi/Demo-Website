import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { MountainLogo } from "@/components/mountain-logo";
import { scrollToSection } from "@/lib/utils";
import { Menu, X } from "lucide-react";

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
  const [location] = useLocation();
  const isHomePage = location === "/";

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
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <MountainLogo animate />
              <span className="text-xl font-bold gradient-text ml-3">
                Foundations AI
              </span>
            </div>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <span
                className="text-white/80 hover:text-white transition cursor-pointer"
                onClick={(e) => handleNavClick(e, item)}
              >
                {item.name}
              </span>
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
          <Button className="gradient-button hidden md:flex">
            Get Started
          </Button>
          
          <button 
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-primary/95 backdrop-blur-sm">
          <div className="flex flex-col space-y-4 py-4 px-6">
            {navItems.map((item) => (
              <Link key={item.name} href={item.href}>
                <span
                  className="text-white/80 hover:text-white transition py-2 block cursor-pointer"
                  onClick={(e) => handleNavClick(e, item)}
                >
                  {item.name}
                </span>
              </Link>
            ))}
            <Button className="gradient-button mt-2 w-full">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
