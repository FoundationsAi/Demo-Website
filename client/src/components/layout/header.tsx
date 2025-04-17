import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@clerk/clerk-react";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { MountainLogo } from "@/components/mountain-logo";
import { scrollToSection } from "@/lib/utils";
import { LogIn, Menu, X, User } from "lucide-react";
import { UserProfileButton } from "@/components/auth/auth-components";

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
  
  // Check if Clerk is loaded based on environment variable
  const clerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // Only use Clerk hooks if enabled, otherwise provide default values
  const { isSignedIn = false, isLoaded = true } = clerkEnabled ? useUser() : {};
  
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
      <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex-1">
          {/* Logo or brand could go here */}
        </div>
        <div className="flex items-center gap-4">
          {isLoaded && isSignedIn ? (
            <React.Fragment>
              <Button 
                variant="ghost" 
                className="text-white hover:text-blue-200 hover:bg-blue-900/20"
                onClick={() => navigate('/account')}
              >
                <User className="mr-2 h-4 w-4" />
                My Account
              </Button>
              
              <UserProfileButton />
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Button 
                variant="ghost" 
                className="text-white hover:text-blue-200 hover:bg-blue-900/20"
                onClick={() => navigate('/login')}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
              
              <Button 
                className="gradient-button"
                onClick={() => navigate('/get-started')}
              >
                Get Started
              </Button>
            </React.Fragment>
          )}
          
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
          {isLoaded && isSignedIn ? (
            <>
              <span
                className="text-white/90 hover:text-white transition-all py-2 flex items-center cursor-pointer font-medium"
                role="menuitem"
                onClick={() => {
                  navigate('/account');
                  setIsMenuOpen(false);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                My Account
              </span>
              
              <span
                className="text-white/90 hover:text-white transition-all py-2 flex items-center cursor-pointer font-medium"
                role="menuitem"
                onClick={() => {
                  navigate('/pricing');
                  setIsMenuOpen(false);
                }}
              >
                Subscription
              </span>
              
              <span
                className="text-red-300 hover:text-red-200 transition-all py-2 flex items-center cursor-pointer font-medium"
                role="menuitem"
                onClick={() => {
                  // Use UserButton's signOut function
                  setIsMenuOpen(false);
                }}
              >
                Sign Out
              </span>
            </>
          ) : (
            <>
              <span
                className="text-white/90 hover:text-white transition-all py-2 flex items-center cursor-pointer font-medium"
                role="menuitem"
                onClick={() => {
                  navigate('/login');
                  setIsMenuOpen(false);
                }}
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </span>
              
              <Button 
                className="gradient-button mt-2 w-full py-2"
                onClick={() => {
                  navigate('/get-started');
                  setIsMenuOpen(false);
                }}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
