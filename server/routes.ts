import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import { 
  insertDemoRequestSchema, 
  insertAppointmentSchema,
  insertUserSchema,
  insertSubscriptionSchema,
  insertDocumentSchema,
  insertCustomAgentSchema,
  insertLeadSchema
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Initialize Stripe with fallback key for development
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const stripe = new Stripe(stripeKey, {
  apiVersion: "2025-03-31.basil" as any,
});

// Initialize Elevenlabs API (with fallback key for development)
const elevenLabsKey = process.env.ELEVEN_LABS_API_KEY || "placeholder_key";
const elevenLabsApiUrl = "https://api.elevenlabs.io/v1";

// Initialize Twilio (with fallback keys for development)
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || "placeholder_sid";
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || "placeholder_token";
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "+1234567890";

// Define middleware to check if user is authenticated
const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  
  const user = await storage.getUser(userId);
  if (!user) {
    // @ts-ignore
    req.session.destroy();
    return res.status(401).json({ error: "User not found. Please log in again." });
  }
  
  // @ts-ignore
  req.user = user;
  next();
};

// Define middleware to check if user has active subscription
const hasActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  // First check if authenticated
  // @ts-ignore
  const userId = req.session?.userId;
  
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }
  
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(401).json({ error: "User not found. Please log in again." });
  }
  
  // Check if user has an active subscription
  if (user.subscriptionStatus !== 'active') {
    return res.status(403).json({ error: "Subscription required. Please upgrade your account." });
  }
  
  // @ts-ignore
  req.user = user;
  next();
};

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, DOCX, TXT files
    const allowedMimes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.') as any);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      // Extend the user schema with additional validation
      const signupSchema = insertUserSchema.extend({
        password: z.string().min(8, "Password must be at least 8 characters"),
        email: z.string().email("Invalid email format"),
      });
      
      // Validate the request body
      const validatedData = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
      
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(validatedData.password, saltRounds);
      
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: validatedData.email,
        name: validatedData.fullName || validatedData.username,
      });
      
      // Create user with hashed password
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        stripeCustomerId: customer.id,
        subscriptionStatus: "inactive",
      });
      
      // Set user session
      // @ts-ignore
      req.session.userId = user.id;
      
      // Return user data (excluding password)
      const { password, ...userData } = user;
      res.status(201).json({ 
        user: userData,
        message: "User registered successfully" 
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      // Find user by username
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Compare password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      // Set user session
      // @ts-ignore
      req.session.userId = user.id;
      
      // Return user data (excluding password)
      const { password: _, ...userData } = user;
      res.json({ 
        user: userData,
        message: "Login successful" 
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    // @ts-ignore
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logout successful" });
    });
  });
  
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      // Return user data (excluding password)
      const { password, ...userData } = user;
      res.json({ user: userData });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Stripe subscription routes
  app.post("/api/subscriptions/create", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      const { priceId } = req.body;
      
      if (!priceId) {
        return res.status(400).json({ error: "Price ID is required" });
      }
      
      // Map product IDs to price IDs
      // In a real app, you'd store these in the database or environment variables
      const priceMap: Record<string, string> = {
        'prod_S8QWDRCVcz07An': 'price_starter', // Starter plan
        'prod_S8QXUopH7dXHrJ': 'price_essential', // Essential plan
        'prod_S8QYxTHNgV2Dmr': 'price_basic',     // Basic plan
        'prod_S8QZE7hzuMcjru': 'price_pro',       // Pro plan
      };
      
      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: user.stripeCustomerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Find the plan name from the price ID
      let planName = 'unknown';
      for (const [productId, price] of Object.entries(priceMap)) {
        if (price === priceId) {
          planName = productId === 'prod_S8QWDRCVcz07An' ? 'starter' : 
                     productId === 'prod_S8QXUopH7dXHrJ' ? 'essential' :
                     productId === 'prod_S8QYxTHNgV2Dmr' ? 'basic' : 'pro';
          break;
        }
      }
      
      // Store subscription in database
      await storage.createSubscription({
        userId: user.id,
        stripeSubscriptionId: subscription.id,
        plan: planName,
        status: subscription.status,
        currentPeriodStart: new Date(), // Current time as start
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
      
      // Update user subscription status
      await storage.updateUser(user.id, {
        subscriptionStatus: subscription.status,
        subscriptionPlan: planName,
      });
      
      // @ts-ignore
      const clientSecret = subscription.latest_invoice.payment_intent.client_secret;
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret,
      });
    } catch (error: any) {
      console.error("Create subscription error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/subscriptions/plans", async (req, res) => {
    try {
      // Define subscription plans with product IDs from the requirements
      const plans = [
        {
          id: 'prod_S8QWDRCVcz07An',
          name: 'Starter',
          price: 19.99,
          interval: 'month',
          currency: 'usd',
          features: [
            'Basic Voice AI Integration',
            'Up to 100 calls/month',
            '24/7 Customer Support',
            '1 AI Agent Type',
          ]
        },
        {
          id: 'prod_S8QXUopH7dXHrJ',
          name: 'Essential',
          price: 49.99,
          interval: 'month',
          currency: 'usd',
          features: [
            'Advanced Voice AI Integration',
            'Up to 500 calls/month',
            'Priority Support',
            '2 AI Agent Types',
            'Call Analytics',
          ]
        },
        {
          id: 'prod_S8QYxTHNgV2Dmr',
          name: 'Basic',
          price: 99.99,
          interval: 'month',
          currency: 'usd',
          features: [
            'Premium Voice AI Integration',
            'Up to 1,000 calls/month',
            '24/7 Priority Support',
            'All AI Agent Types',
            'Advanced Analytics',
            'Custom Integration Support',
          ]
        },
        {
          id: 'prod_S8QZE7hzuMcjru',
          name: 'Pro',
          price: 199.99,
          interval: 'month',
          currency: 'usd',
          features: [
            'Enterprise Voice AI Integration',
            'Unlimited calls',
            'Dedicated Account Manager',
            'Custom AI Agent Development',
            'Full API Access',
            'White Labeling',
            'Custom Reporting',
          ]
        }
      ];
      
      res.json({ plans });
    } catch (error: any) {
      console.error("Get plans error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/subscriptions/current", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      
      // Get user's subscriptions
      const subscriptions = await storage.getSubscriptionsByUserId(user.id);
      
      // Find active subscription
      const activeSubscription = subscriptions.find(sub => sub.status === 'active');
      
      res.json({ subscription: activeSubscription || null });
    } catch (error: any) {
      console.error("Get current subscription error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Webhook to handle Stripe events
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      let event;
      
      // Verify webhook signature
      if (endpointSecret) {
        try {
          event = stripe.webhooks.constructEvent(
            // @ts-ignore - In production, you would use raw body parser for Stripe webhooks
            req.body,
            sig,
            endpointSecret
          );
        } catch (err: any) {
          console.error(`Webhook signature verification failed: ${err.message}`);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      } else {
        // For development without signature validation
        event = req.body;
      }
      
      // Handle the event
      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoicePaymentSucceeded = event.data.object;
          // Handle successful invoice payment
          await handleSubscriptionUpdated(invoicePaymentSucceeded.subscription, 'active');
          break;
        case 'invoice.payment_failed':
          const invoicePaymentFailed = event.data.object;
          // Handle failed invoice payment
          await handleSubscriptionUpdated(invoicePaymentFailed.subscription, 'past_due');
          break;
        case 'customer.subscription.deleted':
          const subscriptionDeleted = event.data.object;
          // Handle subscription cancellation
          await handleSubscriptionUpdated(subscriptionDeleted.id, 'canceled');
          break;
        case 'customer.subscription.updated':
          const subscriptionUpdated = event.data.object;
          // Handle subscription update
          await handleSubscriptionUpdated(subscriptionUpdated.id, subscriptionUpdated.status);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      
      // Return a response to acknowledge receipt of the event
      res.json({ received: true });
    } catch (error: any) {
      console.error("Stripe webhook error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Helper function to handle subscription updates
  async function handleSubscriptionUpdated(subscriptionId: string, status: string) {
    try {
      // Get subscription from database
      const subscription = await storage.getSubscriptionByStripeId(subscriptionId);
      if (!subscription) {
        console.error(`Subscription not found: ${subscriptionId}`);
        return;
      }
      
      // Update subscription status
      await storage.updateSubscription(subscription.id, { status });
      
      // Update user subscription status
      await storage.updateUser(subscription.userId, { 
        subscriptionStatus: status 
      });
      
      console.log(`Subscription ${subscriptionId} updated to ${status}`);
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  }
  // 11Labs Conversational AI agent endpoint
  app.post("/api/conversational-agent", async (req, res) => {
    try {
      const { message, agentId, history = [] } = req.body;
      
      if (!message || !agentId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
      if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: "Missing ElevenLabs API key" });
      }
      
      // Prepare conversation history in the format expected by 11Labs API
      const formattedHistory = history.map((msg: {role: string, content: string}) => ({
        role: msg.role,
        content: msg.content
      }));
      
      console.log(`Attempting to call 11Labs Conversational AI with agent ID: ${agentId}`);
      
      // Call 11Labs Conversational AI Agent API - using the correct endpoint for agent conversations
      const response = await fetch(`https://api.elevenlabs.io/v1/chat-with-agent`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          agent_id: agentId,
          message: message,
          conversation_history: formattedHistory,
          audio_enabled: true, // Request audio response
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("ElevenLabs ConvAI error:", errorData);
        return res.status(response.status).json({ 
          error: "Failed to get agent response", 
          details: errorData 
        });
      }
      
      // Parse the JSON response from the API
      const data = await response.json();
      console.log("Received response from 11Labs:", data);
      
      // Extract the AI text response and audio
      const aiText = data.response || "I'm sorry, I didn't catch that. Could you please try again?";
      const audioContent = data.audio_response || "";
      
      // Create a response with both AI response text and the audio
      res.json({ 
        text: aiText,
        audio: audioContent // 11Labs API already provides base64 encoded audio
      });
    } catch (error: any) {
      console.error("Error in conversational agent:", error);
      res.status(500).json({ error: error.message || "Unknown error occurred" });
    }
  });
  // Voice synthesis endpoint using 11Labs API
  app.post("/api/synthesize-speech", async (req, res) => {
    try {
      const { text, voiceId, optimizeStreamingLatency = 0 } = req.body;
      
      if (!text || !voiceId) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
      if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: "Missing ElevenLabs API key" });
      }
      
      const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`;
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          },
          optimize_streaming_latency: optimizeStreamingLatency
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("ElevenLabs API error:", errorData);
        return res.status(response.status).json({ 
          error: "Failed to generate speech", 
          details: errorData 
        });
      }
      
      // Get the audio data as an ArrayBuffer
      const audioData = await response.arrayBuffer();
      
      // Convert to base64 for sending to the client
      const base64Audio = Buffer.from(audioData).toString('base64');
      
      res.json({ 
        audioContent: base64Audio,
        contentType: "audio/mpeg"
      });
    } catch (error: any) {
      console.error("Error in speech synthesis:", error);
      res.status(500).json({ error: error.message || "Unknown error occurred" });
    }
  });
  
  // Endpoint to get available voices from 11Labs
  app.get("/api/voices", async (req, res) => {
    try {
      const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
      if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: "Missing ElevenLabs API key" });
      }
      
      const response = await fetch("https://api.elevenlabs.io/v1/voices", {
        headers: {
          "Accept": "application/json",
          "xi-api-key": ELEVENLABS_API_KEY
        }
      });
      
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch voices" });
      }
      
      const voicesData = await response.json();
      res.json(voicesData);
    } catch (error: any) {
      console.error("Error fetching voices:", error);
      res.status(500).json({ error: error.message || "Unknown error occurred" });
    }
  });

  // Chat API endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { agentId, message, sessionId = randomUUID() } = req.body;
      
      if (!agentId || !message) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      // Store user message
      await storage.createMessage({
        sessionId,
        agentId: parseInt(agentId),
        sender: "user",
        content: message
      });
      
      // Get agent type
      const agent = await storage.getAgentByType(agentId);
      
      // In a real implementation, we would call the ElevenLabs API here
      // to generate the AI response based on the agent type
      let aiResponse = "Thank you for your message. As a demo, this is a simulated response. In a production environment, this would use the ElevenLabs API to generate a realistic AI voice response.";
      
      // Sample responses based on agent type
      if (agent) {
        if (agent.type === "sales") {
          aiResponse = "Thanks for your interest in our products! I'd be happy to tell you more about our pricing plans and features. What specific aspects are you most interested in?";
        } else if (agent.type === "customer-service") {
          aiResponse = "I'm here to help with any issues you're experiencing. Could you please provide more details about your question or concern?";
        } else if (agent.type === "receptionist") {
          aiResponse = "Thank you for reaching out. I can help you schedule an appointment or direct your inquiry to the appropriate department. How may I assist you today?";
        }
      }
      
      // Store AI response
      await storage.createMessage({
        sessionId,
        agentId: parseInt(agentId),
        sender: "ai",
        content: aiResponse
      });
      
      res.json({ 
        response: aiResponse,
        sessionId
      });
    } catch (error: any) {
      console.error("Chat API error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Schedule demo API endpoint
  app.post("/api/schedule-demo", async (req, res) => {
    try {
      const demoRequest = insertDemoRequestSchema.parse(req.body);
      
      // Save the demo request
      const savedRequest = await storage.createDemoRequest(demoRequest);
      
      // In a real implementation, we would send an SMS via Twilio here
      console.log(`Would send SMS to ${demoRequest.phone} using Twilio`);
      
      res.json({
        success: true,
        message: "Demo request scheduled successfully",
        id: savedRequest.id
      });
    } catch (error: any) {
      console.error("Schedule demo error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Schedule appointment API endpoint
  app.post("/api/schedule-appointment", async (req, res) => {
    try {
      const appointment = insertAppointmentSchema.parse(req.body);
      
      // Save the appointment
      const savedAppointment = await storage.createAppointment(appointment);
      
      // In a real implementation, we would add to Google Calendar here
      console.log(`Would create Google Calendar event for ${appointment.date} at ${appointment.timeSlot}`);
      
      // In a real implementation, we would send confirmation SMS via Twilio
      console.log(`Would send confirmation SMS to ${appointment.phone} using Twilio`);
      
      res.json({
        success: true,
        message: "Appointment scheduled successfully",
        id: savedAppointment.id
      });
    } catch (error: any) {
      console.error("Schedule appointment error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Stripe payment intent API endpoint
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, plan } = req.body;
      
      // Create a payment intent with Stripe
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount in cents
        currency: "usd",
        metadata: { plan }
      });
      
      // Store payment intent in our database
      await storage.createPayment({
        stripePaymentIntentId: paymentIntent.id,
        amount,
        status: paymentIntent.status,
        email: req.body.email
      });
      
      // Return client secret to the frontend
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount
      });
    } catch (error: any) {
      console.error("Create payment intent error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // API endpoint to get a signed URL for ElevenLabs Conversational AI WebSocket
  app.get("/api/elevenlabs/get-signed-url", async (req, res) => {
    try {
      const agentId = req.query.agentId as string;
      
      if (!agentId) {
        return res.status(400).json({ error: 'Agent ID is required' });
      }

      const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
      if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: 'ElevenLabs API key is not configured' });
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
        {
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("ElevenLabs signed URL error:", errorData);
        return res.status(response.status).json({ 
          error: `Failed to get signed URL: ${response.statusText}`,
          details: errorData
        });
      }

      const data = await response.json();
      return res.json({ signedUrl: data.signed_url });
    } catch (error: any) {
      console.error('Error getting signed URL:', error);
      return res.status(500).json({ error: error.message });
    }
  });
  
  // API endpoint to explicitly terminate an ElevenLabs conversation
  app.post("/api/elevenlabs/end-conversation", async (req, res) => {
    try {
      const agentId = req.query.agentId as string;
      
      if (!agentId) {
        return res.status(400).json({ error: 'Agent ID is required' });
      }

      const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
      if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: 'ElevenLabs API key is not configured' });
      }

      console.log(`Attempting to terminate 11Labs conversation with agent ID: ${agentId}`);
      
      // Call 11Labs API to terminate the conversation
      // Note: ElevenLabs doesn't have a direct conversation termination endpoint,
      // but this call will inform our server that the client has ended the conversation
      // The actual cleanup happens on the client side by closing the WebSocket
      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/info?agent_id=${agentId}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY,
          },
        }
      );

      // Even if the conversation info can't be retrieved, we still mark it as terminated
      // This allows us to track conversation termination on our side
      const logTermination = {
        timestamp: new Date().toISOString(),
        agent_id: agentId,
        status: 'terminated_by_user',
        client_info: req.headers['user-agent']
      };
      
      console.log('Conversation termination recorded:', logTermination);
      
      return res.json({ success: true, message: 'Conversation terminated' });
    } catch (error: any) {
      console.error('Error terminating conversation:', error);
      // Even if there's an error, return 200 OK to the client so it continues with cleanup
      return res.status(200).json({ 
        success: true, 
        message: 'Attempted to terminate conversation but encountered an error',
        error: error.message
      });
    }
  });

  // Document management routes
  app.post("/api/documents/upload", isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      const file = req.file;
      const { title, description } = req.body;
      
      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      
      // Save document metadata to database
      const document = await storage.createDocument({
        userId: user.id,
        title: title || file.originalname,
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
        description: description || "",
      });
      
      res.status(201).json({ 
        document,
        message: "Document uploaded successfully" 
      });
    } catch (error: any) {
      console.error("Document upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/documents", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      
      // Get user's documents
      const documents = await storage.getDocumentsByUserId(user.id);
      
      res.json({ documents });
    } catch (error: any) {
      console.error("Get documents error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      const documentId = parseInt(req.params.id);
      
      if (isNaN(documentId)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }
      
      // Get document
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      // Check if user owns document
      if (document.userId !== user.id) {
        return res.status(403).json({ error: "Unauthorized access to document" });
      }
      
      res.json({ document });
    } catch (error: any) {
      console.error("Get document error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete("/api/documents/:id", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      const documentId = parseInt(req.params.id);
      
      if (isNaN(documentId)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }
      
      // Get document
      const document = await storage.getDocument(documentId);
      
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      // Check if user owns document
      if (document.userId !== user.id) {
        return res.status(403).json({ error: "Unauthorized access to document" });
      }
      
      // Delete document file
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }
      
      // Delete document from database
      await storage.deleteDocument(documentId);
      
      res.json({ 
        message: "Document deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete document error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Custom AI Agent routes
  app.post("/api/custom-agents", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      
      // Extend the custom agent schema with validation
      const customAgentSchema = insertCustomAgentSchema.extend({
        name: z.string().min(1, "Name is required"),
        type: z.string().min(1, "Type is required"),
      });
      
      // Validate the request body
      const validatedData = customAgentSchema.parse(req.body);
      
      // Create custom agent
      const customAgent = await storage.createCustomAgent({
        ...validatedData,
        userId: user.id,
      });
      
      res.status(201).json({ 
        customAgent,
        message: "Custom agent created successfully" 
      });
    } catch (error: any) {
      console.error("Create custom agent error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/custom-agents", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      
      // Get user's custom agents
      const customAgents = await storage.getCustomAgentsByUserId(user.id);
      
      res.json({ customAgents });
    } catch (error: any) {
      console.error("Get custom agents error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/custom-agents/:id", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      const agentId = parseInt(req.params.id);
      
      if (isNaN(agentId)) {
        return res.status(400).json({ error: "Invalid agent ID" });
      }
      
      // Get custom agent
      const customAgent = await storage.getCustomAgent(agentId);
      
      if (!customAgent) {
        return res.status(404).json({ error: "Custom agent not found" });
      }
      
      // Check if user owns custom agent
      if (customAgent.userId !== user.id) {
        return res.status(403).json({ error: "Unauthorized access to custom agent" });
      }
      
      res.json({ customAgent });
    } catch (error: any) {
      console.error("Get custom agent error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.put("/api/custom-agents/:id", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      const agentId = parseInt(req.params.id);
      
      if (isNaN(agentId)) {
        return res.status(400).json({ error: "Invalid agent ID" });
      }
      
      // Get custom agent
      const customAgent = await storage.getCustomAgent(agentId);
      
      if (!customAgent) {
        return res.status(404).json({ error: "Custom agent not found" });
      }
      
      // Check if user owns custom agent
      if (customAgent.userId !== user.id) {
        return res.status(403).json({ error: "Unauthorized access to custom agent" });
      }
      
      // Update custom agent
      const updatedCustomAgent = await storage.updateCustomAgent(agentId, req.body);
      
      res.json({ 
        customAgent: updatedCustomAgent,
        message: "Custom agent updated successfully" 
      });
    } catch (error: any) {
      console.error("Update custom agent error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete("/api/custom-agents/:id", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      const agentId = parseInt(req.params.id);
      
      if (isNaN(agentId)) {
        return res.status(400).json({ error: "Invalid agent ID" });
      }
      
      // Get custom agent
      const customAgent = await storage.getCustomAgent(agentId);
      
      if (!customAgent) {
        return res.status(404).json({ error: "Custom agent not found" });
      }
      
      // Check if user owns custom agent
      if (customAgent.userId !== user.id) {
        return res.status(403).json({ error: "Unauthorized access to custom agent" });
      }
      
      // Delete custom agent
      await storage.deleteCustomAgent(agentId);
      
      res.json({ 
        message: "Custom agent deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete custom agent error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Lead management routes
  app.post("/api/leads", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      
      // Extend the lead schema with validation
      const leadSchema = insertLeadSchema.extend({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email format"),
      });
      
      // Validate the request body
      const validatedData = leadSchema.parse(req.body);
      
      // Create lead
      const lead = await storage.createLead({
        ...validatedData,
        userId: user.id,
      });
      
      res.status(201).json({ 
        lead,
        message: "Lead created successfully" 
      });
    } catch (error: any) {
      console.error("Create lead error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/leads", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      
      // Get user's leads
      const leads = await storage.getLeadsByUserId(user.id);
      
      res.json({ leads });
    } catch (error: any) {
      console.error("Get leads error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/leads/:id", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      const leadId = parseInt(req.params.id);
      
      if (isNaN(leadId)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }
      
      // Get lead
      const lead = await storage.getLead(leadId);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      // Check if user owns lead
      if (lead.userId !== user.id) {
        return res.status(403).json({ error: "Unauthorized access to lead" });
      }
      
      res.json({ lead });
    } catch (error: any) {
      console.error("Get lead error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.put("/api/leads/:id", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      const leadId = parseInt(req.params.id);
      
      if (isNaN(leadId)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }
      
      // Get lead
      const lead = await storage.getLead(leadId);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      // Check if user owns lead
      if (lead.userId !== user.id) {
        return res.status(403).json({ error: "Unauthorized access to lead" });
      }
      
      // Update lead
      const updatedLead = await storage.updateLead(leadId, req.body);
      
      res.json({ 
        lead: updatedLead,
        message: "Lead updated successfully" 
      });
    } catch (error: any) {
      console.error("Update lead error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete("/api/leads/:id", isAuthenticated, async (req, res) => {
    try {
      // @ts-ignore
      const user = req.user;
      const leadId = parseInt(req.params.id);
      
      if (isNaN(leadId)) {
        return res.status(400).json({ error: "Invalid lead ID" });
      }
      
      // Get lead
      const lead = await storage.getLead(leadId);
      
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      // Check if user owns lead
      if (lead.userId !== user.id) {
        return res.status(403).json({ error: "Unauthorized access to lead" });
      }
      
      // Delete lead
      await storage.deleteLead(leadId);
      
      res.json({ 
        message: "Lead deleted successfully"
      });
    } catch (error: any) {
      console.error("Delete lead error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
