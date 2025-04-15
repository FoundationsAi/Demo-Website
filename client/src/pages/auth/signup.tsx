import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { MountainLogo } from "@/components/mountain-logo";

// Define the form schema
const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  companyName: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const Signup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Initialize form
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      acceptTerms: false,
    },
  });

  // Handle form submission
  const onSubmit = async (values: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Signup failed");
      }
      
      // Successful signup
      toast({
        title: "Success",
        description: "Your account has been created. You will be redirected to choose a subscription plan.",
      });
      
      // Redirect to subscription plans
      setTimeout(() => {
        setLocation("/subscriptions/plans");
      }, 1500);
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1528] to-[#061022] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <MountainLogo className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create an Account</h1>
          <p className="text-blue-300">Join Foundations AI and transform your business</p>
        </div>
        
        <Card className="border-blue-500/20 bg-gradient-to-b from-blue-950/40 to-blue-900/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-center text-white">Sign Up</CardTitle>
            <CardDescription className="text-center text-blue-300">
              Enter your details to create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Smith" 
                          {...field} 
                          className="bg-blue-950/40 border-blue-500/30 text-white" 
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
                          placeholder="you@example.com" 
                          {...field} 
                          className="bg-blue-950/40 border-blue-500/30 text-white" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Company Name (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Your Company" 
                          {...field} 
                          className="bg-blue-950/40 border-blue-500/30 text-white" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white">Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="••••••••" 
                            {...field} 
                            className="bg-blue-950/40 border-blue-500/30 text-white" 
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
                            placeholder="••••••••" 
                            {...field} 
                            className="bg-blue-950/40 border-blue-500/30 text-white" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border border-blue-900/50">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-blue-100">
                          I agree to the{" "}
                          <Link href="/terms">
                            <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                              Terms of Service
                            </span>
                          </Link>
                          {" "}and{" "}
                          <Link href="/privacy">
                            <span className="text-blue-400 hover:text-blue-300 cursor-pointer">
                              Privacy Policy
                            </span>
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-0">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-blue-800"></span>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-blue-950/40 px-2 text-blue-400">Or</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full border-blue-500/30 text-blue-300 hover:text-white hover:bg-blue-800/30">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"
                  fill="currentColor"
                />
              </svg>
              Sign up with Google
            </Button>
            
            <div className="text-center mt-4">
              <span className="text-blue-300 text-sm">
                Already have an account?{" "}
                <Link href="/auth/login">
                  <span className="text-blue-400 hover:text-blue-300 cursor-pointer font-medium">
                    Login
                  </span>
                </Link>
              </span>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center mt-8">
          <Link href="/">
            <span className="text-blue-400 hover:text-blue-300 text-sm cursor-pointer">
              ← Back to home
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;