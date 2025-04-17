import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from './storage';
import { z } from 'zod';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil' as any
});

// Initialize Clerk SDK
const clerk = {
  users: {
    updateUser: async (userId: string, data: any) => {
      console.log(`Updating user ${userId} with metadata:`, data);
      // In production, this would update Clerk user metadata
      return { id: userId, ...data };
    },
    getUserList: async (options: any) => {
      console.log('Getting user list with query:', options);
      // In production, this would return users from Clerk
      return [];
    }
  }
};

// Schema for checkout request validation
const checkoutSchema = z.object({
  planId: z.string(),
  productId: z.string(),
  userId: z.string(),
  customerId: z.string().optional(),
});

// Create a router to handle Stripe-related routes
const stripeRouter = express.Router();

// Create a checkout session
stripeRouter.post('/create-checkout-session', async (req: Request, res: Response) => {
  try {
    // Validate request body
    const { planId, productId, userId, customerId } = checkoutSchema.parse(req.body);
    
    // Set up line items based on the selected plan
    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product: productId,
          unit_amount: getPriceFromPlan(planId), // Get price in cents
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      },
    ];
    
    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: `${req.headers.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/pricing`,
      customer: customerId,
      client_reference_id: userId,
      customer_creation: customerId ? undefined : 'always',
      metadata: {
        userId,
        planId,
      },
    });
    
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(400).json({ message: 'Error creating checkout session' });
  }
});

// Handle Stripe webhooks
stripeRouter.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    return res.status(400).json({ message: 'Webhook secret is not configured' });
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).send(`Webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  // Handle specific event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract user and plan info from metadata
      const userId = session.metadata?.userId;
      const planId = session.metadata?.planId;
      const customerId = session.customer as string;
      
      if (userId && planId && customerId) {
        // Add subscription info to user metadata in Clerk
        try {
          await clerk.users.updateUser(userId, {
            publicMetadata: {
              stripeCustomerId: customerId,
              subscriptionPlan: planId,
              subscriptionStatus: 'active',
            },
          });
          
          // Create a payment record in the database
          await storage.createPayment({
            stripePaymentIntentId: session.payment_intent as string,
            status: 'completed',
            amount: session.amount_total || 0,
            email: session.customer_details?.email || '',
          });
        } catch (error) {
          console.error('Error updating user metadata or creating payment record:', error);
        }
      }
      break;
    }
    
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      // Find users with this customer ID
      try {
        const users = await clerk.users.getUserList({
          query: JSON.stringify({ 'publicMetadata.stripeCustomerId': customerId }),
        });
        
        // Update user's subscription status
        if (users.length > 0) {
          const user = users[0];
          await clerk.users.updateUser(user.id, {
            publicMetadata: {
              ...user.publicMetadata,
              subscriptionStatus: subscription.status,
            },
          });
        }
      } catch (error) {
        console.error('Error updating subscription status:', error);
      }
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;
      
      // Find users with this customer ID
      try {
        const users = await clerk.users.getUserList({
          query: JSON.stringify({ 'publicMetadata.stripeCustomerId': customerId }),
        });
        
        // Update user's subscription status to inactive
        if (users.length > 0) {
          const user = users[0];
          await clerk.users.updateUser(user.id, {
            publicMetadata: {
              ...user.publicMetadata,
              subscriptionStatus: 'inactive',
            },
          });
        }
      } catch (error) {
        console.error('Error updating subscription status:', error);
      }
      break;
    }
  }
  
  res.json({ received: true });
});

// Helper function to get price from plan ID (in cents)
function getPriceFromPlan(planId: string): number {
  const planPrices: Record<string, number> = {
    'starter': 4900,
    'essential': 9900,
    'basic': 19900,
    'pro': 39900,
  };
  
  return planPrices[planId] || 9900; // Default to $99 if plan not found
}

export default stripeRouter;