// Stripe Service - Handles Stripe payment integration

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Define the pricing plans with their Stripe product IDs
export interface PricingPlan {
  id: string;
  name: string;
  productId: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
}

// Pricing plans with Stripe product IDs
export const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    productId: 'prod_S8QWDRCVcz07An',
    price: '$49',
    description: 'Basic voice AI access for small businesses',
    features: [
      'AI voice agent access',
      'Basic voice customization',
      'Customer service bot',
      '100 minutes/month',
      'Email support',
    ],
  },
  {
    id: 'essential',
    name: 'Essential',
    productId: 'prod_S8QXUopH7dXHrJ',
    price: '$99',
    description: 'More AI capabilities for growing businesses',
    features: [
      'All Starter features',
      'Multiple voice agents',
      'Custom voice training',
      '500 minutes/month',
      'Priority email support',
      'Basic analytics',
    ],
    isPopular: true,
  },
  {
    id: 'basic',
    name: 'Basic',
    productId: 'prod_S8QYxTHNgV2Dmr',
    price: '$199',
    description: 'Enhanced tools for established businesses',
    features: [
      'All Essential features',
      'Advanced voice customization',
      'Multiple agent types',
      '1,500 minutes/month',
      'Phone & email support',
      'Advanced analytics',
      'API access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    productId: 'prod_S8QZE7hzuMcjru',
    price: '$399',
    description: 'Full-featured solution for power users',
    features: [
      'All Basic features',
      'Unlimited voice agents',
      'Full customization suite',
      '5,000 minutes/month',
      '24/7 priority support',
      'Enterprise analytics',
      'Advanced API access',
      'Dedicated account manager',
    ],
    isPopular: true,
  },
];

// Cache the Stripe promise to avoid recreation
let stripePromise: Promise<Stripe | null>;

// Initialize Stripe with the publishable key
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key is missing');
      return Promise.reject(new Error('Stripe publishable key is missing'));
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// Get a pricing plan by ID
export const getPlanById = (planId: string): PricingPlan | undefined => {
  return pricingPlans.find((plan) => plan.id === planId);
};

// Create a checkout session on the server
export const createCheckoutSession = async (
  planId: string,
  userId: string,
  customerId?: string
): Promise<{ sessionId: string }> => {
  const plan = getPlanById(planId);
  
  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }
  
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        planId,
        productId: plan.productId,
        userId,
        customerId,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create checkout session');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (
  planId: string,
  userId: string,
  customerId?: string
): Promise<void> => {
  try {
    const stripe = await getStripe();
    
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }
    
    const { sessionId } = await createCheckoutSession(planId, userId, customerId);
    
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw new Error(error.message || 'Failed to redirect to checkout');
    }
  } catch (error) {
    console.error('Error redirecting to checkout:', error);
    throw error;
  }
};