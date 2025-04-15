import React from "react";
import { Link } from "wouter";
import { MountainLogo } from "@/components/mountain-logo";

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 bg-gradient-to-b from-blue-950/90 to-blue-950/70 backdrop-blur-md border-b border-blue-900/30">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <a className="flex items-center space-x-2 text-white hover:opacity-90 transition-opacity">
            <MountainLogo className="h-8 w-8" animate={false} />
            <span className="font-bold text-lg sm:text-xl">Foundations AI</span>
          </a>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/#features">
            <a className="text-blue-200 hover:text-white transition-colors">Features</a>
          </Link>
          <Link href="/#pricing">
            <a className="text-blue-200 hover:text-white transition-colors">Pricing</a>
          </Link>
          <Link href="/contact">
            <a className="text-blue-200 hover:text-white transition-colors">Contact</a>
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <Link href="/login">
            <a className="hidden sm:inline-block text-blue-200 hover:text-white transition-colors px-3 py-2">
              Log In
            </a>
          </Link>
          <Link href="/signup">
            <a className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors">
              Get Started
            </a>
          </Link>
        </div>
      </div>
    </header>
  );
};