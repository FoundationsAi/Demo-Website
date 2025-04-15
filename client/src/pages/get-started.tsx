import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'wouter';
import { motion } from 'framer-motion';
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
        
        <div className="relative z-10 pt-32 pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <ScrollReveal>
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <AnimatedText 
                    text="Join Foundations AI" 
                    as="h1" 
                    className="text-4xl md:text-5xl font-bold mb-4"
                    animation="slide"
                    stagger={0.05}
                  />
                  <p className="text-lg text-blue-300">
                    Create your account to start your immersive AI experience
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-lg p-8 rounded-xl border border-blue-500/30 shadow-[0_4px_30px_rgba(0,100,255,0.3)]">
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
                    <a 
                      href="/login" 
                      className="text-blue-400 hover:text-blue-300 transition font-medium"
                    >
                      Login
                    </a>
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
        
        {/* Benefits section */}
        <div className="relative z-10 py-16 bg-gradient-to-b from-black/0 to-blue-950/20">
          <div className="container mx-auto px-4 md:px-6">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Why Create an Account?</h2>
                <p className="text-xl text-blue-300">Unlock the full potential of Foundations AI with exclusive member benefits</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gradient-to-b from-blue-900/15 to-indigo-900/15 backdrop-blur-lg p-6 rounded-xl border border-blue-500/30 shadow-[0_4px_15px_rgba(0,100,255,0.2)] hover:shadow-[0_4px_25px_rgba(0,100,255,0.3)] transition-all duration-300 hover:scale-[1.03]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/40 to-blue-600/40 flex items-center justify-center mb-4 mx-auto shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                    <div className="text-blue-200 text-2xl">💬</div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 text-center">Personalized Agents</h3>
                  <p className="text-blue-200 text-center">Create and customize your own voice AI agents tailored to your specific needs</p>
                </div>
                
                <div className="bg-gradient-to-b from-purple-900/15 to-indigo-900/15 backdrop-blur-lg p-6 rounded-xl border border-purple-500/30 shadow-[0_4px_15px_rgba(147,51,234,0.2)] hover:shadow-[0_4px_25px_rgba(147,51,234,0.3)] transition-all duration-300 hover:scale-[1.03]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-600/40 flex items-center justify-center mb-4 mx-auto shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                    <div className="text-purple-200 text-2xl">🔐</div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 text-center">Secure Conversations</h3>
                  <p className="text-purple-200 text-center">Store and manage your conversations securely in your private account dashboard</p>
                </div>
                
                <div className="bg-gradient-to-b from-indigo-900/15 to-blue-900/15 backdrop-blur-lg p-6 rounded-xl border border-indigo-500/30 shadow-[0_4px_15px_rgba(99,102,241,0.2)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.3)] transition-all duration-300 hover:scale-[1.03]">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500/40 to-indigo-600/40 flex items-center justify-center mb-4 mx-auto shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                    <div className="text-indigo-200 text-2xl">⚡</div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3 text-center">Premium Features</h3>
                  <p className="text-indigo-200 text-center">Access exclusive features like voice customization, longer conversations, and priority support</p>
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