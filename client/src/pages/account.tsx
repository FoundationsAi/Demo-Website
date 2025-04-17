import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUser, useClerk } from '@clerk/clerk-react';
import { SmoothScroll } from '@/components/smooth-scroll';
import { ParticleBackground } from '@/components/particle-background';
import { ScrollReveal } from '@/components/scroll-reveal';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { CreditCard, User, Calendar, Clock, ShieldCheck, Settings, LogOut } from 'lucide-react';

const Account: React.FC = () => {
  const [, navigate] = useLocation();
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  // Set background to black for consistency with the rest of the app
  useEffect(() => {
    document.body.style.background = '#000';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  // If not signed in, redirect to login page
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/login');
    }
  }, [isLoaded, isSignedIn, navigate]);

  // Get subscription information from user metadata
  const subscriptionPlan = user?.publicMetadata.subscriptionPlan as string || '';
  const subscriptionStatus = user?.publicMetadata.subscriptionStatus as string || '';
  
  // Format plan name from plan ID
  const getPlanName = (planId: string): string => {
    switch (planId) {
      case 'starter': return 'Starter';
      case 'essential': return 'Essential';
      case 'basic': return 'Basic';
      case 'pro': return 'Pro';
      default: return 'Free';
    }
  };
  
  // Format status for display
  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'active': return 'Active';
      case 'inactive': return 'Inactive';
      case 'past_due': return 'Past Due';
      case 'canceled': return 'Canceled';
      case 'unpaid': return 'Unpaid';
      default: return 'Unknown';
    }
  };
  
  // Get status color class
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'past_due': return 'bg-yellow-500';
      case 'canceled': return 'bg-red-500';
      case 'unpaid': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  // Show loading state while Clerk is checking authentication
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSignOut = () => {
    signOut(() => navigate('/'));
  };

  return (
    <SmoothScroll options={{ lerp: 0.075 }}>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        {/* Background effects */}
        <ParticleBackground variant="subtle" />
        
        <div className="relative z-10 py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 md:px-6 max-w-6xl">
            <ScrollReveal>
              <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-center">Your Account</h1>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <div className="bg-gradient-to-b from-blue-900/20 to-indigo-900/20 backdrop-blur-lg rounded-xl border border-blue-500/30 overflow-hidden">
                    <div className="p-6 text-center border-b border-blue-500/30">
                      <div className="w-20 h-20 mx-auto rounded-full bg-blue-700 flex items-center justify-center overflow-hidden mb-4">
                        {user?.imageUrl ? (
                          <img src={user.imageUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-medium text-white">
                            {user?.firstName?.[0] || user?.username?.[0] || 'U'}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-bold text-white mb-1">
                        {user?.fullName || user?.username || 'User'}
                      </h2>
                      <p className="text-blue-300 text-sm truncate mb-3">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                    
                    <div className="p-4">
                      <nav className="space-y-2">
                        <a 
                          href="#profile" 
                          className="flex items-center space-x-3 p-3 rounded-lg bg-blue-800/30 text-white"
                        >
                          <User className="h-5 w-5" />
                          <span>Profile</span>
                        </a>
                        <a 
                          href="#subscription" 
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800/30 text-white transition"
                        >
                          <CreditCard className="h-5 w-5" />
                          <span>Subscription</span>
                        </a>
                        <a 
                          href="#usage" 
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800/30 text-white transition"
                        >
                          <Clock className="h-5 w-5" />
                          <span>Usage</span>
                        </a>
                        <a 
                          href="#settings" 
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800/30 text-white transition"
                        >
                          <Settings className="h-5 w-5" />
                          <span>Settings</span>
                        </a>
                        <button 
                          onClick={handleSignOut}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-900/30 text-red-300 w-full text-left transition"
                        >
                          <LogOut className="h-5 w-5" />
                          <span>Sign Out</span>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
                
                {/* Main content */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Profile section */}
                  <section id="profile" className="bg-gradient-to-b from-blue-900/20 to-indigo-900/20 backdrop-blur-lg rounded-xl border border-blue-500/30 p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Profile Information
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-blue-300 mb-1">Name</label>
                        <p className="text-white">{user?.fullName || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-blue-300 mb-1">Email</label>
                        <p className="text-white">{user?.primaryEmailAddress?.emailAddress || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-blue-300 mb-1">Username</label>
                        <p className="text-white">{user?.username || 'Not provided'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm text-blue-300 mb-1">Account Created</label>
                        <p className="text-white">
                          {user?.createdAt 
                            ? new Date(user.createdAt).toLocaleDateString() 
                            : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </section>
                  
                  {/* Subscription section */}
                  <section id="subscription" className="bg-gradient-to-b from-blue-900/20 to-indigo-900/20 backdrop-blur-lg rounded-xl border border-blue-500/30 p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Subscription Details
                    </h3>
                    
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-white">
                            {getPlanName(subscriptionPlan) || 'Free Plan'}
                          </h4>
                          <p className="text-blue-300 text-sm">
                            {subscriptionPlan ? 'Monthly subscription' : 'Unsubscribed'}
                          </p>
                        </div>
                        
                        <div className="flex items-center">
                          <span 
                            className={`inline-block h-3 w-3 rounded-full ${getStatusColor(subscriptionStatus)} mr-2`}
                          ></span>
                          <span className="text-sm">
                            {getStatusLabel(subscriptionStatus) || 'Free'}
                          </span>
                        </div>
                      </div>
                      
                      {subscriptionPlan ? (
                        <div className="bg-blue-900/30 rounded-lg p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm text-blue-300 mb-1">Next Billing Date</label>
                              <p className="text-white">May 17, 2025</p>
                            </div>
                            
                            <div>
                              <label className="block text-sm text-blue-300 mb-1">Payment Method</label>
                              <p className="text-white">•••• 4242</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex gap-3">
                            <Button 
                              variant="outline" 
                              className="border-blue-500/50 text-sm"
                              onClick={() => navigate('/pricing')}
                            >
                              Change Plan
                            </Button>
                            <Button 
                              variant="outline" 
                              className="border-red-500/50 text-red-400 hover:text-red-300 text-sm"
                            >
                              Cancel Subscription
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-blue-900/30 rounded-lg p-4 text-center">
                          <p className="text-blue-200 mb-3">
                            Upgrade to a paid plan to access premium features and increase your usage limits.
                          </p>
                          <Button 
                            className="gradient-button text-sm"
                            onClick={() => navigate('/pricing')}
                          >
                            View Pricing Plans
                          </Button>
                        </div>
                      )}
                    </div>
                  </section>
                  
                  {/* Usage section */}
                  <section id="usage" className="bg-gradient-to-b from-blue-900/20 to-indigo-900/20 backdrop-blur-lg rounded-xl border border-blue-500/30 p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Usage Statistics
                    </h3>
                    
                    <div className="space-y-5">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm text-blue-300">Voice Minutes Used</label>
                          <span className="text-sm text-blue-200">35 / 100 minutes</span>
                        </div>
                        <div className="w-full bg-blue-900/30 rounded-full h-2.5">
                          <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm text-blue-300">API Calls</label>
                          <span className="text-sm text-blue-200">128 / 1000 calls</span>
                        </div>
                        <div className="w-full bg-blue-900/30 rounded-full h-2.5">
                          <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '12.8%' }}></div>
                        </div>
                      </div>
                    </div>
                  </section>
                  
                  {/* Security section */}
                  <section id="security" className="bg-gradient-to-b from-blue-900/20 to-indigo-900/20 backdrop-blur-lg rounded-xl border border-blue-500/30 p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center">
                      <ShieldCheck className="h-5 w-5 mr-2" />
                      Security
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-sm text-blue-300">Two-Factor Authentication</label>
                          <span className="text-xs px-2 py-1 rounded-full bg-red-900/50 text-red-300">Not Enabled</span>
                        </div>
                        <p className="text-sm text-blue-200 mb-2">Enable 2FA to secure your account with an additional layer of protection.</p>
                        <Button 
                          variant="outline" 
                          className="border-blue-500/50 text-sm"
                          onClick={() => window.open('https://clerk.com')}
                        >
                          Enable 2FA
                        </Button>
                      </div>
                    </div>
                  </section>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </SmoothScroll>
  );
};

export default Account;