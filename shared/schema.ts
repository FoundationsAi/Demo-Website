import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  companyName: text("company_name"),
  companyLogo: text("company_logo"),
  stripeCustomerId: text("stripe_customer_id"),
  subscriptionStatus: text("subscription_status").default("inactive"),
  subscriptionPlan: text("subscription_plan"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  companyName: true,
  stripeCustomerId: true,
  subscriptionStatus: true,
  subscriptionPlan: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Agent schema
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  badge: text("badge").notNull(),
  type: text("type").notNull(),
});

export const insertAgentSchema = createInsertSchema(agents).pick({
  name: true,
  description: true,
  badge: true,
  type: true,
});

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

// Chat message schema
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  agentId: integer("agent_id").notNull(),
  sender: text("sender").notNull(), // 'user' or 'ai'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sessionId: true,
  agentId: true,
  sender: true,
  content: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Appointment schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  date: text("date").notNull(),
  timeSlot: text("time_slot").notNull(),
  notes: text("notes"),
  agentType: text("agent_type"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  name: true,
  email: true,
  phone: true,
  date: true,
  timeSlot: true,
  notes: true,
  agentType: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Demo request schema
export const demoRequests = pgTable("demo_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  agentType: text("agent_type").notNull(),
  useCase: text("use_case"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDemoRequestSchema = createInsertSchema(demoRequests).pick({
  name: true,
  email: true,
  phone: true,
  agentType: true,
  useCase: true,
});

export type InsertDemoRequest = z.infer<typeof insertDemoRequestSchema>;
export type DemoRequest = typeof demoRequests.$inferSelect;

// Payment schema
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  stripePaymentIntentId: true,
  amount: true,
  status: true,
  email: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Subscription schema
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").notNull().unique(),
  plan: text("plan").notNull(), // starter, essential, basic, pro
  status: text("status").notNull(), // active, canceled, past_due, etc.
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  stripeSubscriptionId: true,
  plan: true,
  status: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

// Document schema (for knowledge base)
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileType: text("file_type").notNull(), // pdf, docx, etc.
  fileSize: integer("file_size").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  userId: true,
  title: true,
  fileName: true,
  filePath: true,
  fileType: true,
  fileSize: true,
  description: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Custom AI Agent schema
export const customAgents = pgTable("custom_agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  behavior: text("behavior"),
  documentIds: text("document_ids").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCustomAgentSchema = createInsertSchema(customAgents).pick({
  userId: true,
  name: true,
  description: true,
  type: true,
  behavior: true,
  documentIds: true,
});

export type InsertCustomAgent = z.infer<typeof insertCustomAgentSchema>;
export type CustomAgent = typeof customAgents.$inferSelect;

// Lead schema
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  status: text("status").default("new"), // new, contacted, qualified, etc.
  source: text("source"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).pick({
  userId: true,
  name: true,
  email: true,
  phone: true,
  company: true,
  status: true,
  source: true,
  notes: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
