import { 
  User, InsertUser, users, 
  Agent, InsertAgent, agents,
  Message, InsertMessage, messages,
  Appointment, InsertAppointment, appointments,
  DemoRequest, InsertDemoRequest, demoRequests,
  Payment, InsertPayment, payments,
  Subscription, InsertSubscription, subscriptions,
  Lead, InsertLead, leads,
  Call, InsertCall, calls,
  KnowledgeDocument, InsertKnowledgeDocument, knowledgeDocuments,
  EnhancedAppointment, InsertEnhancedAppointment, enhancedAppointments,
  UserSettings, InsertUserSettings, userSettings,
  TeamMember, InsertTeamMember, teamMembers,
  CustomAgent, InsertCustomAgent, customAgents
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, or, isNull } from "drizzle-orm";
import bcrypt from 'bcrypt';

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Enhanced User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  
  // Authentication methods
  validateUserPassword(email: string, password: string): Promise<User | null>;
  
  // Subscription methods
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  updateSubscription(id: number, subscriptionData: Partial<InsertSubscription>): Promise<Subscription>;
  cancelSubscription(id: number): Promise<Subscription>;

  // Agent methods
  getAgent(id: number): Promise<Agent | undefined>;
  getAgentByType(type: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  listAgents(): Promise<Agent[]>;

  // Message methods
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesBySessionId(sessionId: string): Promise<Message[]>;

  // Original Appointment methods (legacy)
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointmentsByEmail(email: string): Promise<Appointment[]>;

  // Enhanced Appointment methods
  createEnhancedAppointment(appointment: InsertEnhancedAppointment): Promise<EnhancedAppointment>;
  getEnhancedAppointmentsByUserId(userId: number): Promise<EnhancedAppointment[]>;
  updateEnhancedAppointment(id: number, appointmentData: Partial<InsertEnhancedAppointment>): Promise<EnhancedAppointment>;

  // Demo request methods
  createDemoRequest(demoRequest: InsertDemoRequest): Promise<DemoRequest>;

  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByPaymentIntentId(paymentIntentId: string): Promise<Payment | undefined>;
  getPaymentsByUserId(userId: number): Promise<Payment[]>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
  
  // Leads/CRM methods
  createLead(lead: InsertLead): Promise<Lead>;
  getLeadsByUserId(userId: number): Promise<Lead[]>;
  updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead>;
  
  // Call tracking methods
  createCall(call: InsertCall): Promise<Call>;
  getCallsByUserId(userId: number, limit?: number): Promise<Call[]>;
  
  // Knowledge base methods
  createKnowledgeDocument(document: InsertKnowledgeDocument): Promise<KnowledgeDocument>;
  getKnowledgeDocumentsByUserId(userId: number): Promise<KnowledgeDocument[]>;
  updateKnowledgeDocumentStatus(id: number, status: string): Promise<KnowledgeDocument>;
  
  // User settings methods
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: number, settingsData: Partial<InsertUserSettings>): Promise<UserSettings>;
  
  // Team management methods
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  getTeamMembers(ownerId: number): Promise<TeamMember[]>;
  updateTeamMemberRole(id: number, role: string): Promise<TeamMember>;
  removeTeamMember(id: number): Promise<void>;
  
  // Custom AI Agent methods
  createCustomAgent(agent: InsertCustomAgent): Promise<CustomAgent>;
  getCustomAgentsByUserId(userId: number): Promise<CustomAgent[]>;
  updateCustomAgent(id: number, agentData: Partial<InsertCustomAgent>): Promise<CustomAgent>;
}

