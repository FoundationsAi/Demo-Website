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
  icon?: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "$49",
    description: "Perfect for individuals and small projects",
    features: [
      "3 AI Voice Agents",
      "100 messages per month",
      "Basic customization",
      "Email support",
      "Single user"
    ],
    buttonText: "Get Started",
    icon: "🚀"
  },
  {
    name: "Professional",
    price: "$99",
    description: "Enhanced features for growing businesses",
    features: [
      "All 11 AI Voice Agents",
      "1,000 messages per month",
      "Advanced customization",
      "Priority support",
      "5 team members",
      "Analytics dashboard"
    ],
    isPopular: true,
    buttonText: "Choose Professional",
    icon: "⭐"
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Tailored solutions for large organizations",
    features: [
      "Unlimited AI Voice Agents",
      "Unlimited messages",
      "Full customization",
      "Dedicated support",
      "Unlimited team members",
      "Advanced analytics",
      "Custom integration",
      "On-premise option"
    ],
    buttonText: "Contact Sales",
    icon: "🏢"
  }
];

/**
 * PricingSection - Displays pricing tiers with interactive elements
 */
export const PricingSection: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  
  return (
    <section id="pricing" className="relative min-h-screen py-32 pb-48 pt-40 bg-gradient-to-b from-[#0a1528] to-[#061022] text-white overflow-hidden">
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
              text="PRICING PLANS"
              as="h2"
              className="text-4xl md:text-5xl font-bold mb-4 tracking-wider"
              animation="fade"
              stagger={0.03}
            />
            <p className="text-xl text-blue-300 max-w-3xl mx-auto leading-relaxed mb-10">
              Choose the perfect plan to harness the power of our voice AI technology
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
              Yearly <span className="text-xs font-medium text-emerald-400">Save 20%</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                    
                    <div className="text-center mb-6">
                      {tier.icon && (
                        <span className="text-3xl mb-4 inline-block">{tier.icon}</span>
                      )}
                      <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                      <div className="text-blue-300 text-sm mb-4">{tier.description}</div>
                      <div className="flex justify-center items-baseline">
                        <span className="text-4xl font-extrabold">
                          {billingCycle === 'yearly' && tier.price !== 'Custom' 
                            ? tier.price.replace('$', '$') + '0' // Apply 20% discount
                            : tier.price}
                        </span>
                        {tier.price !== 'Custom' && (
                          <span className="text-blue-300 ml-1">/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
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
                  Yes, we offer a 14-day free trial with the Starter plan. No credit card required to get started.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.1}>
              <div className="bg-blue-900/20 rounded-lg p-6 backdrop-blur-sm border border-blue-800/30 text-left">
                <h4 className="text-xl font-semibold mb-3">How does billing work?</h4>
                <p className="text-blue-200">
                  Choose between monthly or annual billing. Annual plans include a 20% discount.
                  You can upgrade or downgrade your plan at any time.
                </p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2}>
              <div className="bg-blue-900/20 rounded-lg p-6 backdrop-blur-sm border border-blue-800/30 text-left">
                <h4 className="text-xl font-semibold mb-3">Can I integrate this with my existing systems?</h4>
                <p className="text-blue-200">
                  Yes, our Professional and Enterprise plans include API access for integration with your existing systems.
                  Our Enterprise plan includes custom integration support.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
        
        {/* CTA section */}
        <div className="mt-24 text-center">
          <ScrollReveal>
            <h3 className="text-3xl font-bold mb-6">Ready to transform your voice AI experience?</h3>
            <p className="text-xl text-blue-300 mb-10 max-w-3xl mx-auto">
              Join thousands of businesses already using Foundations AI to enhance their customer interactions.
            </p>
            <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-medium rounded-full transition transform hover:scale-105">
              Get Started Now
            </button>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;