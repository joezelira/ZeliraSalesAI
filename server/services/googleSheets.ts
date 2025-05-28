import { storage } from '../storage';

interface GoogleSheetsConfig {
  webAppUrl: string;
}

export class GoogleSheetsService {
  private config: GoogleSheetsConfig;
  private lastRowCount = 0;

  constructor() {
    this.config = {
      webAppUrl: process.env.GOOGLE_WEBAPP_URL || 'https://script.google.com/macros/s/AKfycbykgyPwbH92lU8vVbpv60jh7TKjrpoH2YMzjm2KklnS7KICD7cCfxfJ3omoe-ZtFvdygg/exec',
    };
  }

  async initialize(): Promise<void> {
    if (!this.config.webAppUrl) {
      console.log('Google Web App not configured. Skipping initialization.');
      return;
    }

    try {
      const response = await fetch(this.config.webAppUrl, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Sophie-AI-Sales-Assistant'
        }
      });
      const data = await response.json();
      
      if (data.success && data.rows) {
        this.lastRowCount = data.rows.length;
        console.log(`Google Sheets Web App initialized. Found ${this.lastRowCount} rows.`);
        
        // Process existing leads if any
        for (const row of data.rows) {
          await this.processNewLead([row.timestamp, row.email, row.company, row.role, row.phone, row.source]);
        }
      } else {
        console.log('Google Sheets Web App connected but no data returned.');
      }
    } catch (error) {
      console.error('Failed to initialize Google Sheets Web App:', error);
    }
  }

  async checkForNewLeads(): Promise<void> {
    if (!this.config.webAppUrl) {
      return;
    }

    try {
      const response = await fetch(this.config.webAppUrl, {
        redirect: 'follow',
        headers: {
          'User-Agent': 'Sophie-AI-Sales-Assistant'
        }
      });
      const data = await response.json();

      if (data.success && data.rows) {
        const currentRowCount = data.rows.length;

        if (currentRowCount > this.lastRowCount) {
          const newRows = data.rows.slice(this.lastRowCount);
          
          for (const row of newRows) {
            await this.processNewLead([row.timestamp, row.email, row.company, row.role, row.phone, row.source]);
          }

          this.lastRowCount = currentRowCount;
          console.log(`Processed ${newRows.length} new leads from Google Sheets`);
        }
      }
    } catch (error) {
      console.error('Failed to check for new leads:', error);
    }
  }

  private async processNewLead(row: string[]): Promise<void> {
    try {
      // Assuming columns: Name, Email, Company, Role, Phone, Source
      const [name, email, company, role, phone, source] = row;

      if (!name || !email) {
        console.log('Skipping row with missing name or email');
        return;
      }

      // Check if lead already exists
      const existingLead = await storage.getLeadByEmail(email);
      if (existingLead) {
        console.log(`Lead with email ${email} already exists`);
        return;
      }

      // Create new lead
      const lead = await storage.createLead({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: company?.trim() || null,
        role: role?.trim() || null,
        phone: phone?.trim() || null,
        source: source?.trim() || 'google_sheets',
        status: 'new',
        score: 0,
      });

      console.log(`New lead created: ${lead.name} (${lead.email})`);

      // Trigger email sending (this would be handled by the email service)
      // await emailService.sendWelcomeEmail(lead);
    } catch (error) {
      console.error('Failed to process new lead:', error);
    }
  }

  startMonitoring(intervalMs = 30000): void {
    if (!this.config.webAppUrl) {
      console.log('Google Sheets monitoring disabled - not configured');
      return;
    }

    console.log(`Starting Google Sheets Web App monitoring every ${intervalMs}ms`);
    
    setInterval(async () => {
      await this.checkForNewLeads();
    }, intervalMs);
  }
}

export const googleSheetsService = new GoogleSheetsService();