export class DatabaseStorage implements IStorage {
  // Enhanced User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Hash password if provided
    let userData = { ...insertUser };
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }
    
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    // If password is being updated, hash it
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with ID ${id} not found`);
    }
    
    return updatedUser;
  }
  
  // Authentication methods
  async validateUserPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    
    if (!user || !user.password) {
      return null;
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return null;
    }
    
    // Update last login
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));
    
    return user;
  }
  
  // Subscription methods
  async createSubscription(insertSubscription: InsertSubscription): Promise<Subscription> {
    const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();
    return subscription;
  }
  
  async getSubscriptionByUserId(userId: number): Promise<Subscription | undefined> {
    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt))
      .limit(1);
    
    return subscription;
  }
  
  async updateSubscription(id: number, subscriptionData: Partial<InsertSubscription>): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ ...subscriptionData, updatedAt: new Date() })
      .where(eq(subscriptions.id, id))
      .returning();
    
    if (!updatedSubscription) {
      throw new Error(`Subscription with ID ${id} not found`);
    }
    
    return updatedSubscription;
  }
  
  async cancelSubscription(id: number): Promise<Subscription> {
    const [updatedSubscription] = await db
      .update(subscriptions)
      .set({ 
        status: 'canceled',
        cancelAtPeriodEnd: true,
        updatedAt: new Date()  
      })
      .where(eq(subscriptions.id, id))
      .returning();
    
    if (!updatedSubscription) {
      throw new Error(`Subscription with ID ${id} not found`);
    }
    
    return updatedSubscription;
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

  async getPaymentsByUserId(userId: number): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
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
  
  // Enhanced Appointment methods
  async createEnhancedAppointment(appointment: InsertEnhancedAppointment): Promise<EnhancedAppointment> {
    const [enhancedAppointment] = await db.insert(enhancedAppointments).values(appointment).returning();
    return enhancedAppointment;
  }
  
  async getEnhancedAppointmentsByUserId(userId: number): Promise<EnhancedAppointment[]> {
    return await db
      .select()
      .from(enhancedAppointments)
      .where(eq(enhancedAppointments.userId, userId))
      .orderBy(desc(enhancedAppointments.startTime));
  }
  
  async updateEnhancedAppointment(id: number, appointmentData: Partial<InsertEnhancedAppointment>): Promise<EnhancedAppointment> {
    const [updatedAppointment] = await db
      .update(enhancedAppointments)
      .set({ ...appointmentData, updatedAt: new Date() })
      .where(eq(enhancedAppointments.id, id))
      .returning();
    
    if (!updatedAppointment) {
      throw new Error(`Appointment with ID ${id} not found`);
    }
    
    return updatedAppointment;
  }
  
  // Leads/CRM methods
  async createLead(lead: InsertLead): Promise<Lead> {
    const [newLead] = await db.insert(leads).values(lead).returning();
    return newLead;
  }
  
  async getLeadsByUserId(userId: number): Promise<Lead[]> {
    return await db
      .select()
      .from(leads)
      .where(eq(leads.userId, userId))
      .orderBy(desc(leads.createdAt));
  }
  
  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead> {
    const [updatedLead] = await db
      .update(leads)
      .set({ ...leadData, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    
    if (!updatedLead) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    
    return updatedLead;
  }
  
  // Call tracking methods
  async createCall(call: InsertCall): Promise<Call> {
    const [newCall] = await db.insert(calls).values(call).returning();
    return newCall;
  }
  
  async getCallsByUserId(userId: number, limit?: number): Promise<Call[]> {
    let query = db
      .select()
      .from(calls)
      .where(eq(calls.userId, userId))
      .orderBy(desc(calls.startTime || calls.createdAt));
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }
  
  // Knowledge base methods
  async createKnowledgeDocument(document: InsertKnowledgeDocument): Promise<KnowledgeDocument> {
    const [newDocument] = await db.insert(knowledgeDocuments).values(document).returning();
    return newDocument;
  }
  
  async getKnowledgeDocumentsByUserId(userId: number): Promise<KnowledgeDocument[]> {
    return await db
      .select()
      .from(knowledgeDocuments)
      .where(eq(knowledgeDocuments.userId, userId))
      .orderBy(desc(knowledgeDocuments.updatedAt));
  }
  
  async updateKnowledgeDocumentStatus(id: number, status: string): Promise<KnowledgeDocument> {
    const [updatedDocument] = await db
      .update(knowledgeDocuments)
      .set({ status, updatedAt: new Date() })
      .where(eq(knowledgeDocuments.id, id))
      .returning();
    
    if (!updatedDocument) {
      throw new Error(`Knowledge document with ID ${id} not found`);
    }
    
    return updatedDocument;
  }
  
  // User settings methods
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    
    return settings;
  }
  
  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [newSettings] = await db.insert(userSettings).values(settings).returning();
    return newSettings;
  }
  
  async updateUserSettings(userId: number, settingsData: Partial<InsertUserSettings>): Promise<UserSettings> {
    const [updatedSettings] = await db
      .update(userSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .where(eq(userSettings.userId, userId))
      .returning();
    
    if (!updatedSettings) {
      throw new Error(`Settings for user with ID ${userId} not found`);
    }
    
    return updatedSettings;
  }
  
  // Team management methods
  async addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const [newTeamMember] = await db.insert(teamMembers).values(teamMember).returning();
    return newTeamMember;
  }
  
  async getTeamMembers(ownerId: number): Promise<TeamMember[]> {
    return await db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.ownerId, ownerId));
  }
  
  async updateTeamMemberRole(id: number, role: string): Promise<TeamMember> {
    const [updatedTeamMember] = await db
      .update(teamMembers)
      .set({ role })
      .where(eq(teamMembers.id, id))
      .returning();
    
    if (!updatedTeamMember) {
      throw new Error(`Team member with ID ${id} not found`);
    }
    
    return updatedTeamMember;
  }
  
  async removeTeamMember(id: number): Promise<void> {
    await db
      .delete(teamMembers)
      .where(eq(teamMembers.id, id));
  }
  
  // Custom AI Agent methods
  async createCustomAgent(agent: InsertCustomAgent): Promise<CustomAgent> {
    const [newAgent] = await db.insert(customAgents).values(agent).returning();
    return newAgent;
  }
  
  async getCustomAgentsByUserId(userId: number): Promise<CustomAgent[]> {
    return await db
      .select()
      .from(customAgents)
      .where(eq(customAgents.userId, userId))
      .orderBy(desc(customAgents.updatedAt));
  }
  
  async updateCustomAgent(id: number, agentData: Partial<InsertCustomAgent>): Promise<CustomAgent> {
    const [updatedAgent] = await db
      .update(customAgents)
      .set({ ...agentData, updatedAt: new Date() })
      .where(eq(customAgents.id, id))
      .returning();
    
    if (!updatedAgent) {
      throw new Error(`Custom agent with ID ${id} not found`);
    }
    
    return updatedAgent;
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