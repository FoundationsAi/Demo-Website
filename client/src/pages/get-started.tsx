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

const GetStarted: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, navigate] = useLocation();
  const { signup, isAuthenticated } = useAuth();
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
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields to continue.",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await signup(name, email, password);
      
      if (success) {
        toast({
          title: "Account created",
          description: "Welcome to Foundations AI! Redirecting to pricing...",
          variant: "default"
        });
        navigate('/pricing');
      } else {
        toast({
          title: "Signup failed",
          description: "An error occurred while creating your account. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Signup error",
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
                    Join Foundations AI
                  </h1>
                  <p className="text-base sm:text-lg text-blue-300 px-1">
                    Create your account to start your immersive AI experience
                  </p>
                </div>
                
                <Card className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-lg border border-blue-500/30 shadow-[0_4px_30px_rgba(0,100,255,0.3)]">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Create Account</CardTitle>
                    <CardDescription className="text-blue-300">
                      Fill in your details to get started
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">Full Name</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-black/50 border-blue-500/50 text-white placeholder-blue-300/50"
                        />
                      </div>
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
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-black/50 border-blue-500/50 text-white"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="gradient-button w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                      </Button>
                    </form>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <div className="text-sm text-blue-300 text-center">
                      Already have an account?{' '}
                      <a 
                        href="/login" 
                        className="text-blue-400 hover:text-blue-300 transition underline"
                      >
                        Sign in
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
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-600/40 flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                    <div className="text-purple-200 text-xl sm:text-2xl">🔐</div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">Secure Conversations</h3>
                  <p className="text-sm sm:text-base text-purple-200 text-center">Store and manage your conversations securely in your private account dashboard</p>
                </div>
                
                <div className="bg-gradient-to-b from-indigo-900/15 to-blue-900/15 backdrop-blur-lg p-4 sm:p-5 md:p-6 rounded-xl border border-indigo-500/30 shadow-[0_4px_15px_rgba(99,102,241,0.2)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.3)] transition-all duration-300 hover:scale-[1.03]">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500/40 to-indigo-600/40 flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                    <div className="text-indigo-200 text-xl sm:text-2xl">⚡</div>
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