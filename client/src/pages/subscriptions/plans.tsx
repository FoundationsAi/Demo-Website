import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ParticleBackground } from "@/components/particle-background";

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  currency: string;
  features: string[];
}

const SubscriptionPlans = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch subscription plans from API
  const { data, isLoading: isLoadingPlans, error } = useQuery({
    queryKey: ['/api/subscriptions/plans'],
    queryFn: async () => {
      const response = await fetch('/api/subscriptions/plans');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription plans');
      }
      return response.json();
    }
  });

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        // Redirect to login if not authenticated
        setLocation('/auth/login');
        toast({
          title: "Authentication required",
          description: "Please login or sign up to view subscription plans"
        });
        return false;
      }
      return true;
    } catch (error) {
      setLocation('/auth/login');
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast({
        title: "Please select a plan",
        description: "You must select a subscription plan to continue",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // In a real implementation, we would:
      // 1. Create subscription with Stripe
      // 2. Redirect to Stripe checkout
      // 3. Handle successful payment
      
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          priceId: `price_${selectedPlan.split('_')[1].toLowerCase()}` // Convert product ID to price ID format
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create subscription');
      }

      // Redirect to dashboard or checkout
      setLocation('/dashboard');
      
      toast({
        title: "Subscription created",
        description: "Your subscription has been created successfully"
      });
    } catch (error: any) {
      toast({
        title: "Subscription failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPlans) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading subscription plans...</h2>
          <p>Please wait while we fetch available plans.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-red-50 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2 text-red-700">Error loading plans</h2>
          <p className="text-red-600 mb-4">We encountered an issue while loading the subscription plans.</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const plans: Plan[] = data?.plans || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/20 to-primary/5 py-16 px-4">
      <ParticleBackground variant="subtle" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect subscription that meets your needs and take your voice AI experience to the next level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                selectedPlan === plan.id 
                  ? 'border-primary shadow-lg shadow-primary/25 transform scale-105 z-10' 
                  : 'border-gray-200'
              }`}
            >
              {plan.name === 'Pro' && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-primary to-blue-600 text-white px-4 py-1 text-sm font-semibold transform translate-x-2 translate-y-2 rotate-45">
                  Popular
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="text-xl flex justify-between items-center">
                  {plan.name}
                  {selectedPlan === plan.id && (
                    <Badge variant="outline" className="bg-primary/10 text-primary">
                      Selected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {plan.name === 'Starter' && 'Perfect for small businesses just getting started'}
                  {plan.name === 'Essential' && 'Great for growing businesses with more needs'}
                  {plan.name === 'Basic' && 'Ideal for established businesses with higher demands'}
                  {plan.name === 'Pro' && 'Full-featured solution for serious enterprise usage'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-500">/{plan.interval}</span>
                </div>
                
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter>
                <Button 
                  onClick={() => handleSelectPlan(plan.id)} 
                  variant={selectedPlan === plan.id ? "default" : "outline"}
                  className="w-full"
                >
                  {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button 
            onClick={handleSubscribe} 
            disabled={!selectedPlan || isLoading} 
            size="lg" 
            className="px-8"
          >
            {isLoading ? 'Processing...' : 'Continue with Selected Plan'}
          </Button>
          
          <p className="mt-4 text-sm text-gray-500">
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            You can cancel or change your plan at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;