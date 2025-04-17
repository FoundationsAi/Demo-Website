import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { SmoothScroll } from '@/components/smooth-scroll';
import { ParticleBackground } from '@/components/particle-background';
import { ScrollReveal } from '@/components/scroll-reveal';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Set background to black for consistency with the rest of the app
  useEffect(() => {
    document.body.style.background = '#000';
    return () => {
      document.body.style.background = '';
    };
  }, []);
  
  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
          variant: "default"
        });
        navigate('/');
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SmoothScroll options={{ lerp: 0.075 }}>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        {/* Background effects */}
        <ParticleBackground variant="subtle" />
        
        <div className="relative z-10 pt-24 md:pt-32 pb-16 md:pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <ScrollReveal>
              <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white">
                    Welcome Back
                  </h1>
                  <p className="text-base sm:text-lg text-blue-300 px-1">
                    Sign in to access your Foundations AI experience
                  </p>
                </div>
                
                <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-lg border border-blue-500/30 shadow-[0_4px_30px_rgba(0,100,255,0.3)]">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Sign In</CardTitle>
                    <CardDescription className="text-blue-300">
                      Enter your credentials below to continue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-black/50 border-blue-500/50 text-white placeholder-blue-300/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-black/50 border-blue-500/50 text-white"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="gradient-button w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-blue-300 text-center">
                      Don't have an account?{' '}
                      <a 
                        href="/get-started" 
                        className="text-blue-400 hover:text-blue-300 transition underline"
                      >
                        Create one
                      </a>
                    </div>
                  </CardFooter>
                </Card>
                
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