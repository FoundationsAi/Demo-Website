import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScrollReveal } from "@/components/scroll-reveal";
import { 
  Loader2, 
  UserCircle, 
  CreditCard, 
  Settings, 
  LogOut,
  MessageCircle,
  BotIcon,
  BarChart,
  Calendar,
  Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
}

interface Subscription {
  id: number;
  userId: number;
  stripeSubscriptionId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export default function DashboardPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/me");
        
        if (response.status === 401) {
          // Unauthorized, redirect to login
          setLocation("/login");
          return;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to load user data");
        }
        
        setUser(data.user);
        setSubscription(data.subscription || null);
        
      } catch (error: any) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to load your account information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [setLocation, toast]);
  
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to logout");
      }
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      setLocation("/");
      
    } catch (error: any) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    if (!confirm("Are you sure you want to cancel your subscription? You'll still have access until the end of your billing period.")) {
      return;
    }
    
    try {
      const response = await fetch(`/api/subscriptions/${subscription.stripeSubscriptionId}`, {
        method: "DELETE",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to cancel subscription");
      }
      
      toast({
        title: "Subscription cancelled",
        description: "Your subscription will end at the end of the current billing period.",
      });
      
      // Update local subscription data
      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: true,
      });
      
    } catch (error: any) {
      console.error("Error cancelling subscription:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <header className="bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Voice Agent Dashboard</h1>
          
          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <div className="font-medium">{user?.firstName || user?.username}</div>
              <div className="text-sm text-muted-foreground">{user?.subscriptionPlan || "No subscription"}</div>
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview">
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">AI Agents</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Current Plan</CardTitle>
                  <CardDescription>Your subscription details</CardDescription>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div className="space-y-4">
                      <div>
                        <div className="text-2xl font-bold">{user?.subscriptionPlan || "Standard Plan"}</div>
                        <div className="text-sm text-muted-foreground">
                          Status: {subscription.cancelAtPeriodEnd 
                            ? "Cancelling" 
                            : (subscription.status === "active" ? "Active" : subscription.status)
                          }
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <div className="flex justify-between mb-1">
                          <span>Current period ends:</span>
                          <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
                        </div>
                        
                        {subscription.cancelAtPeriodEnd ? (
                          <div className="text-amber-500 mt-2">
                            Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={handleCancelSubscription}
                          >
                            Cancel Subscription
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-amber-500">No active subscription</div>
                      <Button 
                        variant="default" 
                        className="w-full"
                        onClick={() => setLocation("/subscribe")}
                      >
                        Choose a Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Usage Statistics</CardTitle>
                  <CardDescription>Your current usage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Voice minutes used</span>
                      <span className="font-medium">12 min / 1,000 min</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-full bg-primary rounded-full w-[1.2%]" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">API calls</span>
                      <span className="font-medium">48 / 10,000</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-full bg-primary rounded-full w-[0.5%]" />
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Frequently used actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center justify-center h-24 text-center"
                      onClick={() => setLocation("/agent-chat")}
                    >
                      <MessageCircle className="h-8 w-8 mb-2" />
                      <span>Start Conversation</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center justify-center h-24 text-center"
                      onClick={() => setLocation("/calendar")}
                    >
                      <Calendar className="h-8 w-8 mb-2" />
                      <span>Schedule Call</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center justify-center h-24 text-center"
                    >
                      <Clock className="h-8 w-8 mb-2" />
                      <span>View History</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="flex flex-col items-center justify-center h-24 text-center"
                    >
                      <Settings className="h-8 w-8 mb-2" />
                      <span>Settings</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity to display
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="agents">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-2">
                    <BotIcon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>AI Customer Service</CardTitle>
                  <CardDescription>
                    Friendly and efficient agent that handles customer inquiries with empathy and precision.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => setLocation("/chat/customer-service")}>
                    Chat Now
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-2">
                    <BotIcon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>AI Sales Qualification</CardTitle>
                  <CardDescription>
                    Professional agent that qualifies leads, books meetings, and nurtures potential customers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => setLocation("/chat/sales")}>
                    Chat Now
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-2">
                    <BotIcon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>AI Receptionist</CardTitle>
                  <CardDescription>
                    Professional virtual receptionist that greets callers, directs inquiries, and schedules appointments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" onClick={() => setLocation("/chat/receptionist")}>
                    Chat Now
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>View your usage statistics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    We're working on building comprehensive analytics for your AI agent usage.
                    Check back soon for detailed insights and reports.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="billing">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {subscription ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-y-3">
                        <div className="text-muted-foreground">Plan:</div>
                        <div className="font-medium">{user?.subscriptionPlan || "Standard Plan"}</div>
                        
                        <div className="text-muted-foreground">Status:</div>
                        <div className="font-medium">{subscription.status}</div>
                        
                        <div className="text-muted-foreground">Billing period:</div>
                        <div className="font-medium">
                          {new Date(subscription.currentPeriodStart).toLocaleDateString()} to {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </div>
                        
                        <div className="text-muted-foreground">Auto-renew:</div>
                        <div className="font-medium">{subscription.cancelAtPeriodEnd ? "No" : "Yes"}</div>
                      </div>
                      
                      <div className="pt-4">
                        {subscription.cancelAtPeriodEnd ? (
                          <div className="text-amber-500">
                            Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                          </div>
                        ) : (
                          <Button 
                            variant="outline" 
                            onClick={handleCancelSubscription}
                          >
                            Cancel Subscription
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-amber-500">No active subscription</div>
                      <Button 
                        variant="default" 
                        onClick={() => setLocation("/subscribe")}
                      >
                        Choose a Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subscription ? (
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="font-medium">•••• •••• •••• 4242</div>
                          <div className="text-sm text-muted-foreground">Expires 12/2025</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">
                        No payment method on file
                      </div>
                    )}
                    
                    <Button variant="outline" disabled={!subscription}>
                      Update Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    No billing history to display
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue={user?.firstName || ""} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue={user?.lastName || ""} />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={user?.email} disabled />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue={user?.username} disabled />
                    </div>
                  </div>
                  
                  <Button className="mt-4">Save Changes</Button>
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <h3 className="font-medium">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                  </div>
                  
                  <Button variant="outline" className="mt-4">Update Password</Button>
                </div>
                
                <div className="pt-4 border-t space-y-2">
                  <h3 className="font-medium">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">
                    This will permanently delete your account, all of your data, and cancel any active subscriptions.
                  </p>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}