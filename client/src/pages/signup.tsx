import React, { useState, useEffect } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { ScrollReveal } from "@/components/scroll-reveal";
import { Loader2, ArrowLeft } from "lucide-react";
import { Header } from "@/components/layout/header";
import { AnimatedText } from "@/components/animated-text";

// Form validation schema
const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

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

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });
  
  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to create account");
      }
      
      toast({
        title: "Account created!",
        description: "You have been registered successfully.",
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
        title: "Registration failed",
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
          className="w-full max-w-lg"
        >
          <motion.div variants={itemVariants} className="mb-8 text-center">
            <Button 
              variant="ghost" 
              className="mb-6 text-white/70 hover:text-white"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <AnimatedText 
              text="Create an Account" 
              as="h1" 
              className="text-3xl md:text-4xl font-bold mb-2 text-white" 
              animation="gradient"
              color="#6366F1"
            />
            <p className="text-white/70">
              {planId ? "Complete your registration to activate your plan" : "Sign up to access AI voice agents"}
            </p>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="bg-slate-900/50 border border-white/10 backdrop-blur-md text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Sign Up</CardTitle>
                <CardDescription className="text-white/70">
                  Fill in your details to get started
                </CardDescription>
              </CardHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">First Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="John" 
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-white/50 focus:border-indigo-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">Last Name</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Doe" 
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-white/50 focus:border-indigo-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="johndoe" 
                              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-white/50 focus:border-indigo-500"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="john.doe@example.com" 
                              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-white/50 focus:border-indigo-500"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-white/50 focus:border-indigo-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white/90">Confirm Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-white/50 focus:border-indigo-500"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex flex-col space-y-4 border-t border-white/10 bg-slate-900/20">
                    <Button 
                      type="submit" 
                      className="w-full bg-[#5D5FEF] hover:bg-[#4B4DDC] text-white font-medium rounded-full py-5 h-auto" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Sign Up"
                      )}
                    </Button>
                    
                    <div className="text-center text-sm mt-2 text-white/70">
                      Already have an account?{" "}
                      <a
                        href="/login"
                        className="text-indigo-400 hover:text-indigo-300 font-medium"
                        onClick={(e) => {
                          e.preventDefault();
                          setLocation("/login" + (planId ? `?plan=${planId}` : ""));
                        }}
                      >
                        Sign In
                      </a>
                    </div>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}