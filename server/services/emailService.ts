import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,       // e.g. sophie@zelira.ai
    pass: process.env.EMAIL_PASS        // Gmail App Password
  }
});

export async function sendWelcomeEmail(to: string) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Thanks for enquiring - Zelira AI',
    text: `Hi there,

Thanks for enquiring with Zelira AI. Sophie, your AI sales rep, will be in touch shortly to assist you.

Talk soon,  
Sophie  
Zelira AI`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

