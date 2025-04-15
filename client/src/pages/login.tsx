import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';

const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950 p-4">
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/95 shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-zinc-400">
            Don't have an account?{' '}
            <Link href="/register">
              <a className="text-primary underline hover:text-primary/80">
                Sign up
              </a>
            </Link>
          </div>
          <div className="text-center text-sm text-zinc-400">
            <Link href="/forgot-password">
              <a className="text-primary underline hover:text-primary/80">
                Forgot your password?
              </a>
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;