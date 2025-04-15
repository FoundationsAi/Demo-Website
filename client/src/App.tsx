import React, { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { AnimatedRoute } from "@/components/animated-route";
import { AuthProvider, ProtectedRoute } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Chat from "@/pages/chat";
import Payment from "@/pages/payment";
import Calendar from "@/pages/calendar";
import AgentChat from "@/pages/agent-chat";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";

function App() {
  const [location] = useLocation();

  // Reset scroll position when navigating to a new page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Add a global class for cursor visibility
  useEffect(() => {
    // Force the cursor to be visible on all pages except the home page
    if (location !== '/' && location !== '/home') {
      document.body.classList.remove('cursor-default');
      document.body.classList.add('cursor-visible');
    } else {
      document.body.classList.add('cursor-default');
      document.body.classList.remove('cursor-visible');
    }
  }, [location]);

  return (
    <AuthProvider>
      <div className="app">
        <AnimatePresence mode="wait" initial={false}>
          {/* We need to provide a key to the immediate child of AnimatePresence */}
          <div key={location} className="page-wrapper">
            <Switch location={location}>
              {/* Public routes */}
              <AnimatedRoute path="/" component={() => {
                window.location.href = '/home';
                return null;
              }} animation="fade" />
              <AnimatedRoute path="/home" component={Home} animation="fade" />
              <AnimatedRoute path="/login" component={Login} animation="fade" />
              <AnimatedRoute path="/register" component={Register} animation="fade" />
              <AnimatedRoute path="/chat/:agentId" component={Chat} animation="slideHorizontal" />
              <AnimatedRoute path="/payment" component={Payment} animation="slideUp" />
              <AnimatedRoute path="/calendar" component={Calendar} animation="zoom" />
              <AnimatedRoute path="/agent-chat" component={AgentChat} animation="fade" />
              
              {/* Protected dashboard routes */}
              <AnimatedRoute path="/dashboard" component={() => (
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )} animation="fade" />
              
              <AnimatedRoute path="/dashboard/:section" component={({ section }) => (
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              )} animation="fade" />
              
              {/* Route to handle Google OAuth callback */}
              <AnimatedRoute path="/auth/callback" component={() => {
                // Extract token from URL
                const params = new URLSearchParams(window.location.search);
                const token = params.get('token');
                
                // If token exists, save it and redirect to dashboard
                if (token) {
                  localStorage.setItem('authToken', token);
                  window.location.href = '/dashboard';
                }
                
                // Show loading indicator while processing
                return (
                  <div className="flex justify-center items-center min-h-screen bg-zinc-950 text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                );
              }} animation="fade" />

              {/* 404 Route */}
              <AnimatedRoute component={NotFound} animation="fade" />
            </Switch>
          </div>
        </AnimatePresence>
        <Toaster />
      </div>
    </AuthProvider>
  );
}

export default App;
