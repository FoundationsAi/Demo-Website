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

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder";
const stripePromise = loadStripe(stripeKey);

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

export const Payment: React.FC = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { 
      plan: "premium",
      amount: 4999 // $49.99
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch(err => {
        console.error("Error creating payment intent:", err);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-primary">
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
                  <CardTitle>Subscribe to Premium</CardTitle>
                </div>
                <CardDescription>Choose our premium plan for full access to all features</CardDescription>
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
                <CardTitle>Premium Plan</CardTitle>
                <CardDescription>Get access to all our enterprise features</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">$49.99<span className="text-sm font-normal text-white/60">/month</span></div>
                
                <ul className="space-y-2">
                  {[
                    "Unlimited AI voice calls",
                    "Full access to all agent types",
                    "Custom voice training",
                    "Advanced analytics",
                    "Priority support",
                    "API access",
                    "White-label solution"
                  ].map((feature, index) => (
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
};

export default Payment;
