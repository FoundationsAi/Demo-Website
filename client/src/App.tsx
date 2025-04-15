import React, { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedRoute } from "@/components/animated-route";
import NotFound from "@/pages/not-found";
import ImmersiveHome from "@/pages/immersive-home";
import Chat from "@/pages/chat";
import Payment from "@/pages/payment";
import Calendar from "@/pages/calendar";
import AgentChat from "@/pages/agent-chat";

// Auth pages
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";

// Subscription pages
import SubscriptionPlans from "@/pages/subscriptions/plans";

// Dashboard pages
import Dashboard from "@/pages/dashboard";

// Auth state and query client providers
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <AnimatePresence mode="wait" initial={false}>
          {/* We need to provide a key to the immediate child of AnimatePresence */}
          <div key={location} className="page-wrapper">
            <Switch location={location}>
              {/* Main routes */}
              <AnimatedRoute path="/" component={ImmersiveHome} animation="fade" />
              <AnimatedRoute path="/chat/:agentId" component={Chat} animation="slideHorizontal" />
              <AnimatedRoute path="/payment" component={Payment} animation="slideUp" />
              <AnimatedRoute path="/calendar" component={Calendar} animation="zoom" />
              <AnimatedRoute path="/agent-chat" component={AgentChat} animation="fade" />
              
              {/* Auth routes */}
              <AnimatedRoute path="/auth/login" component={Login} animation="zoom" />
              <AnimatedRoute path="/auth/signup" component={Signup} animation="zoom" />
              
              {/* Subscription routes */}
              <AnimatedRoute path="/subscriptions/plans" component={SubscriptionPlans} animation="slideUp" />
              
              {/* Dashboard routes */}
              <AnimatedRoute path="/dashboard" component={Dashboard} animation="fade" />
              <AnimatedRoute path="/dashboard/:path*" component={Dashboard} animation="fade" />
              
              {/* 404 route */}
              <AnimatedRoute component={NotFound} animation="fade" />
            </Switch>
          </div>
        </AnimatePresence>
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
