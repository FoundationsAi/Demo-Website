import { 
  User, InsertUser, users, 
  Agent, InsertAgent, agents,
  Message, InsertMessage, messages,
  Appointment, InsertAppointment, appointments,
  DemoRequest, InsertDemoRequest, demoRequests,
  Payment, InsertPayment, payments
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private agents: Map<number, Agent>;
  private messages: Map<number, Message>;
  private appointments: Map<number, Appointment>;
  private demoRequests: Map<number, DemoRequest>;
  private payments: Map<number, Payment>;
  
  private userCurrentId: number;
  private agentCurrentId: number;
  private messageCurrentId: number;
  private appointmentCurrentId: number;
  private demoRequestCurrentId: number;
  private paymentCurrentId: number;

  constructor() {
    this.users = new Map();
    this.agents = new Map();
    this.messages = new Map();
    this.appointments = new Map();
    this.demoRequests = new Map();
    this.payments = new Map();
    
    this.userCurrentId = 1;
    this.agentCurrentId = 1;
    this.messageCurrentId = 1;
    this.appointmentCurrentId = 1;
    this.demoRequestCurrentId = 1;
    this.paymentCurrentId = 1;

    // Initialize with some agents
    this.initAgents();
  }

  // Initialize some sample agents
  private initAgents() {
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

    sampleAgents.forEach(agent => this.createAgent(agent));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Agent methods
  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async getAgentByType(type: string): Promise<Agent | undefined> {
    return Array.from(this.agents.values()).find(
      (agent) => agent.type === type,
    );
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.agentCurrentId++;
    const agent: Agent = { ...insertAgent, id };
    this.agents.set(id, agent);
    return agent;
  }

  async listAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  // Message methods
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageCurrentId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesBySessionId(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.sessionId === sessionId,
    );
  }

  // Appointment methods
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentCurrentId++;
    const appointment: Appointment = { 
      ...insertAppointment, 
      id, 
      createdAt: new Date() 
    };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointmentsByEmail(email: string): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.email === email,
    );
  }

  // Demo request methods
  async createDemoRequest(insertDemoRequest: InsertDemoRequest): Promise<DemoRequest> {
    const id = this.demoRequestCurrentId++;
    const demoRequest: DemoRequest = { 
      ...insertDemoRequest, 
      id, 
      createdAt: new Date() 
    };
    this.demoRequests.set(id, demoRequest);
    return demoRequest;
  }

  // Payment methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.paymentCurrentId++;
    const payment: Payment = { 
      ...insertPayment, 
      id, 
      createdAt: new Date() 
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPaymentByPaymentIntentId(paymentIntentId: string): Promise<Payment | undefined> {
    return Array.from(this.payments.values()).find(
      (payment) => payment.stripePaymentIntentId === paymentIntentId,
    );
  }

  async updatePaymentStatus(id: number, status: string): Promise<Payment> {
    const payment = this.payments.get(id);
    if (!payment) {
      throw new Error(`Payment with ID ${id} not found`);
    }
    
    const updatedPayment = { ...payment, status };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
}

export const storage = new MemStorage();
