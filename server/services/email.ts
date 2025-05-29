import nodemailer from 'nodemailer';
import { storage } from '../storage';
import { openaiService } from './openai';
import type { Lead, EmailTemplate } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'sophie@zelira.ai';

    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(emailConfig);
  }

  async sendWelcomeEmail(lead: Lead): Promise<boolean> {
    try {
      const template = await storage.getDefaultEmailTemplate();
      if (!template) {
        console.error('No default email template found');
        return false;
      }

      const personalizedBody = await openaiService.generatePersonalizedEmail(lead, template.body);
      const personalizedSubject = template.subject.replace(/\{\{name\}\}/g, lead.name).replace(/\{\{company\}\}/g, lead.company || 'your company');

      const mailOptions = {
        from: `Sophie - Zelira.ai <${this.fromEmail}>`,
        to: lead.email,
        subject: personalizedSubject,
        text: personalizedBody,
        html: this.convertToHtml(personalizedBody),
      };

      const result = await this.transporter.sendMail(mailOptions);

      await storage.createEmailLog({
        leadId: lead.id,
        templateId: template.id,
        subject: personalizedSubject,
        body: personalizedBody,
        sentAt: new Date(),
        openedAt: null,
        responded: false,
        responseText: null,
      });

      await storage.createActivity({
        leadId: lead.id,
        type: 'email_sent',
        description: `Welcome email sent to ${lead.name}`,
        metadata: {
          emailId: result.messageId,
          subject: personalizedSubject,
        },
      });

      await storage.updateLead(lead.id, {
        status: 'contacted',
        lastContactedAt: new Date(),
      });

      console.log(`Welcome email sent to ${lead.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  async sendFollowUpEmail(lead: Lead, message: string): Promise<boolean> {
    try {
      const subject = `Following up on Zelira.ai - ${lead.company || 'Your Business'}`;

      const mailOptions = {
        from: `Sophie - Zelira.ai <${this.fromEmail}>`,
        to: lead.email,
        subject: subject,
        text: message,
        html: this.convertToHtml(message),
      };

      const result = await this.transporter.sendMail(mailOptions);

      await storage.createEmailLog({
        leadId: lead.id,
        templateId: null,
        subject: subject,
        body: message,
        sentAt: new Date(),
        openedAt: null,
        responded: false,
        responseText: null,
      });

      await storage.createActivity({
        leadId: lead.id,
        type: 'email_sent',
        description: `Follow-up email sent to ${lead.name}`,
        metadata: {
          emailId: result.messageId,
          subject: subject,
        },
      });

      await storage.updateLead(lead.id, {
        lastContactedAt: new Date(),
      });

      console.log(`Follow-up email sent to ${lead.email}`);
      return true;
    } catch (error) {
      console.error('Failed to send follow-up email:', error);
      return false;
    }
  }

  async processEmailResponse(lead: Lead, responseText: string): Promise<void> {
    try {
      const analysis = await openaiService.analyzeEmailResponse(lead, responseText);

      const emailLogs = await storage.getEmailLogs();
      const latestEmailLog = emailLogs.find(log => log.leadId === lead.id);

      if (latestEmailLog) {
        await storage.updateEmailLog(latestEmailLog.id, {
          responded: true,
          responseText: responseText,
        });
      }

      await storage.createActivity({
        leadId: lead.id,
        type: 'email_response',
        description: `Email response received from ${lead.name}`,
        metadata: {
          sentiment: analysis.sentiment,
          isInterested: analysis.isInterested,
          nextAction: analysis.nextAction,
        },
      });

      const qualification = await openaiService.qualifyLead(lead, responseText);

      let newStatus = lead.status;
      if (qualification.isQualified && qualification.score >= 70) {
        newStatus = 'qualified';
      } else if (qualification.score < 30) {
        newStatus = 'unqualified';
      }

      await storage.updateLead(lead.id, {
        status: newStatus,
        score: qualification.score,
        qualificationData: qualification,
        responseData: analysis,
        budget: qualification.budget,
        decisionMaker: qualification.decisionMaker,
        timeline: qualification.timeline,
        needs: qualification.needs,
        painPoints: qualification.painPoints,
        authority: qualification.authority,
      });

      await storage.createActivity({
        leadId: lead.id,
        type: 'lead_qualified',
        description: `Lead ${qualification.isQualified ? 'qualified' : 'not qualified'} with score ${qualification.score}`,
        metadata: {
          qualification,
          analysis,
        },
      });

      console.log(`Processed response from ${lead.email} - Score: ${qualification.score}`);
    } catch (error) {
      console.error('Failed to process email response:', error);
    }
  }

  private convertToHtml(text: string): string {
    return text
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/• /g, '<li>')
      .replace(/<p><li>/g, '<ul><li>')
      .replace(/<\/p>/g, (match, offset, string) => {
        if (string.charAt(offset + 4) === '<' && string.charAt(offset + 5) === 'l') {
          return '</li></ul>';
        }
        return match;
      });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service connected successfully');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
