import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MountainLogo } from "@/components/mountain-logo";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface PlanProps {
  id: string;
  name: string;
  price: string;
  yearlyPrice: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
}

const plans: PlanProps[] = [
  {
    id: "prod_S8QWDRCVcz07An", // Starter plan product ID
    name: "Starter",
    price: "$49.99",
    yearlyPrice: "$539.89",
    description: "Perfect for startups and small businesses exploring AI automation",
    features: [
      "50 minutes of AI usage per month",
      "Unlimited AI agents",
      "5 concurrent calls",
      "Voice API, LLM, transcriber costs",
      "API integrations",
      "Real-time booking",
      "Human transfer",
      "Community support"
    ],
    icon: <span className="text-3xl">🚀</span>
  },
  {
    id: "prod_S8QXUopH7dXHrJ", // Essential plan product ID
    name: "Essential",
    price: "$299.99",
    yearlyPrice: "$3,239.89",
    description: "Ideal for small to medium businesses with low call volumes",
    features: [
      "500 minutes of AI usage per month",
      "Unlimited AI agents",
      "10 concurrent calls",
      "All Starter features"
    ],
    popular: true,
    icon: <span className="text-3xl">⭐</span>
  },
  {
    id: "prod_S8QYxTHNgV2Dmr", // Basic plan product ID
    name: "Basic",
    price: "$749.99",
    yearlyPrice: "$8,099.89",
    description: "Designed for growing businesses with moderate call volumes",
    features: [
      "1,250 minutes of AI usage per month",
      "Unlimited AI agents",
      "25 concurrent calls",
      "All Essential features",
      "Team access",
      "Support via ticketing"
    ],
    icon: <span className="text-3xl">📈</span>
  },
  {
    id: "prod_S8QZE7hzuMcjru", // Pro plan product ID
    name: "Pro",
    price: "$1,499.99",
    yearlyPrice: "$16,199.89",
    description: "Built for established businesses with high call volumes",
    features: [
      "2,100 minutes of AI usage per month",
      "Unlimited AI agents",
      "50 concurrent calls",
      "All Basic features"
    ],
    icon: <span className="text-3xl">💎</span>
  }
];

const SubscriptionPlansPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubscription = async (planId: string, planName: string) => {
    setIsLoading(planId);
    
    try {
      const response = await fetch("/api/subscriptions/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: planId,
          billingCycle
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create checkout session");
      }
      
      const data = await response.json();
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
    } catch (error) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to process subscription. Please try again.",
        variant: "destructive",
      });
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1528] to-[#061022] flex flex-col items-center justify-center p-4 py-16">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <MountainLogo className="h-12 w-12" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Choose Your Subscription Plan</h1>
          <p className="text-blue-300 text-lg max-w-2xl mx-auto mb-8">
            Select the plan that best fits your business needs. All plans include unlimited AI agents and our core features.
          </p>
          
          {/* Billing cycle toggle */}
          <div className="inline-flex items-center bg-blue-900/20 p-1 rounded-full mb-10 text-sm">
            <button
              className={`px-6 py-2 rounded-full transition ${
                billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-blue-300'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full transition ${
                billingCycle === 'yearly' ? 'bg-blue-600 text-white' : 'text-blue-300'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly <span className="text-xs font-medium text-emerald-400">Save 10%</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative border-blue-500/20 ${plan.popular ? 'border-blue-500/50 shadow-lg shadow-blue-500/20' : ''} bg-gradient-to-b from-blue-950/40 to-blue-900/20 backdrop-blur-md overflow-hidden`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-blue-600 text-white font-semibold py-1 px-4 text-sm -mr-8 rotate-45 translate-x-2">
                  POPULAR
                </div>
              )}
              
              <CardHeader className="pb-4">
                <div className="mb-2">{plan.icon}</div>
                <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                <CardDescription className="text-blue-300">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-4">
                <div className="mb-6">
                  <div className="text-3xl font-bold text-white">
                    {billingCycle === 'yearly' ? plan.yearlyPrice : plan.price}
                  </div>
                  <div className="text-blue-300 text-sm">
                    per {billingCycle === 'yearly' ? 'year' : 'month'}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center text-white text-sm">
                      <svg className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-900/60 hover:bg-blue-800'} text-white`}
                  onClick={() => handleSubscription(plan.id, plan.name)}
                  disabled={isLoading !== null}
                >
                  {isLoading === plan.id ? "Processing..." : "Select Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {/* Enterprise option */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-blue-500/20 bg-gradient-to-b from-blue-950/40 to-blue-900/20 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="md:flex items-center">
                <div className="mb-4 md:mb-0 md:mr-6 flex-shrink-0 text-center md:text-left">
                  <span className="text-4xl">🏢</span>
                </div>
                <div className="md:flex-1 mb-4 md:mb-0 md:mr-6">
                  <h3 className="text-xl font-bold text-white mb-2">Enterprise Plan</h3>
                  <p className="text-blue-300">
                    For large businesses and agencies with massive call volumes or unique needs.
                    Custom minutes, unlimited agents, white-label platform, and more.
                  </p>
                </div>
                <div>
                  <Button 
                    className="w-full md:w-auto bg-transparent hover:bg-blue-900/50 text-white border border-blue-500"
                    onClick={() => {
                      // In a real implementation, this would redirect to a contact form
                      toast({
                        title: "Enterprise Inquiry",
                        description: "Our sales team will contact you shortly to discuss your needs.",
                      });
                    }}
                  >
                    Contact Sales
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h3 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h3>
          
          <Tabs defaultValue="billing" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-blue-900/20 border border-blue-800/30 rounded-lg p-1">
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>
            
            <TabsContent value="billing" className="mt-4">
              <div className="space-y-4 text-left">
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">
                  <h4 className="font-semibold text-white mb-2">How does billing work?</h4>
                  <p className="text-blue-300 text-sm">
                    You can choose between monthly or yearly billing. Annual plans include a 10% discount.
                    Setup fee of $3,000 is waived for annual contracts.
                  </p>
                </div>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">
                  <h4 className="font-semibold text-white mb-2">Can I change plans later?</h4>
                  <p className="text-blue-300 text-sm">
                    Yes, you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades will apply at the end of your current billing cycle.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="features" className="mt-4">
              <div className="space-y-4 text-left">
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">
                  <h4 className="font-semibold text-white mb-2">What's included in all plans?</h4>
                  <p className="text-blue-300 text-sm">
                    All plans include unlimited AI agents, API integrations, real-time booking, and human transfer capabilities. The difference is primarily in the minutes of AI usage and concurrent calls.
                  </p>
                </div>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">
                  <h4 className="font-semibold text-white mb-2">What are the Enterprise features?</h4>
                  <p className="text-blue-300 text-sm">
                    Enterprise plans include white-label capabilities, unlimited subaccounts, custom integrations, dedicated support, and service level agreements (SLAs).
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="usage" className="mt-4">
              <div className="space-y-4 text-left">
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">
                  <h4 className="font-semibold text-white mb-2">What happens if I exceed my minutes?</h4>
                  <p className="text-blue-300 text-sm">
                    If you exceed your allocated minutes, additional minutes are billed at the overage rate for your plan. Starter: $0.35/min, Essential: $0.30/min, Basic: $0.25/min, Pro: $0.20/min.
                  </p>
                </div>
                <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">
                  <h4 className="font-semibold text-white mb-2">How do concurrent calls work?</h4>
                  <p className="text-blue-300 text-sm">
                    Concurrent calls represent the maximum number of simultaneous AI agent conversations that can occur at once. If you reach your limit, new calls will be queued until a slot becomes available.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="text-center">
          <Link href="/">
            <div className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer">
              ← Back to home
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlansPage;