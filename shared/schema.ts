import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  company: text("company"),
  role: text("role"),
  phone: text("phone"),
  source: text("source").default("google_sheets"),
  status: text("status").notNull().default("new"), // new, contacted, qualified, unqualified, scheduled, closed
  score: integer("score").default(0),
  qualificationData: jsonb("qualification_data"),
  responseData: jsonb("response_data"),
  lastContactedAt: timestamp("last_contacted_at"),
  scheduledCallAt: timestamp("scheduled_call_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailSentLog = pgTable("email_sent_log", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  templateId: integer("template_id").references(() => emailTemplates.id),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  openedAt: timestamp("opened_at"),
  responded: boolean("responded").default(false),
  responseText: text("response_text"),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id),
  type: text("type").notNull(), // lead_created, email_sent, qualified, scheduled, etc.
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type EmailSentLog = typeof emailSentLog.$inferSelect;
export type SystemSettings = typeof systemSettings.$inferSelect;
