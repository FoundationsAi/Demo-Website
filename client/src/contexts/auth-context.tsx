import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserSubscription: (plan: string, status: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
  updateUserSubscription: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);
  
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, you would call an API here
      // For demo purposes, we'll simulate a successful login with any credentials
      const demoUser: User = {
        id: `user-${Date.now()}`,
        name: email.split('@')[0],
        email,
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };
  
  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, you would call an API here
      // For demo purposes, we'll simulate a successful registration
      const demoUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
      };
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };
  
  const updateUserSubscription = (plan: string, status: string) => {
    if (user) {
      const updatedUser = {
        ...user,
        subscriptionPlan: plan,
        subscriptionStatus: status,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUserSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};