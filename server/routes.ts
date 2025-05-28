import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { googleSheetsService } from "./services/googleSheets";
import { emailService } from "./services/email";
import { openaiService } from "./services/openai";
import { insertLeadSchema, insertEmailTemplateSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  await googleSheetsService.initialize();
  await emailService.testConnection();
  
  // Start Google Sheets monitoring
  googleSheetsService.startMonitoring(30000); // Check every 30 seconds

  // Dashboard Stats
  app.get("/api/stats", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      const activities = await storage.getActivities(10);
      const emailLogs = await storage.getEmailLogs();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = {
        newLeadsToday: leads.filter(lead => 
          lead.createdAt && new Date(lead.createdAt) >= today
        ).length,
        qualifiedLeads: leads.filter(lead => lead.status === 'qualified').length,
        emailsSent: emailLogs.length,
        callsScheduled: leads.filter(lead => lead.scheduledCallAt).length,
        totalLeads: leads.length,
        emailOpenRate: emailLogs.length > 0 ? 
          Math.round((emailLogs.filter(log => log.openedAt).length / emailLogs.length) * 100) : 0,
      };

      res.json(stats);
    } catch (error) {
      console.error('Failed to get stats:', error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Leads Management
  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      console.error('Failed to get leads:', error);
      res.status(500).json({ message: "Failed to get leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.getLead(id);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.json(lead);
    } catch (error) {
      console.error('Failed to get lead:', error);
      res.status(500).json({ message: "Failed to get lead" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      
      // Check if lead already exists
      const existingLead = await storage.getLeadByEmail(leadData.email);
      if (existingLead) {
        return res.status(400).json({ message: "Lead with this email already exists" });
      }

      const lead = await storage.createLead(leadData);
      
      // Send welcome email if configured
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        await emailService.sendWelcomeEmail(lead);
      }

      res.status(201).json(lead);
    } catch (error) {
      console.error('Failed to create lead:', error);
      res.status(500).json({ message: "Failed to create lead" });
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const lead = await storage.updateLead(id, updates);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      res.json(lead);
    } catch (error) {
      console.error('Failed to update lead:', error);
      res.status(500).json({ message: "Failed to update lead" });
    }
  });

  // Lead Actions
  app.post("/api/leads/:id/qualify", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { responseText } = req.body;
      
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const qualification = await openaiService.qualifyLead(lead, responseText);
      
      let newStatus = lead.status;
      if (qualification.isQualified && qualification.score >= 70) {
        newStatus = 'qualified';
      } else if (qualification.score < 30) {
        newStatus = 'unqualified';
      }

      const updatedLead = await storage.updateLead(id, {
        status: newStatus,
        score: qualification.score,
        qualificationData: qualification,
      });

      await storage.createActivity({
        leadId: id,
        type: 'lead_qualified',
        description: `Lead ${qualification.isQualified ? 'qualified' : 'not qualified'} with score ${qualification.score}`,
        metadata: { qualification },
      });

      res.json({ lead: updatedLead, qualification });
    } catch (error) {
      console.error('Failed to qualify lead:', error);
      res.status(500).json({ message: "Failed to qualify lead" });
    }
  });

  app.post("/api/leads/:id/send-email", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { message } = req.body;
      
      const lead = await storage.getLead(id);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      const success = await emailService.sendFollowUpEmail(lead, message);
      
      if (success) {
        res.json({ message: "Email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send email" });
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  app.post("/api/leads/:id/schedule-call", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { callDateTime } = req.body;
      
      const lead = await storage.updateLead(id, {
        status: 'scheduled',
        scheduledCallAt: new Date(callDateTime),
      });

      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }

      await storage.createActivity({
        leadId: id,
        type: 'call_scheduled',
        description: `Discovery call scheduled with ${lead.name}`,
        metadata: { callDateTime },
      });

      res.json(lead);
    } catch (error) {
      console.error('Failed to schedule call:', error);
      res.status(500).json({ message: "Failed to schedule call" });
    }
  });

  // Activities
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error('Failed to get activities:', error);
      res.status(500).json({ message: "Failed to get activities" });
    }
  });

  app.get("/api/leads/:id/activities", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const activities = await storage.getActivitiesForLead(id);
      res.json(activities);
    } catch (error) {
      console.error('Failed to get lead activities:', error);
      res.status(500).json({ message: "Failed to get lead activities" });
    }
  });

  // Email Templates
  app.get("/api/email-templates", async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error) {
      console.error('Failed to get email templates:', error);
      res.status(500).json({ message: "Failed to get email templates" });
    }
  });

  app.post("/api/email-templates", async (req, res) => {
    try {
      const templateData = insertEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error('Failed to create email template:', error);
      res.status(500).json({ message: "Failed to create email template" });
    }
  });

  // System Status
  app.get("/api/system-status", async (req, res) => {
    try {
      const status = {
        googleSheets: {
          connected: !!process.env.GOOGLE_SHEETS_ID && !!process.env.GOOGLE_SHEETS_CREDENTIALS,
          status: 'active',
          lastCheck: new Date().toISOString(),
        },
        aiEngine: {
          connected: !!process.env.OPENAI_API_KEY,
          status: 'active',
          model: 'gpt-4o',
        },
        emailService: {
          connected: !!process.env.SMTP_USER && !!process.env.SMTP_PASS,
          status: 'active',
          provider: 'SMTP',
        },
        crmSync: {
          connected: false,
          status: 'inactive',
          lastSync: null,
        },
      };

      res.json(status);
    } catch (error) {
      console.error('Failed to get system status:', error);
      res.status(500).json({ message: "Failed to get system status" });
    }
  });

  // Manual sync endpoint
  app.post("/api/sync/google-sheets", async (req, res) => {
    try {
      await googleSheetsService.checkForNewLeads();
      res.json({ message: "Google Sheets sync completed" });
    } catch (error) {
      console.error('Failed to sync Google Sheets:', error);
      res.status(500).json({ message: "Failed to sync Google Sheets" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
