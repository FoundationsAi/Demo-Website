import React, { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedRoute } from "@/components/animated-route";
import NotFound from "@/pages/not-found";
import { ImmersiveHome } from "@/pages/immersive-home";
import Chat from "@/pages/chat";
import Payment from "@/pages/payment";
import Calendar from "@/pages/calendar";
import AgentChat from "@/pages/agent-chat";
import Signup from "@/pages/signup";
import Login from "@/pages/login"; 
import Dashboard from "@/pages/dashboard";
import Subscribe from "@/pages/subscribe";

function App() {
  const [location] = useLocation();
  
  console.log("Current location:", location);

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
  }, [location]);

  return (
    <div className="app">
      <AnimatePresence mode="wait" initial={false}>
        {/* We need to provide a key to the immediate child of AnimatePresence */}
        <div key={location} className="page-wrapper">
          <Switch location={location}>
            <Route path="/" component={ImmersiveHome} />
            <Route path="/chat/:agentId" component={Chat} />
            <Route path="/payment" component={Payment} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/agent-chat" component={AgentChat} />
            <Route path="/signup" component={Signup} />
            <Route path="/login" component={Login} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/subscribe" component={Subscribe} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </AnimatePresence>
      <Toaster />
    </div>
  );
}

export default App;
