import React, { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedRoute } from "@/components/animated-route";
import NotFound from "@/pages/not-found";
import { ImmersiveHome } from "@/pages/immersive-home";
import Chat from "@/pages/chat";
import Payment from "@/pages/payment";
import Calendar from "@/pages/calendar";
import AgentChat from "@/pages/agent-chat";
import Login from "@/pages/login";
import GetStarted from "@/pages/get-started";

function App() {
  const [location] = useLocation();

  // Reset scroll position when navigating to a new page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Add a global class for cursor visibility
  useEffect(() => {
    // Force the cursor to be visible on all pages except the home page
    if (location !== '/') {
      document.body.classList.remove('cursor-default');
      document.body.classList.add('cursor-visible');
    } else {
      document.body.classList.add('cursor-default');
      document.body.classList.remove('cursor-visible');
    }
    
    // Log navigation for debugging
    console.log('Current location:', location);
  }, [location]);

  return (
    <div className="app">
      <AnimatePresence mode="wait" initial={false}>
        {/* We need to provide a key to the immediate child of AnimatePresence */}
        <div key={location} className="page-wrapper">
          <Switch location={location}>
            {location === '/login' && <AnimatedRoute path="/login" component={Login} animation="slideUp" />}
            {location === '/get-started' && <AnimatedRoute path="/get-started" component={GetStarted} animation="slideUp" />}
            {location === '/' && <AnimatedRoute path="/" component={ImmersiveHome} animation="fade" />}
            <AnimatedRoute path="/chat/:agentId" component={Chat} animation="slideHorizontal" />
            <AnimatedRoute path="/payment" component={Payment} animation="slideUp" />
            <AnimatedRoute path="/calendar" component={Calendar} animation="zoom" />
            <AnimatedRoute path="/agent-chat" component={AgentChat} animation="fade" />
            {location !== '/login' && location !== '/get-started' && location !== '/' && <AnimatedRoute component={NotFound} animation="fade" />}
          </Switch>
        </div>
      </AnimatePresence>
      <Toaster />
    </div>
  );
}

export default App;
