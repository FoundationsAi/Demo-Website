import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CheckoutFormProps {
  onSuccess: () => void;
  clientSecret?: string;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ onSuccess, clientSecret }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [cardError, setCardError] = useState('');
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
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment successful!",
          description: "Your subscription is now active.",
        });
        onSuccess();
      }
    } catch (error: any) {
      console.error('Payment submission error:', error);
      setCardError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
      
      <div className="text-xs text-center text-muted-foreground">
        Your payment information is securely processed by Stripe.
        We do not store your full credit card details.
      </div>
    </form>
  );
};

export default CheckoutForm;