import { 
  leads, 
  emailTemplates, 
  emailSentLog, 
  activities, 
  systemSettings,
  type Lead, 
  type InsertLead,
  type EmailTemplate,
  type InsertEmailTemplate,
  type Activity,
  type InsertActivity,
  type EmailSentLog,
  type SystemSettings
} from "@shared/schema";

export interface IStorage {
  // Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  getLeadByEmail(email: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;

  // Email Templates
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: number): Promise<EmailTemplate | undefined>;
  getDefaultEmailTemplate(): Promise<EmailTemplate | undefined>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined>;

  // Email Logs
  getEmailLogs(): Promise<EmailSentLog[]>;
  createEmailLog(log: Omit<EmailSentLog, 'id'>): Promise<EmailSentLog>;
  updateEmailLog(id: number, updates: Partial<EmailSentLog>): Promise<EmailSentLog | undefined>;

  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  getActivitiesForLead(leadId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // System Settings
  getSystemSetting(key: string): Promise<SystemSettings | undefined>;
  setSystemSetting(key: string, value: string): Promise<SystemSettings>;
}

export class MemStorage implements IStorage {
  private leads: Map<number, Lead>;
  private emailTemplates: Map<number, EmailTemplate>;
  private emailLogs: Map<number, EmailSentLog>;
  private activities: Map<number, Activity>;
  private systemSettings: Map<string, SystemSettings>;
  private currentLeadId: number;
  private currentTemplateId: number;
  private currentLogId: number;
  private currentActivityId: number;

  constructor() {
    this.leads = new Map();
    this.emailTemplates = new Map();
    this.emailLogs = new Map();
    this.activities = new Map();
    this.systemSettings = new Map();
    this.currentLeadId = 1;
    this.currentTemplateId = 1;
    this.currentLogId = 1;
    this.currentActivityId = 1;

    // Create default email template
    this.createEmailTemplate({
      name: "Default Welcome Email",
      subject: "Welcome to Zelira.ai - Transform Your Business with AI",
      body: `Hi {{name}},

Thank you for your interest in Zelira.ai! We're excited to help you transform your business with our cutting-edge AI solutions.

Zelira.ai specializes in:
• AI-powered automation and workflow optimization
• Intelligent data analysis and insights
• Custom AI solutions tailored to your business needs
• Seamless integration with your existing systems

To better understand how we can help your business, I'd love to learn more about:

1. What specific challenges are you currently facing that AI could help solve?
2. What's your current experience with AI/automation tools?
3. What's your timeline for implementing new solutions?
4. What's your budget range for AI solutions?

Would you be interested in a 15-minute discovery call to discuss how Zelira.ai can specifically benefit {{company}}?

Best regards,
Sophie
AI Sales Assistant
Zelira.ai`,
      isDefault: true,
    });
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async getLeadByEmail(email: string): Promise<Lead | undefined> {
    return Array.from(this.leads.values()).find(lead => lead.email === email);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.currentLeadId++;
    const now = new Date();
    const lead: Lead = { 
      id, 
      name: insertLead.name,
      email: insertLead.email,
      company: insertLead.company || null,
      role: insertLead.role || null,
      phone: insertLead.phone || null,
      source: insertLead.source || 'google_sheets',
      status: insertLead.status || 'new',
      score: insertLead.score || 0,
      qualificationData: insertLead.qualificationData || null,
      responseData: insertLead.responseData || null,
      lastContactedAt: insertLead.lastContactedAt || null,
      scheduledCallAt: insertLead.scheduledCallAt || null,
      createdAt: now,
      updatedAt: now,
    };
    this.leads.set(id, lead);
    
    // Create activity
    await this.createActivity({
      leadId: id,
      type: "lead_created",
      description: `New lead ${lead.name} from ${lead.company || 'Unknown Company'} created`,
      metadata: { source: lead.source },
    });
    
    return lead;
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;

    const updatedLead: Lead = { 
      ...lead, 
      ...updates, 
      updatedAt: new Date(),
    };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }

  // Email Templates
  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values());
  }

  async getEmailTemplate(id: number): Promise<EmailTemplate | undefined> {
    return this.emailTemplates.get(id);
  }

  async getDefaultEmailTemplate(): Promise<EmailTemplate | undefined> {
    return Array.from(this.emailTemplates.values()).find(template => template.isDefault);
  }

  async createEmailTemplate(insertTemplate: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = this.currentTemplateId++;
    const template: EmailTemplate = { 
      id, 
      name: insertTemplate.name,
      subject: insertTemplate.subject,
      body: insertTemplate.body,
      isDefault: insertTemplate.isDefault || false,
      createdAt: new Date(),
    };
    this.emailTemplates.set(id, template);
    return template;
  }

  async updateEmailTemplate(id: number, updates: Partial<InsertEmailTemplate>): Promise<EmailTemplate | undefined> {
    const template = this.emailTemplates.get(id);
    if (!template) return undefined;

    const updatedTemplate: EmailTemplate = { ...template, ...updates };
    this.emailTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  // Email Logs
  async getEmailLogs(): Promise<EmailSentLog[]> {
    return Array.from(this.emailLogs.values()).sort((a, b) => 
      new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime()
    );
  }

  async createEmailLog(log: Omit<EmailSentLog, 'id'>): Promise<EmailSentLog> {
    const id = this.currentLogId++;
    const emailLog: EmailSentLog = { ...log, id };
    this.emailLogs.set(id, emailLog);
    return emailLog;
  }

  async updateEmailLog(id: number, updates: Partial<EmailSentLog>): Promise<EmailSentLog | undefined> {
    const log = this.emailLogs.get(id);
    if (!log) return undefined;

    const updatedLog: EmailSentLog = { ...log, ...updates };
    this.emailLogs.set(id, updatedLog);
    return updatedLog;
  }

  // Activities
  async getActivities(limit = 50): Promise<Activity[]> {
    const activities = Array.from(this.activities.values())
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    
    return limit ? activities.slice(0, limit) : activities;
  }

  async getActivitiesForLead(leadId: number): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .filter(activity => activity.leadId === leadId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = { 
      id, 
      leadId: insertActivity.leadId || null,
      type: insertActivity.type,
      description: insertActivity.description,
      metadata: insertActivity.metadata || null,
      createdAt: new Date(),
    };
    this.activities.set(id, activity);
    return activity;
  }

  // System Settings
  async getSystemSetting(key: string): Promise<SystemSettings | undefined> {
    return this.systemSettings.get(key);
  }

  async setSystemSetting(key: string, value: string): Promise<SystemSettings> {
    const setting: SystemSettings = {
      id: 1,
      key,
      value,
      updatedAt: new Date(),
    };
    this.systemSettings.set(key, setting);
    return setting;
  }
}

export const storage = new MemStorage();
