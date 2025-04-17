import React, { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { ImmersiveHome } from "@/pages/immersive-home";
import Chat from "@/pages/chat";
import Payment from "@/pages/payment";
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
      <div className="page-wrapper fade-transition">
        <Switch>
          <Route path="/" component={ImmersiveHome} />
          <Route path="/login" component={Login} />
          <Route path="/get-started" component={GetStarted} />
          <Route path="/payment" component={Payment} />
          <Route path="/agent-chat" component={AgentChat} />
          <Route path="/chat/:agentId" component={Chat} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
