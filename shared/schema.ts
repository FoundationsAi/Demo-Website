import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enhanced User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password"),  // Nullable for OAuth users
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImage: text("profile_image"),
  role: text("role").default("user").notNull(), // user, admin
  googleId: text("google_id").unique(),
  stripeCustomerId: text("stripe_customer_id").unique(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  profileImage: true,
  googleId: true,
  role: true,
  stripeCustomerId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Subscription schema
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  stripeSubscriptionId: text("stripe_subscription_id").unique().notNull(),
  status: text("status").notNull(), // 'active', 'canceled', 'past_due', etc
  planType: text("plan_type").notNull(), // 'starter', 'essential', 'pro', etc
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).pick({
  userId: true,
  stripeSubscriptionId: true,
  status: true,
  planType: true,
  currentPeriodStart: true,
  currentPeriodEnd: true,
  cancelAtPeriodEnd: true,
});

export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

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
  userId: integer("user_id").references(() => users.id),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).pick({
  userId: true,
  stripePaymentIntentId: true,
  amount: true,
  status: true,
  email: true,
});

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

// Leads/CRM schema
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  status: text("status").default("new").notNull(), // new, contacted, qualified, converted
  source: text("source"), // website, referral, ad, etc.
  notes: text("notes"),
  lastContactDate: timestamp("last_contact_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  lastContactDate: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Call tracking schema
export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  agentId: integer("agent_id").references(() => agents.id),
  leadId: integer("lead_id").references(() => leads.id),
  duration: integer("duration"), // in seconds
  status: text("status").notNull(), // completed, missed, scheduled
  notes: text("notes"),
  recordingUrl: text("recording_url"),
  startTime: timestamp("start_time"),
  endTime: timestamp("end_time"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCallSchema = createInsertSchema(calls).pick({
  userId: true,
  agentId: true,
  leadId: true,
  duration: true,
  status: true,
  notes: true,
  recordingUrl: true,
  startTime: true,
  endTime: true,
});

export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = typeof calls.$inferSelect;

// Knowledge base documents schema
export const knowledgeDocuments = pgTable("knowledge_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  documentType: text("document_type").notNull(), // pdf, text, webpage, etc.
  sourceUrl: text("source_url"),
  status: text("status").default("processing").notNull(), // processing, active, error
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertKnowledgeDocumentSchema = createInsertSchema(knowledgeDocuments).pick({
  userId: true,
  title: true,
  content: true,
  documentType: true,
  sourceUrl: true,
  status: true,
});

export type InsertKnowledgeDocument = z.infer<typeof insertKnowledgeDocumentSchema>;
export type KnowledgeDocument = typeof knowledgeDocuments.$inferSelect;

// Enhanced appointments schema with user association
export const enhancedAppointments = pgTable("enhanced_appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  attendeeId: integer("attendee_id").references(() => leads.id),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  status: text("status").default("scheduled").notNull(), // scheduled, completed, canceled
  calendarEventId: text("calendar_event_id"), // ID from external calendar service
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEnhancedAppointmentSchema = createInsertSchema(enhancedAppointments).pick({
  userId: true,
  attendeeId: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  location: true,
  status: true,
  calendarEventId: true,
});

export type InsertEnhancedAppointment = z.infer<typeof insertEnhancedAppointmentSchema>;
export type EnhancedAppointment = typeof enhancedAppointments.$inferSelect;

// User settings schema
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  theme: text("theme").default("dark").notNull(),
  timezone: text("timezone").default("UTC").notNull(),
  languagePreference: text("language_preference").default("en").notNull(),
  dashboardLayout: json("dashboard_layout"), // For customizable dashboard
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).pick({
  userId: true,
  notificationsEnabled: true,
  emailNotifications: true,
  theme: true,
  timezone: true,
  languagePreference: true,
  dashboardLayout: true,
});

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

// Team members schema
export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull().references(() => users.id),
  memberId: integer("member_id").notNull().references(() => users.id),
  role: text("role").default("member").notNull(), // admin, member, viewer
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniqueMembership: unique().on(t.ownerId, t.memberId),
}));

export const insertTeamMemberSchema = createInsertSchema(teamMembers).pick({
  ownerId: true,
  memberId: true,
  role: true,
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Custom AI Agent schema
export const customAgents = pgTable("custom_agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description").notNull(),
  avatar: text("avatar"),
  prompt: text("prompt").notNull(),
  knowledgeDocumentIds: json("knowledge_document_ids"), // Array of document IDs
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCustomAgentSchema = createInsertSchema(customAgents).pick({
  userId: true,
  name: true,
  description: true,
  avatar: true,
  prompt: true,
  knowledgeDocumentIds: true,
  isActive: true,
});

export type InsertCustomAgent = z.infer<typeof insertCustomAgentSchema>;
export type CustomAgent = typeof customAgents.$inferSelect;
