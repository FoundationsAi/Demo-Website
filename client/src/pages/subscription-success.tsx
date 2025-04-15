import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { AnimatedText } from "@/components/animated-text";

const SubscriptionSuccess: React.FC = () => {
  const [, setLocation] = useLocation();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  useEffect(() => {
    // Extract session ID from URL
    const searchParams = new URLSearchParams(window.location.search);
    const session = searchParams.get("session_id");
    if (session) {
      setSessionId(session);
      console.log("Subscription success with session ID:", session);
    }
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 to-blue-950">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border border-blue-600/30 bg-gradient-to-b from-blue-900/40 to-blue-950/60 backdrop-blur-sm">
            <CardContent className="pt-12 pb-10 px-6 sm:px-12 text-center">
              <div className="flex justify-center mb-8">
                <div className="bg-blue-600/20 p-4 rounded-full">
                  <CheckCircle className="h-16 w-16 text-green-400" />
                </div>
              </div>
              
              <AnimatedText
                text="Subscription Confirmed!"
                as="h1"
                className="text-3xl sm:text-4xl font-bold mb-4 text-white"
                animation="slide"
              />
              
              <p className="text-blue-200 text-lg mb-8">
                Thank you for subscribing to Foundations AI. Your account has been successfully activated, and you now have full access to our voice AI platform.
              </p>
              
              <div className="bg-blue-800/30 p-6 rounded-lg border border-blue-500/20 mb-8 text-left">
                <h3 className="font-medium text-lg mb-3 text-white">What's Next?</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-100">Explore your new AI agent capabilities in your dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-100">Configure your voice agents for your specific needs</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-100">Integrate with your existing systems using our API</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-100">Contact our support team if you need any assistance</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => setLocation("/dashboard")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  Go to Dashboard
                </Button>
                <Button 
                  onClick={() => setLocation("/")}
                  variant="outline"
                  size="lg"
                  className="text-white border-blue-400 hover:bg-blue-800/30"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default SubscriptionSuccess;