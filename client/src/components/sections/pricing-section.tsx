import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal } from '@/components/scroll-reveal';
import { AnimatedText } from '@/components/animated-text';
import { HoverableCard } from '@/components/hoverable-card';

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  overageFee?: string;
  hasTrial?: boolean;
  trialDays?: number;
  icon?: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$49.99",
    description: "Perfect for startups and small businesses exploring AI automation",
    features: [
      "50 minutes of AI usage per month",
      "Unlimited AI agents",
      "5 concurrent calls",
      "Voice API, LLM, transcriber costs",
      "API integrations",
      "Real-time booking",
      "Human transfer",
      "Community support"
    ],
    buttonText: "Start Testing Now",
    overageFee: "$0.35/minute",
    icon: "🚀"
  },
  {
    name: "Essential",
    price: "$299.99",
    description: "Ideal for small to medium businesses with low call volumes",
    features: [
      "500 minutes of AI usage per month",
      "Unlimited AI agents",
      "10 concurrent calls",
      "All Starter features"
    ],
    buttonText: "Try Essential Free",
    overageFee: "$0.30/minute",
    hasTrial: true,
    trialDays: 7,
    icon: "⭐"
  },
  {
    name: "Basic",
    price: "$749.99",
    description: "Designed for growing businesses with moderate call volumes",
    features: [
      "1,250 minutes of AI usage per month",
      "Unlimited AI agents",
      "25 concurrent calls",
      "All Essential features",
      "Team access",
      "Support via ticketing"
    ],
    buttonText: "Try Basic Free",
    overageFee: "$0.25/minute",
    hasTrial: true,
    trialDays: 7,
    isPopular: true,
    icon: "📈"
  },
  {
    name: "Pro",
    price: "$1,499.99",
    description: "Built for established businesses with high call volumes",
    features: [
      "2,100 minutes of AI usage per month",
      "Unlimited AI agents",
      "50 concurrent calls",
      "All Basic features"
    ],
    buttonText: "Get Pro Now",
    overageFee: "$0.20/minute",
    icon: "💎"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large businesses and agencies with massive call volumes or unique needs",
    features: [
      "Custom minutes of AI usage",
      "Unlimited AI agents",
      "Custom concurrent calls",
      "All Pro features",
      "White-label platform",
      "Unlimited subaccounts"
    ],
    buttonText: "Contact Sales",
    overageFee: "Custom rates",
    icon: "🏢"
  }
];

/**
 * PricingSection - Displays pricing tiers with interactive elements
 */
