import React, { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedText } from "@/components/animated-text";
import { apiRequest } from "@/lib/api";
import { Loader2 } from "lucide-react";

// Create a schema for the signup form
const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }).max(20),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get plan details from URL query parameters
  const searchParams = new URLSearchParams(window.location.search);
  const plan = searchParams.get("plan") || "";
  const amount = searchParams.get("amount") || "";
  const cycle = searchParams.get("cycle") || "monthly";
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: ""
    }
  });
  
  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Creating account with data:", { ...data, plan, amount, cycle });
      
      // First, create the user account
      const createUserResponse = await apiRequest("POST", "/api/users", {
        name: data.name,
        email: data.email,
        username: data.username,
        password: data.password
      });
      
      const userData = await createUserResponse.json();
      
      if (!userData.id) {
        throw new Error("Failed to create user account");
      }
      
      console.log("User created successfully:", userData);
      
      // Now create a subscription for this user
      const createSubscriptionResponse = await apiRequest("POST", "/api/create-subscription", {
        userId: userData.id,
        plan,
        amount: Number(amount),
        cycle,
        email: data.email,
        name: data.name
      });
      
      const subscriptionData = await createSubscriptionResponse.json();
      
      if (subscriptionData.error) {
        throw new Error(subscriptionData.error);
      }
      
      if (subscriptionData.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = subscriptionData.checkoutUrl;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setError(error.message || "Failed to create account. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 to-blue-950">
      <Header />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="border border-blue-600/30 bg-gradient-to-b from-blue-900/40 to-blue-950/60 backdrop-blur-sm">
            <CardHeader className="space-y-1">
              <AnimatedText
                text="Create Your Account"
                as={CardTitle}
                className="text-2xl font-bold text-center text-white"
                animation="slide"
              />
              <CardDescription className="text-center text-blue-200">
                {plan && amount
                  ? `Sign up to continue with your ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan subscription`
                  : "Create an account to get started with Foundations AI"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            className="bg-blue-950/50 border-blue-700 text-white" 
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
                        <FormLabel className="text-white">Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your email address" 
                            type="email" 
                            {...field} 
                            className="bg-blue-950/50 border-blue-700 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Choose a username" 
                            {...field} 
                            className="bg-blue-950/50 border-blue-700 text-white" 
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
                            placeholder="Create a password" 
                            type="password" 
                            {...field} 
                            className="bg-blue-950/50 border-blue-700 text-white" 
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
                            placeholder="Confirm your password" 
                            type="password" 
                            {...field} 
                            className="bg-blue-950/50 border-blue-700 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {error && (
                    <div className="bg-red-900/30 text-red-300 p-3 rounded-md border border-red-800 text-sm">
                      {error}
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account & Continue"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm text-blue-300">
                Already have an account?{" "}
                <Button 
                  variant="link" 
                  className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                  onClick={() => setLocation("/login")}
                >
                  Log in
                </Button>
              </div>
              
              <div className="text-xs text-blue-400/70 text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Signup;