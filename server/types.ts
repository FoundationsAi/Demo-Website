import { Session } from 'express-session';

// Extend the Session interface to include our custom properties
declare module 'express-session' {
  interface Session {
    userId?: number;
  }
}