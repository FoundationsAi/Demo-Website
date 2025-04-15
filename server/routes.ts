import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Stripe from "stripe";
import { insertDemoRequestSchema, insertAppointmentSchema } from "@shared/schema";
import { randomUUID } from "crypto";
import passport from 'passport';
import session from 'express-session';
import bodyParser from 'body-parser';
import { initializePassport, authController, authenticateJwt, authorize } from './controllers/auth.controller';
import { stripeController } from './controllers/stripe.controller';
import { dashboardController } from './controllers/dashboard.controller';

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

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize DB with agents if needed
  await storage.initializeAgents();
  
  // Middleware setup
  app.use(bodyParser.json());
  
  // Session setup for passport
  app.use(session({
    secret: process.env.SESSION_SECRET || 'foundations-ai-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
  }));
  
  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());
  initializePassport();

  // Special raw body parser for Stripe webhooks
  app.use('/api/webhook/stripe', bodyParser.raw({ type: 'application/json' }));
  
  // Public API endpoints
  app.get("/api", (req, res) => {
    res.json({ message: "Welcome to Foundations AI API!" });
  });
  
  // Auth routes
  app.post('/api/auth/register', authController.register);
  app.post('/api/auth/login', authController.login);
  app.get('/api/auth/google', authController.googleLogin);
  app.get('/api/auth/google/callback', authController.googleCallback);
  
  // Protected routes (require authentication)
  app.get('/api/auth/profile', authenticateJwt, authController.getProfile);
  app.put('/api/auth/profile', authenticateJwt, authController.updateProfile);
  app.put('/api/auth/settings', authenticateJwt, authController.updateSettings);
  app.post('/api/auth/change-password', authenticateJwt, authController.changePassword);
  
  // Stripe and subscription routes
  app.post('/api/stripe/create-checkout-session', authenticateJwt, stripeController.createCheckoutSession);
  app.get('/api/stripe/subscription', authenticateJwt, stripeController.getUserSubscription);
  app.post('/api/stripe/cancel-subscription', authenticateJwt, stripeController.cancelSubscription);
  app.post('/api/stripe/resume-subscription', authenticateJwt, stripeController.resumeSubscription);
  app.get('/api/stripe/plans', stripeController.getSubscriptionPlans);
  app.post('/api/webhook/stripe', stripeController.handleWebhook);
  
  // Dashboard routes
  app.get('/api/dashboard/overview', authenticateJwt, dashboardController.getOverview);
  
  // Leads/CRM routes
  app.get('/api/leads', authenticateJwt, dashboardController.getLeads);
  app.post('/api/leads', authenticateJwt, dashboardController.createLead);
  app.put('/api/leads/:id', authenticateJwt, dashboardController.updateLead);
  
  // Call center routes
  app.get('/api/calls', authenticateJwt, dashboardController.getCallCenter);
  app.post('/api/calls', authenticateJwt, dashboardController.recordCall);
  
  // Knowledge base routes
  app.get('/api/knowledge', authenticateJwt, dashboardController.getKnowledgeBase);
  app.post('/api/knowledge', authenticateJwt, dashboardController.uploadDocument);
  
  // Appointments routes
  app.get('/api/appointments', authenticateJwt, dashboardController.getAppointments);
  app.post('/api/appointments', authenticateJwt, dashboardController.createAppointment);
  app.put('/api/appointments/:id', authenticateJwt, dashboardController.updateAppointment);
  
  // AI Agents routes
  app.get('/api/agents', authenticateJwt, dashboardController.getAIAgents);
  app.post('/api/agents/custom', authenticateJwt, dashboardController.createCustomAgent);
  app.put('/api/agents/custom/:id', authenticateJwt, dashboardController.updateCustomAgent);
  
  // Admin routes (require admin role)
  app.get('/api/admin/users', authenticateJwt, authorize(['admin']), async (req, res) => {
    res.json({ message: 'Admin only route' });
  });

  // EXISTING FUNCTIONALITY PRESERVED BELOW
  
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

  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}