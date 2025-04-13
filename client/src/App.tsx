import React, { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedRoute } from "@/components/animated-route";
import { SmoothScroll } from "@/components/smooth-scroll";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import Payment from "@/pages/payment";
import Calendar from "@/pages/calendar";

function App() {
  const [location] = useLocation();

  // Reset scroll position when navigating to a new page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <SmoothScroll options={{ duration: 1.2, lerp: 0.1 }}>
      <AnimatePresence mode="wait" initial={false}>
        {/* We need to provide a key to the immediate child of AnimatePresence */}
        <div key={location} className="page-wrapper">
          <Switch location={location}>
            <AnimatedRoute path="/" component={Home} animation="fade" />
            <AnimatedRoute path="/chat/:agentId" component={Chat} animation="slideHorizontal" />
            <AnimatedRoute path="/payment" component={Payment} animation="slideUp" />
            <AnimatedRoute path="/calendar" component={Calendar} animation="zoom" />
            <AnimatedRoute component={NotFound} animation="fade" />
          </Switch>
        </div>
      </AnimatePresence>
      <Toaster />
    </SmoothScroll>
  );
}

export default App;
