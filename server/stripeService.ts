import Stripe from 'stripe';
import { log } from './vite';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-03-31.basil' as any
});

// Constants for pricing tiers
export const PRICING_PLANS = {
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
      
      // First, create or find the meter for voice minutes tracking
      const meterName = `${productName} - Voice Minutes`;
      const meterDescription = `Usage meter for voice minutes consumed in the ${plan.name} plan`;
      
      // Check if meter already exists
      let meter;
      const existingMeters = await stripe.meters.list({
        limit: 100
      });
      
      meter = existingMeters.data.find(m => m.display_name === meterName);
      
      // Create meter if it doesn't exist
      if (!meter) {
        log(`Creating meter: ${meterName}`, 'stripe');
        meter = await stripe.meters.create({
          display_name: meterName,
          description: meterDescription,
          metadata: {
            planType: key,
            overageRate: plan.overagePerMinute.toString()
          }
        });
      }
      
      // Now check if product exists
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
            overageRate: plan.overagePerMinute.toString(),
            meterId: meter.id
          }
        });
      } else if (!product.metadata.meterId) {
        // Update product with meter ID if not already set
        product = await stripe.products.update(product.id, {
          metadata: {
            ...product.metadata,
            meterId: meter.id
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
      
      // Create metered price with meter if it doesn't exist
      if (!meteredPrice) {
        log(`Creating metered price for ${productName} overages: $${plan.overagePerMinute}/minute`, 'stripe');
        meteredPrice = await stripe.prices.create({
          product: product.id,
          unit_amount: Math.round(plan.overagePerMinute * 100), // Amount in cents
          currency: 'usd',
          recurring: {
            interval: 'month',
            usage_type: 'metered',
            meter: meter.id  // Link to the meter
          },
          metadata: {
            planType: key,
            type: 'overage'
          }
        });
      }
      
      // Update the plan object with the price ID
      PRICING_PLANS[key as PlanKey].priceId = basePrice.id;
      
      // Also store the metered price ID, meter ID and other relevant info
      PRICING_PLANS[key as PlanKey] = {
        ...PRICING_PLANS[key as PlanKey],
        meteredPriceId: meteredPrice.id,
        meterId: meter.id,
        productId: product.id
      };
    }
    
    log('Stripe products, prices and meters initialized successfully', 'stripe');
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

    // Create a checkout session for the subscription
    const session = await stripe.checkout.sessions.create({
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
          overageRate: plan.overagePerMinute.toString(),
          meterId: plan.meterId
        }
      }
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
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
  getPublishableKey,
  PRICING_PLANS
};