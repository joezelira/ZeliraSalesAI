import { google } from 'googleapis';
import { storage } from '../storage';

interface GoogleSheetsConfig {
  spreadsheetId: string;
  range: string;
  credentials: any;
}

export class GoogleSheetsService {
  private sheets: any;
  private config: GoogleSheetsConfig;
  private lastRowCount = 0;

  constructor() {
    this.config = {
      spreadsheetId: process.env.GOOGLE_SHEETS_ID || '',
      range: process.env.GOOGLE_SHEETS_RANGE || 'Sheet1!A:F',
      credentials: process.env.GOOGLE_SHEETS_CREDENTIALS ? JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS) : null,
    };

    if (this.config.credentials) {
      const auth = new google.auth.GoogleAuth({
        credentials: this.config.credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });

      this.sheets = google.sheets({ version: 'v4', auth });
    }
  }

  async initialize(): Promise<void> {
    if (!this.sheets || !this.config.spreadsheetId) {
      console.log('Google Sheets not configured. Skipping initialization.');
      return;
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: this.config.range,
      });

      const rows = response.data.values || [];
      this.lastRowCount = rows.length;
      
      console.log(`Google Sheets initialized. Found ${this.lastRowCount} rows.`);
    } catch (error) {
      console.error('Failed to initialize Google Sheets:', error);
    }
  }

  async checkForNewLeads(): Promise<void> {
    if (!this.sheets || !this.config.spreadsheetId) {
      return;
    }

    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: this.config.range,
      });

      const rows = response.data.values || [];
      const currentRowCount = rows.length;

      if (currentRowCount > this.lastRowCount) {
        const newRows = rows.slice(this.lastRowCount);
        
        for (const row of newRows) {
          await this.processNewLead(row);
        }

        this.lastRowCount = currentRowCount;
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
    if (!this.sheets || !this.config.spreadsheetId) {
      console.log('Google Sheets monitoring disabled - not configured');
      return;
    }

    console.log(`Starting Google Sheets monitoring every ${intervalMs}ms`);
    
    setInterval(async () => {
      await this.checkForNewLeads();
    }, intervalMs);
  }
}

export const googleSheetsService = new GoogleSheetsService();