export const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  return (
    <section id="pricing" className="relative min-h-screen py-32 pb-48 pt-48 bg-gradient-to-b from-[#0a1528] to-[#061022] text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/10 to-transparent" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/5 filter blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/5 filter blur-3xl" />
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <ScrollReveal>
            <AnimatedText
              text="FIND THE PERFECT PLAN FOR YOUR BUSINESS"
              as="h2"
              className="text-4xl md:text-5xl font-bold mb-4 tracking-wider"
              animation="fade"
              stagger={0.03}
            />
            <p className="text-xl text-blue-300 max-w-3xl mx-auto leading-relaxed mb-10">
              Automate tasks with our specialized AI agents—unlimited agents, flexible plans, and no limits on your potential. From customer service to creative consulting, our AI handles it all. Try risk-free with our 7-day trial on Essential and Basic, or contact us for custom Enterprise solutions.
            </p>
          </ScrollReveal>
          
          {/* Billing toggle */}
          <div className="inline-flex items-center bg-blue-900/20 p-1 rounded-full mb-16">
            <button
              className={`px-6 py-2 rounded-full text-sm transition ${
                billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-blue-300'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm transition ${
                billingCycle === 'yearly' ? 'bg-blue-600 text-white' : 'text-blue-300'
              }`}
              onClick={() => setBillingCycle('yearly')}
            >
              Yearly <span className="text-xs font-medium text-emerald-400">Save 10%</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 max-w-7xl mx-auto">
          <AnimatePresence>
            {pricingTiers.map((tier, index) => (
              <ScrollReveal key={tier.name} delay={index * 0.1}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <HoverableCard
                    className={`h-full backdrop-blur-sm rounded-xl overflow-hidden border-2 p-8 relative ${
                      tier.isPopular 
                        ? 'bg-blue-900/30 border-blue-500/50' 
                        : 'bg-gray-900/40 border-gray-700/50'
                    }`}
                    intensity={0.05}
                  >
                    {tier.isPopular && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                          MOST POPULAR
                        </div>
                      </div>
                    )}
                    
                    {tier.hasTrial && (
                      <div className="absolute top-0 left-0">
                        <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-br-lg">
                          {tier.trialDays}-DAY FREE TRIAL
                        </div>
                      </div>
                    )}
                    
                    <div className="text-center mb-6">
                      {tier.icon && (
                        <span className="text-3xl mb-4 inline-block">{tier.icon}</span>
                      )}
                      <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                      <div className="text-blue-300 text-sm mb-4">{tier.description}</div>
                      <div className="flex justify-center items-baseline">
                        <span className="text-4xl font-extrabold">
                          {billingCycle === 'yearly' && tier.price !== 'Custom' 
                            ? `$${(parseFloat(tier.price.replace('$', '')) * 0.9 * 12).toFixed(2)}` // Apply 10% annual discount
                            : tier.price}
                        </span>
                        {tier.price !== 'Custom' && (
                          <span className="text-blue-300 ml-1">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                        )}
                        {tier.overageFee && (
                          <div className="text-xs text-blue-400 mt-1">Overage: {tier.overageFee}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <ul className="space-y-3">
                        {tier.features.map((feature, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            className="flex items-start"
                          >
                            <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span className="text-blue-100">{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-auto">
                      <button
                        className={`w-full py-3 rounded-lg font-medium transition transform hover:scale-105 ${
                          tier.isPopular
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {tier.buttonText}
                      </button>
                    </div>
                  </HoverableCard>
                </motion.div>
              </ScrollReveal>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Enterprise section */}
        <div className="mt-20 max-w-4xl mx-auto bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-8 backdrop-blur-sm border border-blue-500/20">
          <div className="md:flex items-center">
            <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
              <h3 className="text-2xl font-bold mb-4">Need a custom solution?</h3>
              <p className="text-blue-200">
                Our team is ready to build a tailored voice AI integration for your specific business needs.
                Contact us for a personalized demo and custom pricing based on your requirements.
              </p>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-24 text-center">
          <h3 className="text-3xl font-bold mb-12">Frequently Asked Questions</h3>
          <div className="max-w-3xl mx-auto grid gap-6">
            <ScrollReveal>
              <div className="bg-blue-900/20 rounded-lg p-6 backdrop-blur-sm border border-blue-800/30 text-left">
                <h4 className="text-xl font-semibold mb-3">Can I try before I buy?</h4>
                <p className="text-blue-200">
                  Yes, we offer a 7-day free trial with the Essential and Basic plans. No credit card required to get started.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <div className="bg-blue-900/20 rounded-lg p-6 backdrop-blur-sm border border-blue-800/30 text-left">
                <h4 className="text-xl font-semibold mb-3">How does billing work?</h4>
                <p className="text-blue-200">
                  Choose between monthly or annual billing. Annual plans include a 10% discount.
                  You can upgrade or downgrade your plan at any time. Setup fee of $3,000 is waived for annual contracts.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="bg-blue-900/20 rounded-lg p-6 backdrop-blur-sm border border-blue-800/30 text-left">
                <h4 className="text-xl font-semibold mb-3">Can I integrate this with my existing systems?</h4>
                <p className="text-blue-200">
                  Yes, all plans include API integrations. Our Pro and Enterprise plans feature more advanced integration options
                  with custom support available for Enterprise customers.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.3}>
              <div className="bg-blue-900/20 rounded-lg p-6 backdrop-blur-sm border border-blue-800/30 text-left">
                <h4 className="text-xl font-semibold mb-3">Do you have a risk-free guarantee?</h4>
                <p className="text-blue-200">
                  Yes, we offer a risk-free guarantee. Try any plan for 3 months—if your business metrics don't improve by at least 5%, we'll refund you. 
                  We're confident our AI agents will deliver measurable value.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="mt-32 text-center pb-12">
          <ScrollReveal>
            <h3 className="text-3xl font-bold mb-6">Ready to transform your voice AI experience?</h3>
            <p className="text-xl text-blue-300 mb-10 max-w-3xl mx-auto">
              Join thousands of businesses already using Foundations AI to enhance their customer interactions.
            </p>
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-full transition transform hover:scale-105 shadow-lg shadow-blue-600/30">
              Get Started Now
            </button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;