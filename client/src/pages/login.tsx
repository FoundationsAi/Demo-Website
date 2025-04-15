import React, { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Loader2, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { AnimatedText } from "@/components/animated-text";

// Form validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
}).required();

type LoginFormValues = z.infer<typeof loginSchema>;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Get plan ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const planId = urlParams.get('plan');
  
  // Ensure black background
  useEffect(() => {
    document.body.style.background = '#000';
    return () => {
      document.body.style.background = '';
    };
  }, []);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to login");
      }
      
      toast({
        title: "Welcome back!",
        description: "You have been logged in successfully.",
      });
      
      // If there's a plan ID, redirect to subscription page
      if (planId) {
        setLocation(`/subscribe?plan=${planId}`);
      } else {
        // Otherwise redirect to dashboard
        setLocation("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      
      {/* Background with subtle animated gradient */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-900/20 to-black"></div>
      
      {/* Animated particles/stars */}
      <div className="fixed inset-0 -z-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.3
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <div className="flex-grow flex items-center justify-center p-4 pt-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <Button 
              variant="ghost" 
              className="mb-6 text-[#4F9BFF] hover:text-[#7FB5FF] transition-colors"
              onClick={() => {
                console.log("Navigating to home...");
                window.location.href = "/";
              }}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <AnimatedText 
              text="Welcome Back" 
              as="h1" 
              className="text-3xl md:text-4xl font-bold mb-2 text-white" 
              animation="gradient"
              color="#4F9BFF"
            />
            <p className="text-white/70">Sign in to access your AI voice agents</p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-900/50 border border-white/10 backdrop-blur-md text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Sign In</CardTitle>
                <CardDescription className="text-white/70">
                  Enter your credentials to continue
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">                
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-white/50 focus:border-indigo-500"
                      {...form.register("email")}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-white/50 focus:border-indigo-500"
                      {...form.register("password")}
                    />
                    {form.formState.errors.password && (
                      <p className="text-sm text-red-400">{form.formState.errors.password.message}</p>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4 border-t border-white/10 bg-slate-900/20">
                  <Button 
                    type="submit" 
                    className="w-full bg-[#4F9BFF] hover:bg-[#3E7DD5] text-white font-medium rounded-full py-5 h-auto" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  
                  <div className="text-center text-sm mt-2 text-white/70">
                    Don't have an account?{" "}
                    <a
                      href="/signup"
                      className="text-[#4F9BFF] hover:text-[#7FB5FF] font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        setLocation("/signup" + (planId ? `?plan=${planId}` : ""));
                      }}
                    >
                      Create Account
                    </a>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}