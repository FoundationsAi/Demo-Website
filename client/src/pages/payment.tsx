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
import { ArrowLeft, CheckCircle, CreditCard, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_placeholder";
const stripePromise = loadStripe(stripeKey);

// Payment status states
type PaymentStatus = 'initial' | 'processing' | 'succeeded' | 'failed' | 'canceled';

const CheckoutForm = ({ 
  onStatusChange 
}: { 
  onStatusChange: (status: PaymentStatus, paymentId?: string) => void 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  // Check payment status on mount and when payment is confirmed
  useEffect(() => {
    if (!stripe) return;
    
    // Check if we have a payment intent ID in the URL (redirect from Stripe)
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );
    
    if (clientSecret) {
      stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
        if (paymentIntent) {
          switch (paymentIntent.status) {
            case "succeeded":
              toast({
                title: "Payment Successful",
                description: "Thank you for your purchase!",
              });
              onStatusChange('succeeded', paymentIntent.id);
              break;
            case "processing":
              toast({
                title: "Payment Processing",
                description: "Your payment is processing. We'll update you when payment is received.",
              });
              onStatusChange('processing', paymentIntent.id);
              // Poll for updates
              pollPaymentStatus(paymentIntent.id);
              break;
            case "requires_payment_method":
              toast({
                title: "Payment Failed",
                description: "Please try another payment method.",
                variant: "destructive",
              });
              onStatusChange('failed');
              break;
            default:
              toast({
                title: "Payment Status",
                description: `Payment status: ${paymentIntent.status}`,
              });
              break;
          }
        }
      });
    }
  }, [stripe, onStatusChange, toast]);
  
  // Poll payment status from server
  const pollPaymentStatus = async (paymentIntentId: string) => {
    try {
      const checkStatus = async () => {
        const response = await fetch(`/api/payment-status/${paymentIntentId}`);
        if (!response.ok) throw new Error('Failed to check payment status');
        const data = await response.json();
        
        if (data.status === 'succeeded') {
          toast({
            title: "Payment Confirmed",
            description: "Your payment has been successfully processed!",
          });
          onStatusChange('succeeded', paymentIntentId);
          return true; // Stop polling
        } else if (data.status === 'canceled' || data.status === 'failed') {
          toast({
            title: "Payment Failed",
            description: "Your payment was not successful. Please try again.",
            variant: "destructive",
          });
          onStatusChange('failed');
          return true; // Stop polling
        }
        return false; // Continue polling
      };
      
      // Check immediately
      const resolved = await checkStatus();
      if (resolved) return;
      
      // Then poll every 2 seconds
      const interval = setInterval(async () => {
        const resolved = await checkStatus();
        if (resolved) clearInterval(interval);
      }, 2000);
      
      // Clear interval after 30 seconds maximum
      setTimeout(() => clearInterval(interval), 30000);
    } catch (error) {
      console.error('Error polling payment status:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    onStatusChange('processing');

    // Confirm the payment
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment`, // Redirect back to payment page
      },
      redirect: "if_required"
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      onStatusChange('failed');
    } else if (paymentIntent) {
      // If we get here, it means there was no redirect and we have the payment intent
      if (paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        onStatusChange('succeeded', paymentIntent.id);
      } else if (paymentIntent.status === 'processing') {
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed. We'll update you when it's complete.",
        });
        onStatusChange('processing', paymentIntent.id);
        // Poll for updates
        pollPaymentStatus(paymentIntent.id);
      }
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="rounded-md bg-card p-4 border border-white/10" />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full gradient-button"
      >
        {isProcessing ? (
          <span className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  );
};

// Payment status screens
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

const PaymentProcessing = () => {
  return (
    <div className="w-full max-w-md mx-auto text-center py-8">
      <div className="mb-6 flex justify-center">
        <Loader2 className="h-16 w-16 text-secondary animate-spin" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Processing Payment</h2>
      <p className="text-white/70 mb-8">
        Your payment is being processed. This may take a moment. Please don't close this page...
      </p>
    </div>
  );
};

const PaymentFailed = ({ onRetry }: { onRetry: () => void }) => {
  return (
    <div className="w-full max-w-md mx-auto text-center py-8">
      <div className="mb-6 flex justify-center">
        <AlertCircle className="h-16 w-16 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold mb-4">Payment Failed</h2>
      <p className="text-white/70 mb-8">
        We couldn't process your payment. Please check your payment details and try again.
      </p>
      <Button onClick={onRetry} className="gradient-button">
        Try Again
      </Button>
    </div>
  );
};

export const Payment: React.FC = () => {
  const [clientSecret, setClientSecret] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("initial");
  const [paymentId, setPaymentId] = useState<string | undefined>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const createPaymentIntent = async () => {
    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", { 
        plan: "premium",
        amount: 4999, // $49.99
        email: "customer@example.com" // In a real application, this would be the user's email
      });
      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error("Error creating payment intent:", err);
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    createPaymentIntent();
  }, []);
  
  const handleStatusChange = (status: PaymentStatus, newPaymentId?: string) => {
    setPaymentStatus(status);
    if (newPaymentId) {
      setPaymentId(newPaymentId);
    }
  };
  
  const handleRetry = () => {
    setPaymentStatus("initial");
    setClientSecret(""); // Clear existing client secret
    createPaymentIntent(); // Create a new payment intent
  };

  // Get the appropriate content based on payment status
  const getPaymentContent = () => {
    switch (paymentStatus) {
      case "succeeded":
        return <PaymentSuccess />;
      case "processing":
        return <PaymentProcessing />;
      case "failed":
        return <PaymentFailed onRetry={handleRetry} />;
      case "canceled":
        return <PaymentFailed onRetry={handleRetry} />;
      case "initial":
      default:
        return (
          <>
            {clientSecret ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm onStatusChange={handleStatusChange} />
              </Elements>
            ) : (
              <div className="h-40 flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-secondary border-t-transparent rounded-full" aria-label="Loading" />
              </div>
            )}
          </>
        );
    }
  };

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
                {getPaymentContent()}
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
