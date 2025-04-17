import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { SmoothScroll } from '@/components/smooth-scroll';
import { ParticleBackground } from '@/components/particle-background';
import { ScrollReveal } from '@/components/scroll-reveal';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { useToast } from '@/hooks/use-toast';
import { pricingPlans, redirectToCheckout } from '@/lib/stripe-service';

const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { user, isSignedIn, isLoaded } = useUser();
  
  // Set background to black for consistency with the rest of the app
  React.useEffect(() => {
    document.body.style.background = '#000';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  // If not signed in, redirect to sign up page
  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/get-started');
    }
  }, [isLoaded, isSignedIn, navigate]);

  const handlePlanSelect = async (planId: string) => {
    if (!isSignedIn || !user) {
      navigate('/get-started');
      return;
    }
    
    setIsProcessing(planId);
    
    try {
      // Get Stripe customer ID from user metadata if available
      const customerId = user.publicMetadata.stripeCustomerId as string | undefined;
      
      // Redirect to Stripe checkout
      await redirectToCheckout(planId, user.id, customerId);
    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: 'Checkout Error',
        description: 'There was a problem starting the checkout process. Please try again.',
        variant: 'destructive',
      });
      setIsProcessing(null);
    }
  };

  // Show loading state while Clerk is checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <SmoothScroll options={{ lerp: 0.075 }}>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        {/* Background effects */}
        <ParticleBackground variant="subtle" />
        
        <section className="relative min-h-screen py-32 pb-48 pt-48 text-white overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-900/10 to-transparent" />
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/5 filter blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-600/5 filter blur-3xl" />
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <ScrollReveal>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 px-4 text-white">
                  CHOOSE YOUR FOUNDATIONS AI PLAN
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-blue-300 max-w-3xl mx-auto leading-relaxed px-4 mb-6 sm:mb-8">
                  Automate tasks with our specialized AI agents. From customer service to creative consulting, our AI handles it all. Subscribe today to get started.
                </p>
              </ScrollReveal>
              
              {/* Billing toggle */}
              <div className="inline-flex items-center bg-blue-900/20 p-1 rounded-full mb-10 sm:mb-12 md:mb-16 text-xs sm:text-sm">
                <button
                  className={`px-3 sm:px-4 md:px-6 py-2 rounded-full transition ${
                    billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-blue-300'
                  }`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`px-3 sm:px-4 md:px-6 py-2 rounded-full transition ${
                    billingCycle === 'yearly' ? 'bg-blue-600 text-white' : 'text-blue-300'
                  }`}
                  onClick={() => setBillingCycle('yearly')}
                >
                  Yearly <span className="text-xs font-medium text-emerald-400 hidden xs:inline">Save 10%</span>
                </button>
              </div>
            </div>
            
            {/* Pricing plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
              {pricingPlans.map((plan, index) => (
                <ScrollReveal key={plan.id} delay={index * 0.1}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="h-full flex flex-col bg-[#0e1c35] rounded-xl overflow-hidden relative">
                      {/* Badge area at top */}
                      <div className="flex justify-between">
                        <div></div>
                        {plan.isPopular && (
                          <div className="bg-blue-600 text-white font-bold py-2 px-4 text-sm rounded-bl-lg ml-auto">
                            {plan.name === 'Essential' ? 'POPULAR' : 'MOST POPULAR'}
                          </div>
                        )}
                      </div>
                      
                      {/* Plan name and description */}
                      <div className="text-center mt-4 px-6">
                        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                        <div className="text-blue-300 mb-4">{plan.description}</div>
                      </div>
                      
                      {/* Price */}
                      <div className="text-center px-6 pb-6">
                        <div className="text-4xl font-bold text-white">
                          {billingCycle === 'yearly' 
                            ? parseInt(plan.price.replace('$', '')) * 0.9 
                            : plan.price}
                          <span className="text-xl">/mo</span>
                        </div>
                        {billingCycle === 'yearly' && (
                          <div className="text-sm text-emerald-400 mt-1">Save 10% with annual billing</div>
                        )}
                      </div>
                      
                      {/* Features */}
                      <div className="px-6 flex-grow">
                        <ul className="space-y-3 mb-6">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                              <span className="text-sm text-blue-100">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Button */}
                      <div className="px-6 pb-6">
                        <Button 
                          className={`w-full py-6 rounded-lg font-medium text-lg ${
                            plan.isPopular
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-transparent hover:bg-blue-900/50 text-white border border-blue-500'
                          }`}
                          onClick={() => handlePlanSelect(plan.id)}
                          disabled={isProcessing === plan.id}
                        >
                          {isProcessing === plan.id ? (
                            <span className="flex items-center justify-center">
                              <span className="animate-spin mr-2 h-5 w-5 border-t-2 border-b-2 border-white rounded-full"></span>
                              Processing...
                            </span>
                          ) : (
                            <span className="flex items-center justify-center">
                              Subscribe <ArrowRight className="ml-2 h-5 w-5" />
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
            
            {/* Enterprise section */}
            <div className="mt-16 md:mt-20 mx-auto px-4 w-full max-w-4xl">
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl p-5 sm:p-8 backdrop-blur-sm border border-blue-500/20">
                <div className="md:flex items-center">
                  <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">Need a custom solution?</h3>
                    <p className="text-sm sm:text-base text-blue-200">
                      Our team is ready to build a tailored voice AI integration for your specific business needs.
                      Contact us for a personalized demo and custom pricing based on your requirements.
                    </p>
                  </div>
                  <div className="md:w-1/3">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg">
                      Contact Sales
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* FAQ section */}
            <div className="mt-20 sm:mt-24 md:mt-32 px-4 max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-12">
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">Frequently Asked Questions</h3>
                <p className="text-blue-300">Have questions? We're here to help.</p>
              </div>
              
              <ScrollReveal>
                <div className="bg-blue-900/20 rounded-lg p-4 md:p-6 backdrop-blur-sm border border-blue-800/30 text-left">
                  <h4 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">How does billing work?</h4>
                  <p className="text-sm md:text-base text-blue-200">
                    Choose between monthly or annual billing. Annual plans include a 10% discount.
                    You can upgrade or downgrade your plan at any time.
                  </p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.2}>
                <div className="bg-blue-900/20 rounded-lg p-4 md:p-6 backdrop-blur-sm border border-blue-800/30 text-left">
                  <h4 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Can I integrate this with my existing systems?</h4>
                  <p className="text-sm md:text-base text-blue-200">
                    Yes, all plans include API integrations. Our Pro and Enterprise plans feature more advanced integration options
                    with custom support available for Enterprise customers.
                  </p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal delay={0.3}>
                <div className="bg-blue-900/20 rounded-lg p-4 md:p-6 backdrop-blur-sm border border-blue-800/30 text-left">
                  <h4 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">Do you have a risk-free guarantee?</h4>
                  <p className="text-sm md:text-base text-blue-200">
                    Yes, we offer a risk-free guarantee. Try any plan for 30 days—if you're not satisfied, we'll refund you.
                    We're confident our AI agents will deliver outstanding results for your business.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </div>
    </SmoothScroll>
  );
};

export default Pricing;