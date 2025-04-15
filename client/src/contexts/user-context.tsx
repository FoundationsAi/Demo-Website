import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserSubscription {
  id: string;
  planKey: string;
  status: string;
  meteredPriceId: string;
  createdAt: string;
  currentPeriodEnd: string;
}

interface UserContextType {
  isLoggedIn: boolean;
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchSubscription: () => Promise<UserSubscription | null>;
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  isLoggedIn: false,
  subscription: null,
  loading: false,
  error: null,
  login: async () => false,
  logout: () => {},
  fetchSubscription: async () => null
});

// Hook to use the user context
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Check if user is already logged in on mount
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setLoading(true);
        
        // For demo purposes, we'll simulate being logged in
        // In a real app, you would check with your backend
        const userIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(userIsLoggedIn);
        
        // If logged in, try to fetch subscription data
        if (userIsLoggedIn) {
          await fetchSubscription();
        }
      } catch (err) {
        console.error('Error checking login status:', err);
        setError('Failed to verify login status');
      } finally {
        setLoading(false);
      }
    };
    
    checkLoginStatus();
  }, []);
  
  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      
      // For demo, we'll simulate a successful login
      // In a real app, you would authenticate with your backend
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      setIsLoggedIn(true);
      
      // After login, fetch subscription data
      await fetchSubscription();
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials and try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setSubscription(null);
  };
  
  // Fetch user's subscription data
  const fetchSubscription = async (): Promise<UserSubscription | null> => {
    try {
      setLoading(true);
      
      // For demo purposes, we'll use a simulated subscription
      // In a real app, you would fetch this from your backend
      // Mock subscription for demonstration
      const mockSubscription: UserSubscription = {
        id: 'sub_' + Math.random().toString(36).substr(2, 9),
        planKey: 'PROFESSIONAL',
        status: 'active',
        meteredPriceId: 'price_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      setSubscription(mockSubscription);
      return mockSubscription;
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError('Failed to load subscription data');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    isLoggedIn,
    subscription,
    loading,
    error,
    login,
    logout,
    fetchSubscription
  };
  
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};