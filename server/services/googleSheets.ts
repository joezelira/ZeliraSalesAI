import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import emailService from './emailService'; // ✅ Corrected import

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SPREADSHEET_ID = process.env.SPREADSHEET_ID || '';
const SHEET_NAME = 'Sheet1'; // Adjust as needed
const CHECK_INTERVAL = 30000; // 30 seconds

interface Lead {
  timestamp: string;
  email: string;
}

class GoogleSheetsService {
  private auth: JWT;
  private sheets: any;
  private knownLeads: Set<string>;

  constructor() {
    const keyFilePath = path.join(__dirname, '../../google-credentials.json');
    const credentials = JSON.parse(fs.readFileSync(keyFilePath, 'utf-8'));

    this.auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: SCOPES,
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.knownLeads = new Set();
  }

  public async initialize() {
    console.log('Google Sheets Web App initialized.');
    const leads = await this.getLeads();
    leads.forEach((lead) => this.knownLeads.add(lead.timestamp));
    console.log(`Found ${leads.length} rows.`);

    setInterval(async () => {
      await this.checkForNewLeads();
    }, CHECK_INTERVAL);
  }

  private async getLeads(): Promise<Lead[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:B`, // A: timestamp, B: email
    });

    const rows = response.data.values || [];
    return rows.slice(1).map((row: any[]) => ({
      timestamp: row[0],
      email: row[1],
    }));
  }

  private async checkForNewLeads() {
    const leads = await this.getLeads();

    for (const lead of leads) {
      if (!this.knownLeads.has(lead.timestamp)) {
        this.knownLeads.add(lead.timestamp);
        console.log(`New lead created: ${lead.timestamp} (${lead.email})`);
        await this.processNewLead(lead);
      }
    }
  }

  private async processNewLead(lead: Lead) {
    try {
      await emailService.sendWelcomeEmail(lead.email);
    } catch (error) {
      console.error('Failed to process new lead:', error);
    }
  }
}

export default GoogleSheetsService;
