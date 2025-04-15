import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SmoothScroll } from '@/components/smooth-scroll';
import { ParticleBackground } from '@/components/particle-background';
import { ScrollReveal } from '@/components/scroll-reveal';
import { AnimatedText } from '@/components/animated-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/layout/header';

// Sign up form schema
const signupSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const GetStarted = () => {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Ensure that we're not accidentally mounting this component on a different route
  useEffect(() => {
    if (location !== '/get-started') {
      console.log('GetStarted component mounted but location is:', location);
      navigate('/get-started', { replace: true });
    }
  }, [location, navigate]);

  // Set background to black for consistency with home page
  useEffect(() => {
    document.body.style.background = '#000';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  // Form definition
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, we would call an API endpoint here
      // For now, just simulate a signup attempt
      console.log('Signup attempt with:', values);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success toast message
      toast({
        title: "Account created!",
        description: "Welcome to Foundations AI. Your account has been created successfully.",
        variant: "default",
      });
      
      // Navigate to home page after successful signup
      navigate('/');
    } catch (error) {
      console.error('Signup error:', error);
      
      // Show error toast message
      toast({
        title: "Signup failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SmoothScroll options={{ lerp: 0.075 }}>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        {/* Background effects */}
        <ParticleBackground variant="subtle" />
        
        <div className="relative z-10 pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <ScrollReveal>
              <div className="w-full max-w-[90%] sm:max-w-md mx-auto">
                <div className="text-center mb-8">
                  <AnimatedText 
                    text="Join Foundations AI" 
                    as="h1" 
                    className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4"
                    animation="slide"
                    stagger={0.05}
                  />
                  <p className="text-base sm:text-lg text-blue-300 px-1">
                    Create your account to start your immersive AI experience
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-lg p-5 sm:p-6 md:p-8 rounded-xl border border-blue-500/30 shadow-[0_4px_30px_rgba(0,100,255,0.3)]">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Choose a username" 
                                className="bg-black/50 border-blue-500/50 text-white" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Enter your email address" 
                                className="bg-black/50 border-blue-500/50 text-white" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a strong password" 
                                className="bg-black/50 border-blue-500/50 text-white" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Confirm your password" 
                                className="bg-black/50 border-blue-500/50 text-white" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          className="w-full gradient-button" 
                          disabled={isLoading}
                        >
                          {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
                
                <div className="text-center mt-8">
                  <p className="text-blue-300">
                    Already have an account?{' '}
                    <Link 
                      href="/login" 
                      className="text-blue-400 hover:text-blue-300 transition font-medium"
                    >
                      Login
                    </Link>
                  </p>
                </div>
                
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    className="text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 bg-transparent"
                    onClick={() => navigate('/')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Home
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
        
        {/* Benefits section */}
        <div className="relative z-10 py-16 bg-gradient-to-b from-black/0 to-blue-950/20">
          <div className="container mx-auto px-4 md:px-6">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">Why Create an Account?</h2>
                <p className="text-base sm:text-lg md:text-xl text-blue-300 px-2">Unlock the full potential of Foundations AI with exclusive member benefits</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-gradient-to-b from-blue-900/15 to-indigo-900/15 backdrop-blur-lg p-4 sm:p-5 md:p-6 rounded-xl border border-blue-500/30 shadow-[0_4px_15px_rgba(0,100,255,0.2)] hover:shadow-[0_4px_25px_rgba(0,100,255,0.3)] transition-all duration-300 hover:scale-[1.03]">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500/40 to-blue-600/40 flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                    <div className="text-blue-200 text-xl sm:text-2xl">💬</div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">Personalized Agents</h3>
                  <p className="text-sm sm:text-base text-blue-200 text-center">Create and customize your own voice AI agents tailored to your specific needs</p>
                </div>
                
                <div className="bg-gradient-to-b from-purple-900/15 to-indigo-900/15 backdrop-blur-lg p-4 sm:p-5 md:p-6 rounded-xl border border-purple-500/30 shadow-[0_4px_15px_rgba(147,51,234,0.2)] hover:shadow-[0_4px_25px_rgba(147,51,234,0.3)] transition-all duration-300 hover:scale-[1.03]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-600/40 flex items-center justify-center mb-4 mx-auto shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                    <div className="text-purple-200 text-2xl">🔐</div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">Secure Conversations</h3>
                  <p className="text-sm sm:text-base text-purple-200 text-center">Store and manage your conversations securely in your private account dashboard</p>
                </div>
                
                <div className="bg-gradient-to-b from-indigo-900/15 to-blue-900/15 backdrop-blur-lg p-4 sm:p-5 md:p-6 rounded-xl border border-indigo-500/30 shadow-[0_4px_15px_rgba(99,102,241,0.2)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.3)] transition-all duration-300 hover:scale-[1.03]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/40 to-indigo-600/40 flex items-center justify-center mb-4 mx-auto shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                    <div className="text-indigo-200 text-2xl">⚡</div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">Premium Features</h3>
                  <p className="text-sm sm:text-base text-indigo-200 text-center">Access exclusive features like voice customization, longer conversations, and priority support</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </SmoothScroll>
  );
};

export default GetStarted;