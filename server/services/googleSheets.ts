import { google } from 'googleapis';
import { emailService } from './emailService';
import { openaiService } from './openai';
import { storage } from '../storage';
import type { Lead } from '@shared/schema';

const sheets = google.sheets('v4');

class GoogleSheetsService {
  async processNewLeadRow(row: string[]): Promise<void> {
    const [name, email, company, website, jobTitle, notes] = row;

    const lead: Lead = {
      id: crypto.randomUUID(),
      name: name || '',
      email: email || '',
      company: company || '',
      website: website || '',
      jobTitle: jobTitle || '',
      notes: notes || '',
      createdAt: new Date(),
      status: 'new',
    };

    // Store lead
    await storage.saveLead(lead);

    // Auto-qualify lead using Sophie (OpenAI)
    const qualification = await openaiService.qualifyLead(lead, notes || '');

    await storage.updateLead(lead.id, {
      status: qualification.isQualified ? 'qualified' : 'unqualified',
      score: qualification.score,
      qualificationData: qualification,
    });

    // Send welcome email
    await emailService.sendWelcomeEmail(lead);

    // Log activity
    await storage.createActivity({
      leadId: lead.id,
      type: 'lead_created',
      description: 'Lead captured and qualified via Google Sheets',
      metadata: {
        source: 'Google Sheets',
        qualification,
      },
    });

    console.log(`Lead ${lead.name} processed and emailed.`);
  }
}

export const googleSheetsService = new GoogleSheetsService();
