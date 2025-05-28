import OpenAI from "openai";
import { storage } from '../storage';
import type { Lead } from '@shared/schema';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || ""
});

interface QualificationResponse {
  isQualified: boolean;
  score: number;
  reasons: string[];
  nextSteps: string[];
  summary: string;
}

interface EmailResponse {
  hasResponse: boolean;
  sentiment: 'positive' | 'negative' | 'neutral';
  isInterested: boolean;
  questions: string[];
  concerns: string[];
  nextAction: 'schedule_call' | 'send_followup' | 'nurture' | 'disqualify';
}

export class OpenAIService {
  async qualifyLead(lead: Lead, responseText?: string): Promise<QualificationResponse> {
    try {
      const prompt = `You are an AI sales qualification assistant for Zelira.ai, a company that provides AI-powered business solutions and automation.

Analyze the following lead and determine if they are qualified based on these criteria:
- Budget: Can they afford AI solutions (typically $5,000+ monthly)
- Authority: Are they a decision maker or influencer
- Need: Do they have clear pain points that AI can solve
- Timeline: Are they looking to implement solutions within 6 months

Lead Information:
- Name: ${lead.name}
- Company: ${lead.company || 'Not provided'}
- Role: ${lead.role || 'Not provided'}
- Email: ${lead.email}
${responseText ? `- Response: ${responseText}` : ''}

Provide a qualification assessment in JSON format with:
- isQualified: boolean
- score: number (0-100)
- reasons: array of strings explaining the qualification decision
- nextSteps: array of suggested next actions
- summary: brief summary of the assessment

Respond with JSON only.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a sales qualification expert. Respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as QualificationResponse;
    } catch (error) {
      console.error('Failed to qualify lead:', error);
      return {
        isQualified: false,
        score: 0,
        reasons: ['Failed to analyze due to technical error'],
        nextSteps: ['Manual review required'],
        summary: 'Analysis failed - requires manual review'
      };
    }
  }

  async analyzeEmailResponse(lead: Lead, responseText: string): Promise<EmailResponse> {
    try {
      const prompt = `Analyze this email response from a potential customer for Zelira.ai:

Lead: ${lead.name} from ${lead.company || 'Unknown Company'}
Response: "${responseText}"

Analyze the response and provide insights in JSON format:
- hasResponse: boolean (true if this is a meaningful response)
- sentiment: 'positive' | 'negative' | 'neutral'
- isInterested: boolean
- questions: array of questions they asked
- concerns: array of concerns they raised
- nextAction: 'schedule_call' | 'send_followup' | 'nurture' | 'disqualify'

Respond with JSON only.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an email response analyzer. Respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      return result as EmailResponse;
    } catch (error) {
      console.error('Failed to analyze email response:', error);
      return {
        hasResponse: true,
        sentiment: 'neutral',
        isInterested: false,
        questions: [],
        concerns: ['Analysis failed'],
        nextAction: 'send_followup'
      };
    }
  }

  async generatePersonalizedEmail(lead: Lead, templateBody: string): Promise<string> {
    try {
      const prompt = `Personalize this email template for the following lead:

Lead Information:
- Name: ${lead.name}
- Company: ${lead.company || 'their company'}
- Role: ${lead.role || 'their role'}

Email Template:
${templateBody}

Instructions:
1. Replace {{name}} with the lead's name
2. Replace {{company}} with the lead's company name
3. Add 1-2 sentences that are specifically relevant to their role and company
4. Keep the professional tone and structure
5. Make it feel personal but not overly familiar

Return only the personalized email content.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert at personalizing sales emails. Keep the tone professional and helpful."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      });

      return response.choices[0].message.content || templateBody;
    } catch (error) {
      console.error('Failed to personalize email:', error);
      // Fallback to simple template replacement
      return templateBody
        .replace(/\{\{name\}\}/g, lead.name)
        .replace(/\{\{company\}\}/g, lead.company || 'your company');
    }
  }
}

export const openaiService = new OpenAIService();
