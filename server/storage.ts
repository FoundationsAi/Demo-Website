import { 
  User, InsertUser, users, 
  Agent, InsertAgent, agents,
  Message, InsertMessage, messages,
  Appointment, InsertAppointment, appointments,
  DemoRequest, InsertDemoRequest, demoRequests,
  Payment, InsertPayment, payments,
  Subscription, InsertSubscription, subscriptions
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
  updateUser(id: number, data: Partial<InsertUser>): Promise<User>;
  updateUserStripeCustomerId(id: number, stripeCustomerId: string): Promise<User>;
  updateUserSubscription(id: number, plan: string, status: string): Promise<User>;

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

  // Demo request methods
  createDemoRequest(demoRequest: InsertDemoRequest): Promise<DemoRequest>;

  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentByPaymentIntentId(paymentIntentId: string): Promise<Payment | undefined>;
  updatePaymentStatus(id: number, status: string): Promise<Payment>;
  
  // Subscription methods
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getSubscriptionByUserId(userId: number): Promise<Subscription | undefined>;
  getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | undefined>;
  updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
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