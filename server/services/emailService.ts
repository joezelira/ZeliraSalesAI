// server/services/emailService.ts

import nodemailer from 'nodemailer';

export const emailService = {
  async sendEmail(to: string, subject: string, text: string) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.GMAIL_USER,
        to,
        subject,
        text,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  },
};
