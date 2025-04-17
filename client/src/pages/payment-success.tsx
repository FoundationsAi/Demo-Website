import React, { useEffect, useState } from 'react';
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

const PaymentSuccess: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, isSignedIn, isLoaded } = useUser();
  const { toast } = useToast();
  const [planName, setPlanName] = useState<string>('');
  
  // Set background to black for consistency with the rest of the app
  useEffect(() => {
    document.body.style.background = '#000';
    return () => {
      document.body.style.background = '';
    };
  }, []);
  
  // Get subscription plan information from user metadata
  useEffect(() => {
    if (isLoaded && user) {
      // Get subscription plan from user metadata
      const plan = user.publicMetadata.subscriptionPlan as string;
      
      // Set plan name based on plan ID
      switch (plan) {
        case 'starter':
          setPlanName('Starter');
          break;
        case 'essential':
          setPlanName('Essential');
          break;
        case 'basic':
          setPlanName('Basic');
          break;
        case 'pro':
          setPlanName('Pro');
          break;
        default:
          setPlanName('Premium');
      }
      
      // Show success toast
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated.",
        variant: "default",
      });
    }
  }, [isLoaded, user, toast]);

  // If not signed in, redirect to home page
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Show loading state while Clerk is checking authentication
  if (!isLoaded || !isSignedIn) {
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
        
        <section className="relative py-20 sm:py-32 text-white">
          <div className="container mx-auto px-6 relative z-10">
            <ScrollReveal>
              <div className="flex flex-col items-center justify-center max-w-3xl mx-auto text-center">
                <div className="mb-8 w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                  Subscription Activated!
                </h1>
                
                <p className="text-lg sm:text-xl text-blue-300 mb-8">
                  Thank you for subscribing to our {planName} plan. Your account has been successfully upgraded.
                </p>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-lg p-5 sm:p-8 rounded-xl border border-blue-500/30 w-full mb-8">
                  <h3 className="text-xl font-bold mb-4">Your {planName} Plan Includes:</h3>
                  
                  <div className="text-left space-y-3">
                    {getPlanFeatures(planName).map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-blue-100">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button
                    className="gradient-button px-8 py-6 text-lg"
                    onClick={() => navigate('/chat')}
                  >
                    Start Using AI <ArrowRight className="ml-2" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="border-blue-500/30 text-blue-300 hover:text-blue-100 px-8 py-6 text-lg"
                    onClick={() => navigate('/account')}
                  >
                    Manage Account
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </SmoothScroll>
  );
};

// Helper function to get features based on plan name
function getPlanFeatures(planName: string): string[] {
  switch (planName) {
    case 'Starter':
      return [
        'AI voice agent access',
        'Basic voice customization',
        'Customer service bot',
        '100 minutes/month',
        'Email support',
      ];
    case 'Essential':
      return [
        'Multiple voice agents',
        'Custom voice training',
        '500 minutes/month',
        'Priority email support',
        'Basic analytics',
      ];
    case 'Basic':
      return [
        'Advanced voice customization',
        'Multiple agent types',
        '1,500 minutes/month',
        'Phone & email support',
        'Advanced analytics',
        'API access',
      ];
    case 'Pro':
      return [
        'Unlimited voice agents',
        'Full customization suite',
        '5,000 minutes/month',
        '24/7 priority support',
        'Enterprise analytics',
        'Advanced API access',
        'Dedicated account manager',
      ];
    default:
      return [
        'AI voice agent access',
        'Voice customization',
        'Multiple agent types',
        'Priority support',
      ];
  }
}

export default PaymentSuccess;