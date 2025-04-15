import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storage } from '../storage';
import { InsertUser } from '@shared/schema';

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET || 'foundations-ai-secret-key';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5000';

// Initialize Passport strategies
export function initializePassport() {
  // Local Strategy
  passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      try {
        const user = await storage.validateUserPassword(email, password);
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  ));

  // Google Strategy (if client ID is provided)
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: `${FRONTEND_URL}/api/auth/google/callback`,
      scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this Google ID
        let user = await storage.getUserByGoogleId(profile.id);
        
        if (!user) {
          // If not, check if user exists with this email
          const email = profile.emails?.[0]?.value;
          
          if (email) {
            user = await storage.getUserByEmail(email);
            
            if (user) {
              // Update existing user with Google ID
              user = await storage.updateUser(user.id, { 
                googleId: profile.id,
                profileImage: profile.photos?.[0]?.value || user.profileImage
              });
            } else {
              // Create new user
              const newUser: InsertUser = {
                email,
                firstName: profile.name?.givenName || '',
                lastName: profile.name?.familyName || '',
                googleId: profile.id,
                profileImage: profile.photos?.[0]?.value,
                role: 'user'
              };
              
              user = await storage.createUser(newUser);
              
              // Create default user settings
              await storage.createUserSettings({ 
                userId: user.id,
                notificationsEnabled: true,
                emailNotifications: true,
                theme: 'dark',
                timezone: 'UTC',
                languagePreference: 'en'
              });
            }
          } else {
            return done(new Error('No email found in Google profile'), false);
          }
        }
        
        // Update last login
        await storage.updateUser(user.id, { lastLogin: new Date() });
        
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }));
  }

  // Serialization and deserialization
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

// Controller methods
export const authController = {
  // Register a new user
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Create new user
      const user = await storage.createUser({
        email,
        password,
        firstName,
        lastName,
        role: 'user'
      });

      // Create default settings for the user
      await storage.createUserSettings({
        userId: user.id,
        notificationsEnabled: true,
        emailNotifications: true,
        theme: 'dark',
        timezone: 'UTC',
        languagePreference: 'en'
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.status(201).json({
        message: 'User registered successfully',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      next(error);
    }
  },

  // Login a user
  login: (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err) return next(err);
      
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Authentication failed' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    })(req, res, next);
  },

  // Google OAuth login
  googleLogin: passport.authenticate('google', { scope: ['profile', 'email'] }),

  // Google OAuth callback
  googleCallback: (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err) {
        return res.redirect(`/login?error=${encodeURIComponent(err.message)}`);
      }
      
      if (!user) {
        return res.redirect('/login?error=Authentication%20failed');
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Redirect to frontend with token
      return res.redirect(`/auth/callback?token=${token}`);
    })(req, res, next);
  },

  // Get current user profile
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Get user settings
      const settings = await storage.getUserSettings(userId);
      
      // Get subscription info
      const subscription = await storage.getSubscriptionByUserId(userId);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return res.json({
        user: userWithoutPassword,
        settings,
        subscription
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user profile
  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { firstName, lastName, profileImage } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        firstName,
        lastName,
        profileImage
      });

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      return res.json({
        message: 'Profile updated successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      next(error);
    }
  },

  // Update user settings
  updateSettings: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { 
        notificationsEnabled, 
        emailNotifications, 
        theme, 
        timezone, 
        languagePreference,
        dashboardLayout
      } = req.body;
      
      // Check if settings exist
      let settings = await storage.getUserSettings(userId);
      
      if (!settings) {
        // Create settings if they don't exist
        settings = await storage.createUserSettings({
          userId,
          notificationsEnabled,
          emailNotifications,
          theme,
          timezone,
          languagePreference,
          dashboardLayout
        });
      } else {
        // Update existing settings
        settings = await storage.updateUserSettings(userId, {
          notificationsEnabled,
          emailNotifications,
          theme,
          timezone,
          languagePreference,
          dashboardLayout
        });
      }

      return res.json({
        message: 'Settings updated successfully',
        settings
      });
    } catch (error) {
      next(error);
    }
  },

  // Change password
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;
      
      // Get user
      const user = await storage.getUser(userId);
      if (!user || !user.password) {
        return res.status(400).json({ message: 'Cannot change password for this account' });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Update password
      await storage.updateUser(userId, { password: newPassword });
      
      return res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
};

// JWT authentication middleware
export const authenticateJwt = (req: Request, res: Response, next: NextFunction) => {
  // Get the token from the request headers
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
    }
    
    next();
  };
};