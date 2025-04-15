import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import { 
  insertDemoRequestSchema, 
  insertAppointmentSchema, 
  insertUserSchema, 
  insertSubscriptionSchema,
  users
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import "./types"; // Import the session type extensions

// Initialize Stripe with fallback key for development
const stripeKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder";
const stripe = new Stripe(stripeKey, {
  apiVersion: "2023-10-16" as any,
});

// Initialize Elevenlabs API (with fallback key for development)
const elevenLabsKey = process.env.ELEVEN_LABS_API_KEY || "placeholder_key";
const elevenLabsApiUrl = "https://api.elevenlabs.io/v1";

// Initialize Twilio (with fallback keys for development)
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID || "placeholder_sid";
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN || "placeholder_token";
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || "+1234567890";

// Authentication middleware
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth API endpoints
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, username, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already in use" });
      }
      
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Create user
      const userData = insertUserSchema.parse({
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        role: "user",
      });
      
      const newUser = await storage.createUser(userData);
      
      // Set user session
      if (req.session) {
        req.session.userId = newUser.id;
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = newUser;
      
      res.status(201).json({ 
        success: true, 
        user: userWithoutPassword 
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
      
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }
      
      // Set user session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ 
        success: true, 
        user: userWithoutPassword 
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/auth/me", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      // Get user's subscription
      const subscription = await storage.getSubscriptionByUserId(userId);
      
      res.json({ 
        user: userWithoutPassword,
        subscription
      });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
  
  // Subscription API endpoints
  app.post("/api/subscriptions/create", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const { planId, billingPeriod } = req.body;
      
      // Get plan price ID based on product ID and billing period
      let amount;
      
      // Map product IDs to price IDs
      const planProductMap = {
        "prod_S8QWDRCVcz07An": { name: "Starter", monthlyPrice: 4999, yearlyPrice: 49990 },
        "prod_S8QXUopH7dXHrJ": { name: "Essential", monthlyPrice: 29999, yearlyPrice: 299990 },
        "prod_S8QYxTHNgV2Dmr": { name: "Basic", monthlyPrice: 74999, yearlyPrice: 749990 },
        "prod_S8QZE7hzuMcjru": { name: "Pro", monthlyPrice: 149999, yearlyPrice: 1499990 }
      };
      
      // Get Stripe customer ID or create one
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      let stripeCustomerId = user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        // Create new customer
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
        });
        
        stripeCustomerId = customer.id;
        await storage.updateUserStripeCustomerId(userId, stripeCustomerId);
      }
      
      // Get plan details
      const planDetails = planProductMap[planId as keyof typeof planProductMap];
      
      if (!planDetails) {
        return res.status(400).json({ error: "Invalid plan ID" });
      }
      
      // Set price based on billing period
      amount = billingPeriod === 'yearly' ? planDetails.yearlyPrice : planDetails.monthlyPrice;
      
      // First, check if there's already a price for this product
      const prices = await stripe.prices.list({
        product: planId,
        active: true,
      });
      
      let priceId;
      
      // Find price matching our criteria or create a new one
      if (prices.data.length > 0) {
        // Try to find a matching price with the right amount and interval
        const matchingPrice = prices.data.find(price => 
          price.unit_amount === amount && 
          price.recurring?.interval === (billingPeriod === 'yearly' ? 'year' : 'month')
        );
        
        if (matchingPrice) {
          priceId = matchingPrice.id;
        }
      }
      
      // If no matching price found, create a new one
      if (!priceId) {
        const newPrice = await stripe.prices.create({
          product: planId,
          unit_amount: amount,
          currency: 'usd',
          recurring: {
            interval: billingPeriod === 'yearly' ? 'year' : 'month',
          },
        });
        priceId = newPrice.id;
      }
      
      // Create subscription through Stripe using price ID
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [
          {
            price: priceId,
          },
        ],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice'],
      });
      
      // Get payment intent client secret
      const invoice = subscription.latest_invoice as any;
      
      if (!invoice || !invoice.payment_intent) {
        throw new Error("Failed to create subscription payment intent");
      }
      
      let clientSecret = "";
      
      // Check if payment_intent is a string ID or an expanded object
      if (typeof invoice.payment_intent === 'string') {
        const paymentIntent = await stripe.paymentIntents.retrieve(invoice.payment_intent);
        clientSecret = paymentIntent.client_secret || "";
      } else {
        // It's already an expanded object
        clientSecret = invoice.payment_intent.client_secret || "";
      }
      
      // Create subscription record in our database
      await storage.createSubscription({
        userId,
        stripeSubscriptionId: subscription.id,
        planId,
        status: subscription.status,
        // Convert Unix timestamps to JavaScript Date objects
        currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
        currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
        // cancelAtPeriodEnd field removed as it doesn't exist in our schema
      });
      
      // Update user's subscription plan status
      await storage.updateUserSubscription(userId, planDetails.name, "active");
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: clientSecret,
      });
    } catch (error: any) {
      console.error("Create subscription error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/subscriptions/plans", async (req, res) => {
    try {
      // Return pricing plans information
      const plans = [
        {
          id: "prod_S8QWDRCVcz07An",
          name: "Starter",
          monthlyPrice: 49.99,
          yearlyPrice: 539.89,
          features: [
            "50 minutes of AI usage per month",
            "Unlimited AI agents",
            "5 concurrent calls",
            "Voice API, LLM, transcriber costs",
            "API integrations",
            "Real-time booking",
            "Human transfer",
            "Community support"
          ],
          overageFee: "$0.35/minute"
        },
        {
          id: "prod_S8QXUopH7dXHrJ",
          name: "Essential",
          monthlyPrice: 299.99,
          yearlyPrice: 3239.89,
          features: [
            "500 minutes of AI usage per month",
            "Unlimited AI agents",
            "10 concurrent calls",
            "All Starter features"
          ],
          overageFee: "$0.30/minute"
        },
        {
          id: "prod_S8QYxTHNgV2Dmr",
          name: "Basic",
          monthlyPrice: 749.99,
          yearlyPrice: 8099.89,
          features: [
            "1,250 minutes of AI usage per month",
            "Unlimited AI agents",
            "25 concurrent calls",
            "All Essential features",
            "Team access",
            "Support via ticketing"
          ],
          overageFee: "$0.25/minute"
        },
        {
          id: "prod_S8QZE7hzuMcjru",
          name: "Pro",
          monthlyPrice: 1499.99,
          yearlyPrice: 16199.89,
          features: [
            "2,500 minutes of AI usage per month",
            "Unlimited AI agents",
            "50 concurrent calls",
            "All Basic features"
          ],
          overageFee: "$0.20/minute"
        }
      ];
      
      res.json(plans);
    } catch (error: any) {
      console.error("Get plans error:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  app.delete("/api/subscriptions/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId;
      const { id } = req.params;
      
      // Get subscription
      const subscription = await storage.getSubscriptionByStripeId(id);
      
      if (!subscription) {
        return res.status(404).json({ error: "Subscription not found" });
      }
      
      // Check if user owns the subscription
      if (subscription.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      // Cancel subscription in Stripe
      await stripe.subscriptions.update(id, {
        cancel_at_period_end: true,
      });
      
      // Update subscription status in our database
      await storage.updateSubscription(subscription.id, {
        status: "cancelling",
      });
      
      // Update user's subscription status
      await storage.updateUserSubscription(userId, subscription.planId, "cancelling");
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Cancel subscription error:", error);
      res.status(500).json({ error: error.message });
    }
  });
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

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
