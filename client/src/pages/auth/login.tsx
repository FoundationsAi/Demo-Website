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
import { MountainLogo } from "@/components/mountain-logo";

// Define the form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Initialize form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }
      
      // Successful login
      toast({
        title: "Success",
        description: "You've successfully logged in",
      });
      
      // Redirect to dashboard
      setLocation("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login. Please try again.",
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
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-blue-300">Sign in to your Foundations AI account</p>
        </div>
        
        <Card className="border-blue-500/20 bg-gradient-to-b from-blue-950/40 to-blue-900/20 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-xl text-center text-white">Login to Your Account</CardTitle>
            <CardDescription className="text-center text-blue-300">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                
                <div className="flex justify-end">
                  <Link href="/auth/reset-password">
                    <span className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">
                      Forgot password?
                    </span>
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
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
                <span className="bg-blue-950/40 px-2 text-blue-400">Or continue with</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full border-blue-500/30 text-blue-300 hover:text-white hover:bg-blue-800/30">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"
                  fill="currentColor"
                />
              </svg>
              Sign in with Google
            </Button>
            
            <div className="text-center mt-4">
              <span className="text-blue-300 text-sm">
                Don't have an account?{" "}
                <Link href="/auth/signup">
                  <span className="text-blue-400 hover:text-blue-300 cursor-pointer font-medium">
                    Sign up
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

export default Login;