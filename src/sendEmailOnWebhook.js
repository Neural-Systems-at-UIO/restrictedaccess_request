//modify email text here in the htmlContent const
import 'dotenv/config';
import nodemailer from 'nodemailer';
import {generateEmailHtml} from './htmlEmail.js';
import logger from './logger.js';

const gmail_pass = process.env.GMAIL_PASS;
const gmail_user = process.env.GMAIL_USER;
// Sender address, replace by oslo curation team email at prod
const senderEmail = process.env.GMAIL_SENDER;

//setup here a mail trasporter
const emailGmail = {
    host: "smtp.gmail.com",
    port: 587, // Use 465 for SSL
    secure: false, // Use true for SSL
    auth: {
      user: gmail_user,
      pass: gmail_pass
    },
    tls: {
      rejectUnauthorized: false // This helps in development and might be risky for production
    }
}

export async function sendEmailOnWebhook(contactPersonName, recipientEmail, positionContact, institution, departm, purposeAccess, dataTitle, zammadTicket, nameCustodian, surnameCustodian, emailCustodian) {
    //at deployment remove passing here the custodianEmail argument
    const emailHtml = generateEmailHtml(contactPersonName, recipientEmail, positionContact, institution, departm, purposeAccess, dataTitle, nameCustodian, surnameCustodian);
    const transporter = nodemailer.createTransport(emailGmail);
    const mailOptions = {
        from: senderEmail, // Sender address, replace by oslo curation team email at prod
        to: emailCustodian,     // Recipient address - custodian - change at deployment
        cc : 'curation-support@ebrains.eu', 
        subject: zammadTicket,         
        html: emailHtml  
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email is sent to the data custodian: ${info.messageId}`);
        //console.log('Message sent: %s', info.messageId);
    } catch (error) {
        throw new Error(`Error sending email to the data custodian:: ${error.message}`);
    }
};