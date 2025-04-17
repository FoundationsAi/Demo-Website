import React from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '@/contexts/auth-context';

interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  path: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  component: Component, 
  path 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <Route
      path={path}
      component={() =>
        isAuthenticated ? (
          <Component />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};