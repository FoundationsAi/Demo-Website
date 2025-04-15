import { 
  User, InsertUser, users, 
  Agent, InsertAgent, agents,
  Message, InsertMessage, messages,
  Appointment, InsertAppointment, appointments,
  DemoRequest, InsertDemoRequest, demoRequests,
  Payment, InsertPayment, payments,
  Subscription, InsertSubscription, subscriptions,
  Document, InsertDocument, documents,
  CustomAgent, InsertCustomAgent, customAgents,
  Lead, InsertLead, leads
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;

  // Agent methods
  getAgent(id: number): Promise<Agent | undefined>;
  getAgentByType(type: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  listAgents(): Promise<Agent[]>;

  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySessionId(sessionId: string): Promise<Message[]>;

  // Appointment methods
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentsByEmail(email: string): Promise<Appointment[]>;
  getAppointmentsByUserId(userId: number): Promise<Appointment[]>;

  // Demo request methods
  createDemoRequest(demoRequest: InsertDemoRequest): Promise<DemoRequest>;

  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByPaymentIntentId(paymentIntentId: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
  
  // Subscription methods
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  getSubscriptionsByUserId(userId: number): Promise<Subscription[]>;
  updateSubscription(id: number, subscriptionData: Partial<InsertSubscription>): Promise<Subscription>;
  
  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsByUserId(userId: number): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  deleteDocument(id: number): Promise<void>;
  
  // Custom Agent methods
  createCustomAgent(customAgent: InsertCustomAgent): Promise<CustomAgent>;
  getCustomAgentsByUserId(userId: number): Promise<CustomAgent[]>;
  getCustomAgent(id: number): Promise<CustomAgent | undefined>;
  updateCustomAgent(id: number, agentData: Partial<InsertCustomAgent>): Promise<CustomAgent>;
  deleteCustomAgent(id: number): Promise<void>;
  
  // Lead methods
  createLead(lead: InsertLead): Promise<Lead>;
  getLeadsByUserId(userId: number): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead>;
  deleteLead(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return user;
  }

  // Agent methods
  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async getAgentByType(type: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.type, type));
    return agent;
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const [agent] = await db.insert(agents).values(insertAgent).returning();
    return agent;
  }

  async listAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }

  async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.sessionId, sessionId));
  }

  // Appointment methods
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async getAppointmentsByEmail(email: string): Promise<Appointment[]> {
    return await db.select().from(appointments).where(eq(appointments.email, email));
  }
  
  async getAppointmentsByUserId(userId: number): Promise<Appointment[]> {
    // Since appointments don't have a direct userId field, we would typically join with users
    // For now, we'll just get appointments by email using the user's email
    const user = await this.getUser(userId);
    if (!user) {
      return [];
    }
    return await this.getAppointmentsByEmail(user.email);
  }

  // Demo request methods
  async createDemoRequest(insertDemoRequest: InsertDemoRequest): Promise<DemoRequest> {
    const [demoRequest] = await db.insert(demoRequests).values(insertDemoRequest).returning();
    return demoRequest;
  }

  // Payment methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(insertPayment).returning();
    return payment;
  }

  async getPaymentByPaymentIntentId(paymentIntentId: string): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.stripePaymentIntentId, paymentIntentId));
    return payment;
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const [payment] = await db
      .update(payments)
      .set({ status })
      .where(eq(payments.id, id))
      .returning();
    
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    return payment;
  }
  
  // Subscription methods
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();
    return subscription;
  }
  
  async getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined> {
    const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
    return subscription;
  }
  
  async getSubscriptionsByUserId(userId: number): Promise<Subscription[]> {
    return await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  }
  
  async updateSubscription(id: number, subscriptionData: Partial<InsertSubscription>): Promise<Subscription> {
    const [subscription] = await db
      .update(subscriptions)
      .set(subscriptionData)
      .where(eq(subscriptions.id, id))
      .returning();
    
    if (!subscription) {
      throw new Error(`Subscription with ID ${id} not found`);
    }
    
    return subscription;
  }
  
  // Document methods
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(insertDocument).returning();
    return document;
  }
  
  async getDocumentsByUserId(userId: number): Promise<Document[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  }
  
  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }
  
  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }
  
  // Custom Agent methods
  async createCustomAgent(insertCustomAgent: InsertCustomAgent): Promise<CustomAgent> {
    const [customAgent] = await db.insert(customAgents).values(insertCustomAgent).returning();
    return customAgent;
  }
  
  async getCustomAgentsByUserId(userId: number): Promise<CustomAgent[]> {
    return await db.select().from(customAgents).where(eq(customAgents.userId, userId));
  }
  
  async getCustomAgent(id: number): Promise<CustomAgent | undefined> {
    const [customAgent] = await db.select().from(customAgents).where(eq(customAgents.id, id));
    return customAgent;
  }
  
  async updateCustomAgent(id: number, agentData: Partial<InsertCustomAgent>): Promise<CustomAgent> {
    const [customAgent] = await db
      .update(customAgents)
      .set(agentData)
      .where(eq(customAgents.id, id))
      .returning();
    
    if (!customAgent) {
      throw new Error(`Custom agent with ID ${id} not found`);
    }
    
    return customAgent;
  }
  
  async deleteCustomAgent(id: number): Promise<void> {
    await db.delete(customAgents).where(eq(customAgents.id, id));
  }
  
  // Lead methods
  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }
  
  async getLeadsByUserId(userId: number): Promise<Lead[]> {
    return await db.select().from(leads).where(eq(leads.userId, userId));
  }
  
  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }
  
  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set(leadData)
      .where(eq(leads.id, id))
      .returning();
    
    if (!lead) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    
    return lead;
  }
  
  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  // Initialize sample agents if none exist
  async initializeAgents(): Promise<void> {
    const existingAgents = await this.listAgents();
    
    if (existingAgents.length === 0) {
      const sampleAgents: InsertAgent[] = [
        {
          name: "AI Customer Service",
          description: "Friendly and efficient agent that handles customer inquiries with empathy and precision.",
          badge: "24/7 Availability",
          type: "customer-service"
        },
        {
          name: "AI Sales Qualification",
          description: "Professional agent that qualifies leads, books meetings, and nurtures potential customers.",
          badge: "Lead Generation",
          type: "sales"
        },
        {
          name: "AI Receptionist",
          description: "Professional virtual receptionist that greets callers, directs inquiries, and schedules appointments.",
          badge: "Call Handling",
          type: "receptionist"
        }
      ];

      for (const agent of sampleAgents) {
        await this.createAgent(agent);
      }
    }
  }
}

export const storage = new DatabaseStorage();