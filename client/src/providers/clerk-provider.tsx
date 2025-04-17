import React from 'react';
import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';

// ClerkProvider component that initializes Clerk with the publishable key
export const ClerkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the VITE_CLERK_PUBLISHABLE_KEY environment variable
  const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_Zmxl…VudHMuZGV2JA";

  if (!clerkPubKey) {
    console.error("Missing Clerk publishable key");
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
        <p className="text-center max-w-md">
          Unable to initialize authentication. Please try again later or contact support.
        </p>
      </div>
    );
  }

  return (
    <BaseClerkProvider publishableKey={clerkPubKey}>
      {children}
    </BaseClerkProvider>
  );
};