import React from 'react';
import { useUser, useClerk, SignIn, SignUp } from '@clerk/clerk-react';
import { useLocation, Route, Redirect } from 'wouter';
import { ParticleBackground } from '@/components/particle-background';
import { ScrollReveal } from '@/components/scroll-reveal';
import { SmoothScroll } from '@/components/smooth-scroll';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// SignInPage component - replaces the existing Login page
export const SignInPage: React.FC = () => {
  const [, navigate] = useLocation();
  
  // Set background to black for consistency with the rest of the app
  React.useEffect(() => {
    document.body.style.background = '#000';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <SmoothScroll options={{ lerp: 0.075 }}>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        {/* Background effects */}
        <ParticleBackground variant="subtle" />
        
        <div className="relative z-10 pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <ScrollReveal>
              <div className="w-full max-w-[90%] sm:max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white">
                    Welcome Back
                  </h1>
                  <p className="text-base sm:text-lg text-blue-300 px-1">
                    Sign in to access your Foundations AI experience
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-lg p-5 sm:p-6 md:p-8 rounded-xl border border-blue-500/30 shadow-[0_4px_30px_rgba(0,100,255,0.3)]">
                  <SignIn 
                    routing="path" 
                    path="/login" 
                    signUpUrl="/get-started"
                    afterSignInUrl="/"
                    appearance={{
                      elements: {
                        formButtonPrimary: 'gradient-button w-full',
                        formFieldInput: 'bg-black/50 border-blue-500/50 text-white',
                        formFieldLabel: 'text-white',
                        footerActionLink: 'text-blue-400 hover:text-blue-300 transition',
                        card: 'bg-transparent shadow-none border-0',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                      }
                    }}
                  />
                </div>
                
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    className="text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 bg-transparent"
                    onClick={() => navigate('/')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Home
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </SmoothScroll>
  );
};

// SignUpPage component - replaces the existing GetStarted page
export const SignUpPage: React.FC = () => {
  const [, navigate] = useLocation();
  
  // Set background to black for consistency with the rest of the app
  React.useEffect(() => {
    document.body.style.background = '#000';
    return () => {
      document.body.style.background = '';
    };
  }, []);

  return (
    <SmoothScroll options={{ lerp: 0.075 }}>
      <div className="min-h-screen bg-black text-white">
        <Header />
        
        {/* Background effects */}
        <ParticleBackground variant="subtle" />
        
        <div className="relative z-10 pt-20 sm:pt-24 md:pt-32 pb-12 sm:pb-16 md:pb-20">
          <div className="container mx-auto px-4 md:px-6">
            <ScrollReveal>
              <div className="w-full max-w-[90%] sm:max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-white">
                    Join Foundations AI
                  </h1>
                  <p className="text-base sm:text-lg text-blue-300 px-1">
                    Create your account to start your immersive AI experience
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 backdrop-blur-lg p-5 sm:p-6 md:p-8 rounded-xl border border-blue-500/30 shadow-[0_4px_30px_rgba(0,100,255,0.3)]">
                  <SignUp 
                    routing="path" 
                    path="/get-started" 
                    signInUrl="/login"
                    afterSignUpUrl="/pricing"
                    appearance={{
                      elements: {
                        formButtonPrimary: 'gradient-button w-full',
                        formFieldInput: 'bg-black/50 border-blue-500/50 text-white',
                        formFieldLabel: 'text-white',
                        footerActionLink: 'text-blue-400 hover:text-blue-300 transition',
                        card: 'bg-transparent shadow-none border-0',
                        headerTitle: 'hidden',
                        headerSubtitle: 'hidden',
                      }
                    }}
                  />
                </div>
                
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    className="text-blue-400 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50 bg-transparent"
                    onClick={() => navigate('/')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Return to Home
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
        
        {/* Benefits section */}
        <div className="relative z-10 py-16 bg-gradient-to-b from-black/0 to-blue-950/20">
          <div className="container mx-auto px-4 md:px-6">
            <ScrollReveal>
              <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-white">Why Create an Account?</h2>
                <p className="text-base sm:text-lg md:text-xl text-blue-300 px-2">Unlock the full potential of Foundations AI with exclusive member benefits</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="bg-gradient-to-b from-blue-900/15 to-indigo-900/15 backdrop-blur-lg p-4 sm:p-5 md:p-6 rounded-xl border border-blue-500/30 shadow-[0_4px_15px_rgba(0,100,255,0.2)] hover:shadow-[0_4px_25px_rgba(0,100,255,0.3)] transition-all duration-300 hover:scale-[1.03]">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500/40 to-blue-600/40 flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                    <div className="text-blue-200 text-xl sm:text-2xl">💬</div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">Personalized Agents</h3>
                  <p className="text-sm sm:text-base text-blue-200 text-center">Create and customize your own voice AI agents tailored to your specific needs</p>
                </div>
                
                <div className="bg-gradient-to-b from-purple-900/15 to-indigo-900/15 backdrop-blur-lg p-4 sm:p-5 md:p-6 rounded-xl border border-purple-500/30 shadow-[0_4px_15px_rgba(147,51,234,0.2)] hover:shadow-[0_4px_25px_rgba(147,51,234,0.3)] transition-all duration-300 hover:scale-[1.03]">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500/40 to-purple-600/40 flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-[0_0_15px_rgba(147,51,234,0.4)]">
                    <div className="text-purple-200 text-xl sm:text-2xl">🔐</div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">Secure Conversations</h3>
                  <p className="text-sm sm:text-base text-purple-200 text-center">Store and manage your conversations securely in your private account dashboard</p>
                </div>
                
                <div className="bg-gradient-to-b from-indigo-900/15 to-blue-900/15 backdrop-blur-lg p-4 sm:p-5 md:p-6 rounded-xl border border-indigo-500/30 shadow-[0_4px_15px_rgba(99,102,241,0.2)] hover:shadow-[0_4px_25px_rgba(99,102,241,0.3)] transition-all duration-300 hover:scale-[1.03]">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-indigo-500/40 to-indigo-600/40 flex items-center justify-center mb-3 sm:mb-4 mx-auto shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                    <div className="text-indigo-200 text-xl sm:text-2xl">⚡</div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3 text-center">Premium Features</h3>
                  <p className="text-sm sm:text-base text-indigo-200 text-center">Access exclusive features like voice customization, longer conversations, and priority support</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </SmoothScroll>
  );
};

// PrivateRoute component - redirects to login if user is not authenticated
export const PrivateRoute: React.FC<{
  component: React.ComponentType<any>;
  path: string;
}> = ({ component: Component, path }) => {
  // Check if Clerk is available
  const clerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // If Clerk is not enabled, render the component without authentication
  if (!clerkEnabled) {
    return <Route path={path} component={Component} />;
  }
  
  const { isSignedIn, isLoaded } = useUser();
  
  // Show loading state while Clerk is initializing
  if (!isLoaded) {
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
        isSignedIn ? (
          <Component />
        ) : (
          <Redirect to="/login" />
        )
      }
    />
  );
};

// UserButton component - displays user profile/logout button
export const UserProfileButton: React.FC = () => {
  // Check if Clerk is available
  const clerkEnabled = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  // Only try to use Clerk hooks if it's enabled
  if (!clerkEnabled) {
    return null;
  }
  
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = React.useState(false);
  const [, navigate] = useLocation();
  
  if (!isSignedIn || !user) {
    return null;
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 py-2 px-3 rounded-full bg-blue-900/30 hover:bg-blue-800/40 transition"
      >
        <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center overflow-hidden">
          {user.imageUrl ? (
            <img src={user.imageUrl} alt={user.fullName || 'User'} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-medium text-white">
              {user.firstName?.[0] || user.username?.[0] || 'U'}
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-white hidden sm:block">
          {user.firstName || user.username || 'User'}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gradient-to-b from-blue-900/90 to-indigo-900/90 backdrop-blur-lg rounded-lg shadow-lg border border-blue-500/30 z-50">
          <div className="p-4">
            <div className="text-white font-medium mb-1">{user.fullName || user.username}</div>
            <div className="text-blue-300 text-sm truncate">{user.primaryEmailAddress?.emailAddress}</div>
          </div>
          <div className="border-t border-blue-700/50"></div>
          <div className="p-2">
            <button
              onClick={() => {
                navigate('/account');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-blue-800/40 rounded-md transition"
            >
              Account Settings
            </button>
            <button
              onClick={() => {
                signOut(() => navigate('/'));
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-blue-800/40 rounded-md transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};