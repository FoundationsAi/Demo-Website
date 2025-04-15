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

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  
  // Ensure that we're not accidentally mounting this component on a different route
  useEffect(() => {
    if (location !== '/login') {
      console.log('Login component mounted but location is:', location);
      navigate('/login', { replace: true });
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
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      // In a real implementation, we would call an API endpoint here
      // For now, just simulate a login attempt
      console.log('Login attempt with:', values);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success toast message
      toast({
        title: "Login successful!",
        description: "Welcome back to Foundations AI.",
        variant: "default",
      });
      
      // Navigate to home page after successful login
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      
      // Show error toast message
      toast({
        title: "Login failed",
        description: "Invalid username or password. Please try again.",
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
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white">
                    Welcome Back
                  </h1>
                  <p className="text-base sm:text-lg text-blue-300 px-1">
                    Sign in to access your Foundations AI experience
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-lg p-5 sm:p-6 md:p-8 rounded-xl border border-blue-500/30 shadow-[0_4px_30px_rgba(0,100,255,0.3)]">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your username" 
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
                                placeholder="Enter your password" 
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
                          {isLoading ? 'Logging in...' : 'Login'}
                        </Button>
                      </div>
                      
                      <div className="text-center text-sm mt-4">
                        <Link href="#" className="text-blue-400 hover:text-blue-300 transition">
                          Forgot your password?
                        </Link>
                      </div>
                    </form>
                  </Form>
                </div>
                
                <div className="text-center mt-8">
                  <p className="text-blue-300">
                    Don't have an account?{' '}
                    <Link 
                      href="/get-started" 
                      className="text-blue-400 hover:text-blue-300 transition font-medium"
                    >
                      Get Started
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
      </div>
    </SmoothScroll>
  );
};

export default Login;