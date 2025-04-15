import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { storage } from '../storage';
import { InsertSubscription } from '@shared/schema';

// Initialize Stripe
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';

// Product IDs for plans
const PRODUCT_IDS = {
  STARTER: 'prod_S8QWDRCVcz07An',
  ESSENTIAL: 'prod_S8QXUopH7dXHrJ',
  BASIC: 'prod_S8QYxTHNgV2Dmr',
  PRO: 'prod_S8QZE7hzuMcjru'
};

// Plan types mapping
const PLAN_TYPES = {
  [PRODUCT_IDS.STARTER]: 'starter',
  [PRODUCT_IDS.ESSENTIAL]: 'essential',
  [PRODUCT_IDS.BASIC]: 'basic',
  [PRODUCT_IDS.PRO]: 'pro'
};

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
}) : null;

export const stripeController = {
  // Create a checkout session for subscription
  createCheckoutSession: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Stripe is not configured' });
      }

      const userId = (req as any).user.id;
      const { priceId, productId } = req.body;

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if user already has an active subscription
      const existingSubscription = await storage.getSubscriptionByUserId(userId);
      if (existingSubscription && existingSubscription.status === 'active') {
        return res.status(400).json({ 
          message: 'User already has an active subscription',
          subscription: existingSubscription
        });
      }

      // Get or create Stripe customer
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        // Create a new customer in Stripe
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim() || undefined,
          metadata: {
            userId: user.id.toString()
          }
        });
        
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${FRONTEND_URL}/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONTEND_URL}/pricing?subscription=canceled`,
        metadata: {
          userId: user.id.toString(),
          productId,
          planType: PLAN_TYPES[productId] || 'unknown'
        }
      });

      return res.json({ 
        url: session.url,
        sessionId: session.id
      });
    } catch (error: any) {
      console.error('Stripe checkout error:', error.message);
      next(error);
    }
  },

  // Handle webhook events from Stripe
  handleWebhook: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Stripe is not configured' });
      }

      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      let event;
      
      if (endpointSecret) {
        try {
          event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } catch (err: any) {
          console.error(`Webhook signature verification failed: ${err.message}`);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      } else {
        // If no webhook secret, use the event as-is (useful for testing)
        event = req.body;
      }

      // Handle specific events
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          await handleCheckoutSessionCompleted(session);
          break;
        }
        
        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          await handleInvoicePaymentSucceeded(invoice);
          break;
        }
        
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionUpdated(subscription);
          break;
        }
        
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          await handleSubscriptionDeleted(subscription);
          break;
        }
      }

      return res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      next(error);
    }
  },

  // Get user's subscription
  getUserSubscription: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      
      // Get user subscription from database
      const subscription = await storage.getSubscriptionByUserId(userId);
      
      if (!subscription) {
        return res.status(404).json({ message: 'No subscription found' });
      }
      
      return res.json({ subscription });
    } catch (error) {
      next(error);
    }
  },

  // Cancel subscription
  cancelSubscription: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Stripe is not configured' });
      }

      const userId = (req as any).user.id;
      
      // Get user subscription
      const subscription = await storage.getSubscriptionByUserId(userId);
      
      if (!subscription) {
        return res.status(404).json({ message: 'No subscription found' });
      }
      
      // Cancel at period end in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
      
      // Update in database
      const updatedSubscription = await storage.cancelSubscription(subscription.id);
      
      return res.json({ 
        message: 'Subscription will be canceled at the end of the current billing period',
        subscription: updatedSubscription
      });
    } catch (error) {
      next(error);
    }
  },

  // Resume subscription (if it was set to cancel at period end)
  resumeSubscription: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Stripe is not configured' });
      }

      const userId = (req as any).user.id;
      
      // Get user subscription
      const subscription = await storage.getSubscriptionByUserId(userId);
      
      if (!subscription) {
        return res.status(404).json({ message: 'No subscription found' });
      }
      
      if (!subscription.cancelAtPeriodEnd) {
        return res.status(400).json({ message: 'Subscription is not set to cancel' });
      }
      
      // Resume in Stripe
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false
      });
      
      // Update in database
      const updatedSubscription = await storage.updateSubscription(subscription.id, {
        cancelAtPeriodEnd: false
      });
      
      return res.json({ 
        message: 'Subscription resumed successfully',
        subscription: updatedSubscription
      });
    } catch (error) {
      next(error);
    }
  },

  // Get subscription plans
  getSubscriptionPlans: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: 'Stripe is not configured' });
      }

      // Fetch products and their prices from Stripe
      const products = await stripe.products.list({
        active: true,
        ids: Object.values(PRODUCT_IDS)
      });
      
      // Fetch all prices
      const prices = await stripe.prices.list({
        active: true,
        limit: 100
      });
      
      // Combine products with their prices
      const plans = products.data.map(product => {
        const productPrices = prices.data.filter(price => 
          price.product === product.id
        );
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          features: product.metadata.features ? JSON.parse(product.metadata.features) : [],
          planType: PLAN_TYPES[product.id as keyof typeof PRODUCT_IDS],
          prices: productPrices.map(price => ({
            id: price.id,
            currency: price.currency,
            unitAmount: price.unit_amount,
            interval: price.recurring?.interval,
            intervalCount: price.recurring?.interval_count
          }))
        };
      });
      
      return res.json({ plans });
    } catch (error) {
      next(error);
    }
  }
};

// Helper functions for webhook event handling
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (!session.subscription || !session.metadata?.userId) return;
  
  const userId = parseInt(session.metadata.userId);
  const planType = session.metadata.planType || 'unknown';
  
  // Get subscription details from Stripe
  if (!stripe) return;
  const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
  
  // Record payment
  await storage.createPayment({
    userId,
    stripePaymentIntentId: session.payment_intent as string,
    amount: stripeSubscription.items.data[0]?.price.unit_amount || 0,
    status: 'succeeded',
    email: session.customer_details?.email
  });
  
  // Create subscription in database
  const subscriptionData: InsertSubscription = {
    userId,
    stripeSubscriptionId: session.subscription as string,
    status: stripeSubscription.status,
    planType,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
    cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end
  };
  
  await storage.createSubscription(subscriptionData);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  if (!invoice.subscription || !invoice.customer) return;
  
  // Get user by Stripe customer ID
  if (!stripe) return;
  const customer = await stripe.customers.retrieve(invoice.customer as string);
  if (customer.deleted) return;
  
  const userId = parseInt(customer.metadata.userId || '0');
  if (!userId) return;
  
  // Get subscription from database
  const subscription = await storage.getSubscriptionByUserId(userId);
  
  if (subscription) {
    // Update subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
    
    await storage.updateSubscription(subscription.id, {
      status: stripeSubscription.status,
      currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000)
    });
  }
  
  // Record payment
  await storage.createPayment({
    userId,
    stripePaymentIntentId: invoice.payment_intent as string,
    amount: invoice.amount_paid,
    status: 'succeeded',
    email: invoice.customer_email
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  // Get user by Stripe customer ID
  if (!stripe) return;
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (customer.deleted) return;
  
  const userId = parseInt(customer.metadata.userId || '0');
  if (!userId) return;
  
  // Get subscription from database
  const dbSubscription = await storage.getSubscriptionByUserId(userId);
  
  if (dbSubscription) {
    // Update subscription
    await storage.updateSubscription(dbSubscription.id, {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    });
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  // Get user by Stripe customer ID
  if (!stripe) return;
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  if (customer.deleted) return;
  
  const userId = parseInt(customer.metadata.userId || '0');
  if (!userId) return;
  
  // Get subscription from database
  const dbSubscription = await storage.getSubscriptionByUserId(userId);
  
  if (dbSubscription) {
    // Update subscription status to canceled
    await storage.updateSubscription(dbSubscription.id, {
      status: 'canceled',
      cancelAtPeriodEnd: false
    });
  }
}