import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Loader2, ArrowLeft, CheckCircle, Rocket, Star, LineChart, Diamond, Building } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import CheckoutForm from "../components/checkout-form";

// Initialize Stripe with public key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PlanData {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  overageFee?: string;
}

export default function SubscribePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSubscription, setIsCreatingSubscription] = useState(false);
  const [plans, setPlans] = useState<PlanData[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [clientSecret, setClientSecret] = useState("");
  const [subscriptionId, setSubscriptionId] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Get plan ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const planIdFromUrl = urlParams.get('plan');
  
  useEffect(() => {
    // Fetch available plans
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/subscriptions/plans");
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error("Invalid response from server");
        }
        
        setPlans(data);
        
        // If we have a plan ID in the URL, select that plan
        if (planIdFromUrl) {
          const matchingPlan = data.find(plan => plan.id === planIdFromUrl);
          if (matchingPlan) {
            setSelectedPlan(matchingPlan);
          }
        } else if (data.length > 0) {
          // Otherwise select the first plan
          setSelectedPlan(data[0]);
        }
        
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast({
          title: "Error",
          description: "Could not load subscription plans. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPlans();
  }, [planIdFromUrl, toast]);
  
  const createSubscription = async () => {
    if (!selectedPlan) return;
    
    setIsCreatingSubscription(true);
    
    try {
      const response = await fetch("/api/subscriptions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId: selectedPlan.id,
          billingPeriod
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription");
      }
      
      setClientSecret(data.clientSecret);
      setSubscriptionId(data.subscriptionId);
      
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingSubscription(false);
    }
  };
  
  // Success component to show after payment
  const PaymentSuccess = () => (
    <div className="text-center py-6">
      <div className="mb-6 flex justify-center">
        <CheckCircle className="h-16 w-16 text-[#4F9BFF]" />
      </div>
      <h3 className="text-2xl font-semibold mb-3 text-[#4F9BFF]">Payment Successful!</h3>
      <p className="mb-6 text-muted-foreground text-lg">
        Thank you for subscribing to {selectedPlan?.name}. Your account is now active with full access to AI voice features.
      </p>
      <Button 
        onClick={() => setLocation("/dashboard")}
        className="w-full bg-[#4F9BFF] hover:bg-[#3E7DD5] text-white"
      >
        Go to Dashboard
      </Button>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-[#4F9BFF]/10">
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Button 
          variant="ghost" 
          className="mb-6 text-[#4F9BFF]"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>
        
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#4F9BFF]" />
          </div>
        ) : (
          <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-white p-8">
                <h1 className="text-2xl font-semibold text-slate-700 mb-1">Choose Your Plan</h1>
                <p className="text-slate-500 mb-6">
                  Select a subscription plan and billing cycle
                </p>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Subscription Plan</Label>
                    <Select
                      value={selectedPlan?.id || ""}
                      onValueChange={(value) => {
                        const plan = plans.find(p => p.id === value);
                        if (plan) setSelectedPlan(plan);
                      }}
                    >
                      <SelectTrigger className="border-slate-200 bg-white text-slate-800">
                        <SelectValue placeholder="Select a plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id} className="py-2 px-4">
                            <div className="flex items-center">
                              <div className="w-5 h-5 mr-2 bg-slate-100 rounded-sm flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                </svg>
                              </div>
                              <div>
                                <span className="font-medium">{plan.name}</span>
                                <div className="text-sm text-slate-500">
                                  ${billingPeriod === 'monthly' ? plan.monthlyPrice.toFixed(2) : plan.yearlyPrice.toFixed(2)} {billingPeriod === 'monthly' ? 'Per month' : 'Per year'}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="border border-slate-200 rounded-lg p-6 bg-[#0d111b]/95 text-white">
                    {selectedPlan ? (
                      <>
                        <div className="flex items-start">
                          <div className="w-12 h-12 mr-4 bg-slate-800/50 rounded-lg flex items-center justify-center">
                            {selectedPlan.name === 'Starter' && <Rocket className="h-6 w-6 text-white" />}
                            {selectedPlan.name === 'Essential' && <Star className="h-6 w-6 text-amber-400" />}
                            {selectedPlan.name === 'Basic' && <LineChart className="h-6 w-6 text-blue-400" />}
                            {selectedPlan.name === 'Pro' && <Diamond className="h-6 w-6 text-cyan-400" />}
                            {selectedPlan.name === 'Enterprise' && <Building className="h-6 w-6 text-purple-400" />}
                          </div>
                          <div>
                            <h3 className="text-xl font-medium text-white">{selectedPlan.name}</h3>
                            <div className="flex items-center mt-1">
                              <div className="text-3xl font-bold text-white">
                                ${billingPeriod === 'monthly' ? selectedPlan.monthlyPrice.toFixed(2) : selectedPlan.yearlyPrice.toFixed(2)}
                              </div>
                              <div className="text-slate-300 ml-2">
                                /{billingPeriod === 'monthly' ? 'month' : 'year'}
                              </div>
                            </div>
                            {selectedPlan.overageFee && (
                              <div className="text-sm text-slate-300 mt-1">
                                Overage: {selectedPlan.overageFee}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-6 border-t border-slate-700 pt-5">
                          <div className="space-y-3">
                            {selectedPlan.features.map((feature, index) => (
                              <div key={index} className="flex items-center">
                                <CheckCircle className="h-5 w-5 text-[#4F9BFF] flex-shrink-0 mr-3" />
                                <span className="text-white">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-slate-300">
                        Please select a plan to view details
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-700">Billing Period</Label>
                    <RadioGroup
                      value={billingPeriod}
                      onValueChange={(value) => setBillingPeriod(value as 'monthly' | 'yearly')}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" className="text-[#4F9BFF]" />
                        <Label htmlFor="monthly" className="text-slate-700">Monthly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yearly" id="yearly" className="text-[#4F9BFF]" />
                        <Label htmlFor="yearly" className="text-slate-700">Yearly <span className="text-xs text-green-500 font-medium">(Save 10%)</span></Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Button
                    className="w-full mt-6 bg-[#3b5bf5] hover:bg-[#2a46cf] text-white font-medium py-6 rounded-md"
                    onClick={createSubscription}
                    disabled={!selectedPlan || isCreatingSubscription}
                  >
                    {isCreatingSubscription ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Setting up subscription...
                      </>
                    ) : (
                      "Join Foundations AI"
                    )}
                  </Button>
                </div>
              </div>
              
              {clientSecret && !paymentSuccess && (
                <div className="border-t border-slate-200 p-8">
                  <h2 className="text-xl font-semibold text-slate-700 mb-4">Payment Details</h2>
                  <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm 
                      clientSecret={clientSecret}
                      onSuccess={() => setPaymentSuccess(true)} 
                    />
                  </Elements>
                </div>
              )}
              
              {paymentSuccess && (
                <div className="border-t border-slate-200 p-8">
                  <PaymentSuccess />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}