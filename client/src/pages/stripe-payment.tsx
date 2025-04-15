import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, CreditCard } from "lucide-react";

// Initialize Stripe outside component
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder";
const stripePromise = loadStripe(stripeKey);

// Helper function to get features based on plan name
const getFeaturesForPlan = (planName: string): string[] => {
  const plans: Record<string, string[]> = {
    starter: [
      "50 minutes of AI usage per month",
      "Unlimited AI agents",
      "5 concurrent calls",
      "Voice API, LLM, transcriber costs",
      "API integrations",
      "Real-time booking"
    ],
    essential: [
      "500 minutes of AI usage per month",
      "Unlimited AI agents",
      "10 concurrent calls",
      "All Starter features",
      "Email and chat support"
    ],
    basic: [
      "1,250 minutes of AI usage per month",
      "Unlimited AI agents",
      "25 concurrent calls",
      "All Essential features"
    ],
    pro: [
      "2,100 minutes of AI usage per month",
      "Unlimited AI agents",
      "50 concurrent calls", 
      "All Basic features"
    ],
    enterprise: [
      "Custom minutes of AI usage",
      "Unlimited AI agents",
      "Custom concurrent calls",
      "All Pro features"
    ]
  };
  
  return plans[planName.toLowerCase()] || plans.starter;
};

const CheckoutForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: "if_required"
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      onSuccess();
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="rounded-md bg-card p-4 border border-white/10" />
      <Button 
        type="submit" 
        disabled={!stripe || isLoading} 
        className="w-full gradient-button"
      >
        {isLoading ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
};

const PaymentSuccess = () => {
  const [, setLocation] = useLocation();
  
  return (
    <div className="w-full max-w-md mx-auto text-center py-8">
      <div className="mb-6 flex justify-center">
        <CheckCircle className="h-16 w-16 text-accent" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
      <p className="text-white/70 mb-8">
        Thank you for subscribing to Foundations AI. You now have full access to all our advanced voice AI features.
      </p>
      <Button onClick={() => setLocation("/")} className="gradient-button">
        Return to Home
      </Button>
    </div>
  );
};

function StripePayment() {
  console.log("StripePayment component rendering");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState({
    plan: "starter",
    amount: 4999,
    cycle: "monthly",
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log("StripePayment useEffect running");
    // Parse query parameters from URL
    const searchParams = new URLSearchParams(window.location.search);
    const plan = searchParams.get("plan") || "starter";
    const amount = parseInt(searchParams.get("amount") || "4999", 10);
    const cycle = searchParams.get("cycle") || "monthly";
    
    console.log("Payment params:", { plan, amount, cycle });
    
    setPlanDetails({
      plan,
      amount,
      cycle
    });
    
    // Create PaymentIntent with the parameters from URL
    setPaymentLoading(true);
    setPaymentError(null);
    
    console.log("Creating payment intent with:", { plan, amount, cycle });
    
    apiRequest("POST", "/api/create-payment-intent", { 
      plan,
      amount,
      cycle,
      email: searchParams.get("email") || undefined
    })
      .then((res) => {
        console.log("Payment intent response received");
        return res.json();
      })
      .then((data) => {
        console.log("Payment intent data:", data);
        if (data.error) {
          console.error("Payment intent error:", data.error);
          setPaymentError(data.error);
        } else {
          console.log("Setting client secret:", data.clientSecret.substring(0, 10) + "...");
          setClientSecret(data.clientSecret);
        }
        setPaymentLoading(false);
      })
      .catch(err => {
        console.error("Error creating payment intent:", err);
        setPaymentError("Unable to initialize payment. Please try again.");
        setPaymentLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <Header />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-5 w-5 text-secondary" />
                  <CardTitle>Subscribe to {planDetails.plan.charAt(0).toUpperCase() + planDetails.plan.slice(1)}</CardTitle>
                </div>
                <CardDescription>Complete your subscription to access all features</CardDescription>
              </CardHeader>
              
              <CardContent>
                {paymentSuccess ? (
                  <PaymentSuccess />
                ) : (
                  <>
                    {clientSecret ? (
                      <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <CheckoutForm onSuccess={() => setPaymentSuccess(true)} />
                      </Elements>
                    ) : (
                      <div className="h-40 flex items-center justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full" aria-label="Loading" />
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>{planDetails.plan.charAt(0).toUpperCase() + planDetails.plan.slice(1)} Plan</CardTitle>
                <CardDescription>Get access to our AI voice features</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">
                  ${(planDetails.amount / 100).toFixed(2)}
                  <span className="text-sm font-normal text-white/60">/{planDetails.cycle}</span>
                </div>
                
                {paymentError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-md text-sm text-white">
                    {paymentError}
                  </div>
                )}
                
                <ul className="space-y-2">
                  {getFeaturesForPlan(planDetails.plan).map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="text-sm text-white/60">
                Cancel anytime. No long-term contracts.
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default StripePayment;