import 'dotenv/config';
import nodemailer from 'nodemailer';
import {notificationError} from './htmlNotificationError.js'; 
import logger from './logger.js';

const gmail_pass = process.env.GMAIL_PASS;
const gmail_user = process.env.GMAIL_USER;
const senderEmail = process.env.GMAIL_SENDER;

const emailGmail = {
    host: "smtp.gmail.com",
    port: 587, 
    secure: false, 
    auth: {
      user: gmail_user,
      pass: gmail_pass
    },
    tls: {
      rejectUnauthorized: false 
    }
}

export async function errorNotification(zammadTicket, submissionId, logFilePath, emailSupport) { 
  const emailHtml = notificationError(zammadTicket, submissionId); //email text
  const transporter = nodemailer.createTransport(emailGmail);//for testing my own gmail emailGmail
  //const transporter = nodemailer.createTransport(transportConf); //prod
  const mailOptions = {
      from: senderEmail, 
      to: emailSupport,   
      cc : 'curation-support@ebrains.eu', 
      subject: 'test_mayas_app [Ticket#4824171]',         
      html: emailHtml,
      attachments: [
        {
            filename: 'restrictedaccess.log',
            path: logFilePath
        }
    ]  
  };
  try {
      const info = await transporter.sendMail(mailOptions);
      logger.info(`Error notification is sent: ${info.messageId}`);
  } catch (error) {
      throw new Error(`Error sending notification email about issues: ${error.message}`);
  }
};