import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "./sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is authenticated and has active subscription
  useEffect(() => {
    const checkAuthAndSubscription = async () => {
      try {
        // Check authentication
        const authResponse = await fetch("/api/auth/me");
        if (!authResponse.ok) {
          setLocation("/auth/login");
          toast({
            title: "Authentication required",
            description: "Please login to access the dashboard",
          });
          return;
        }

        // Check subscription status
        const subscriptionResponse = await fetch("/api/subscriptions/current");
        const subscriptionData = await subscriptionResponse.json();

        if (!subscriptionResponse.ok || !subscriptionData?.subscription) {
          setLocation("/subscriptions/plans");
          toast({
            title: "Subscription required",
            description: "Please select a subscription plan to continue",
          });
          return;
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setLocation("/auth/login");
      }
    };

    checkAuthAndSubscription();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-gray-50">
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;