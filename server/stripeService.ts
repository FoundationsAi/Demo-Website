import Stripe from 'stripe';
import { log } from './vite';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any // Use a supported version for metered billing
});

// Create an interface for the pricing plans
interface PlanDetails {
  name: string;
  price: number;
  minutes: number;
  overagePerMinute: number;
  features: string[];
  popular: boolean;
  priceId: string;
  meteredPriceId?: string;
  productId?: string;
}

// Constants for pricing tiers
export const PRICING_PLANS: Record<string, PlanDetails> = {
  ESSENTIAL: {
    name: 'Essential',
    price: 49,
    minutes: 500,
    overagePerMinute: 0.15,
    features: [
      '500 AI voice minutes / month',
      'Basic AI voice agents',
      'Standard support',
      'Web integration',
      'Phone support during business hours'
    ],
    popular: true, // Mark as popular plan
    priceId: '' // To be set after creating products/prices
  },
  PROFESSIONAL: {
    name: 'Professional',
    price: 99,
    minutes: 1500,
    overagePerMinute: 0.10,
    features: [
      '1,500 AI voice minutes / month',
      'Advanced AI voice agents',
      'Priority support',
      'Web & mobile integration',
      'Custom voice settings',
      '24/7 Phone support'
    ],
    popular: false,
    priceId: ''
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: 299,
    minutes: 5000,
    overagePerMinute: 0.06,
    features: [
      '5,000 AI voice minutes / month',
      'Premium AI voice agents',
      'Dedicated account manager',
      'Full API access',
      'Advanced analytics',
      'Custom integrations',
      'White-label options',
      'Training & onboarding'
    ],
    popular: false,
    priceId: ''
  },
};

export type PlanKey = keyof typeof PRICING_PLANS;

/**
 * Initialize Stripe products and prices for each plan
 */
export async function initializeStripePlans() {
  try {
    log('Initializing Stripe products and prices...', 'stripe');
    
    // Create or update products and prices for each plan
    for (const [key, plan] of Object.entries(PRICING_PLANS)) {
      const productName = `Foundations AI - ${plan.name}`;
      
      // Check if product exists
      const existingProducts = await stripe.products.list({
        active: true
      });
      
      let product = existingProducts.data.find(p => p.name === productName);
      
      // Create product if it doesn't exist
      if (!product) {
        log(`Creating product: ${productName}`, 'stripe');
        product = await stripe.products.create({
          name: productName,
          description: `${plan.name} plan with ${plan.minutes} minutes per month and ${plan.overagePerMinute} per additional minute`,
          metadata: {
            planType: key,
            baseMinutes: plan.minutes.toString(),
            overageRate: plan.overagePerMinute.toString()
          }
        });
      }
      
      // Check if base subscription price exists
      const existingPrices = await stripe.prices.list({
        product: product.id,
        active: true,
        type: 'recurring'
      });
      
      let basePrice = existingPrices.data.find(p => 
        p.unit_amount === plan.price * 100 && 
        p.recurring?.interval === 'month' &&
        !p.recurring?.usage_type
      );
      
      // Create base price if it doesn't exist
      if (!basePrice) {
        log(`Creating base price for ${productName}: $${plan.price}/month`, 'stripe');
        basePrice = await stripe.prices.create({
          product: product.id,
          unit_amount: plan.price * 100, // Amount in cents
          currency: 'usd',
          recurring: {
            interval: 'month'
          },
          metadata: {
            planType: key,
            type: 'base'
          }
        });
      }
      
      // Check if metered price for overages exists
      let meteredPrice = existingPrices.data.find(p => 
        p.recurring?.usage_type === 'metered' && 
        p.unit_amount === Math.round(plan.overagePerMinute * 100)
      );
      
      // Create metered price if it doesn't exist
      if (!meteredPrice) {
        log(`Creating metered price for ${productName} overages: $${plan.overagePerMinute}/minute`, 'stripe');
        meteredPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(plan.overagePerMinute * 100), // Amount in cents
          currency: 'usd',
          recurring: {
            interval: 'month',
            usage_type: 'metered'
          } as any, // Using 'as any' to handle aggregate_usage property for TypeScript
          metadata: {
            planType: key,
            type: 'overage',
            aggregateUsage: 'sum' // Store as metadata instead since TS definition doesn't include it
          }
        });
      }
      
      // Update the plan object with the price IDs
      const updatedPlan = PRICING_PLANS[key as PlanKey];
      updatedPlan.priceId = basePrice.id;
      updatedPlan.meteredPriceId = meteredPrice.id;
      updatedPlan.productId = product.id;
    }
    
    log('Stripe products and prices initialized successfully', 'stripe');
    return PRICING_PLANS;
  } catch (error) {
    log(`Error initializing Stripe plans: ${error}`, 'stripe');
    console.error('Stripe initialization error:', error);
    throw error;
  }
}

/**
 * Create a Stripe checkout session for subscription
 */
export async function createCheckoutSession(planKey: PlanKey, successUrl: string, cancelUrl: string) {
  try {
    const plan = PRICING_PLANS[planKey];
    if (!plan || !plan.priceId) {
      throw new Error(`Invalid plan or price not found: ${planKey}`);
    }

    // Create line items for the subscription, including both base plan and metered usage
    const lineItems = [
      {
        price: plan.priceId, // Base subscription price
        quantity: 1,
      }
    ];

    // Add metered component if it exists
    if (plan.meteredPriceId) {
      lineItems.push({
        price: plan.meteredPriceId,
        quantity: 1,
      });
    }

    // Construct params for the checkout session
    const params: any = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        planType: planKey,
        baseMinutes: plan.minutes.toString(),
        overageRate: plan.overagePerMinute.toString()
      },
      subscription_data: {
        metadata: {
          planType: planKey,
          baseMinutes: plan.minutes.toString(),
          overageRate: plan.overagePerMinute.toString()
        }
      }
    };

    // Create a checkout session for the subscription
    const session = await stripe.checkout.sessions.create(params);

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Record usage for a subscription with metered pricing
 * @param subscriptionId The Stripe subscription ID
 * @param priceId The metered price ID to report usage against
 * @param quantity The amount of usage to report (in minutes)
 */
export async function recordUsage(subscriptionId: string, priceId: string, quantity: number) {
  try {
    log(`Recording usage: ${quantity} minutes for subscription ${subscriptionId}`, 'stripe');
    
    // Create a usage record for the subscription item
    // First find the subscription item ID for this price
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const item = subscription.items.data.find(item => item.price.id === priceId);
    
    if (!item) {
      throw new Error(`No subscription item found for price ID: ${priceId}`);
    }
    
    // Create the usage record using the raw API client approach to bypass TS issue
    const usageRecord = await (stripe as any).subscriptionItems.createUsageRecord(
      item.id,
      {
        quantity: quantity,
        timestamp: Math.floor(Date.now() / 1000),
        action: 'increment'
      }
    );
    
    log(`Usage record created: ${usageRecord.id}`, 'stripe');
    return usageRecord;
  } catch (error) {
    console.error('Error recording usage:', error);
    throw error;
  }
}

/**
 * Get publishable key for client-side use
 */
export function getPublishableKey() {
  return process.env.STRIPE_PUBLISHABLE_KEY;
}

export default {
  initializeStripePlans,
  createCheckoutSession,
  recordUsage,
  getPublishableKey,
  PRICING_PLANS
};