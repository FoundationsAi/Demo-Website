import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StripePaymentFlow } from './stripe-payment-flow';

type PaymentStage = 'details' | 'processing' | 'confirming' | 'complete';

interface CheckoutFormProps {
  onSuccess: () => void;
  clientSecret?: string;
  onProcessing?: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardError, setCardError] = useState('');
  const [paymentStage, setPaymentStage] = useState<PaymentStage>('details');
  const { toast } = useToast();

  useEffect(() => {
    // Log client secret for debugging
    if (!clientSecret) {
      console.warn('No client secret provided to CheckoutForm');
    }
  }, [clientSecret]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    if (!clientSecret) {
      setCardError('Payment setup incomplete. Please try again.');
      return;
    }

    setIsLoading(true);
    setCardError('');
    setPaymentStage('processing');

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setIsLoading(false);
      return;
    }

    try {
      // Use the client secret provided by the server to confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            // You can add billing details here if collected from the form
          },
        },
      });

      if (error) {
        console.error('Payment error:', error);
        setCardError(error.message || 'An error occurred with your payment. Please try again.');
        setPaymentStage('details');
      } else if (paymentIntent) {
        if (paymentIntent.status === 'requires_confirmation') {
          setPaymentStage('confirming');
        } else if (paymentIntent.status === 'succeeded') {
          setPaymentStage('complete');
          toast({
            title: "Payment successful!",
            description: "Your subscription is now active.",
          });
          // Wait a moment to show the complete state before calling onSuccess
          setTimeout(() => {
            onSuccess();
          }, 1500);
        }
      }
    } catch (error: any) {
      console.error('Payment submission error:', error);
      setCardError(error.message || 'An unexpected error occurred. Please try again.');
      setPaymentStage('details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <StripePaymentFlow 
        currentStage={paymentStage} 
        error={cardError || undefined}
      />
      
      {paymentStage === 'details' && (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="p-4 border rounded-md bg-card">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
              onChange={(e) => {
                if (e.error) {
                  setCardError(e.error.message || 'Card validation error');
                } else {
                  setCardError('');
                }
              }}
            />
          </div>
          
          {cardError && (
            <div className="text-red-500 text-sm">{cardError}</div>
          )}
          
          <Button 
            type="submit" 
            disabled={!stripe || isLoading}
            className="w-full bg-[#3b5bf5] hover:bg-[#2a46cf]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Process Payment"
            )}
          </Button>
          
          <div className="text-xs text-center text-muted-foreground">
            Your payment information is securely processed by Stripe.
            We do not store your full credit card details.
          </div>
        </form>
      )}
      
      {(paymentStage === 'processing' || paymentStage === 'confirming') && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-10 w-10 animate-spin text-[#3b5bf5] mb-4" />
          <p className="text-lg font-medium">
            {paymentStage === 'processing' ? 'Processing your payment...' : 'Confirming your subscription...'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Please do not close this window.
          </p>
        </div>
      )}
      
      {paymentStage === 'complete' && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-green-100 rounded-full p-3 mb-4">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-center mb-2">Payment Successful!</h3>
          <p className="text-center text-gray-500 mb-6">
            Your subscription has been activated successfully.
          </p>
        </div>
      )}
    </div>
  );
};

export default CheckoutForm;