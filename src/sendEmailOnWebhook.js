import 'dotenv/config';
import nodemailer from 'nodemailer';
import {generateEmailHtml} from './htmlEmail.js';
import logger from './logger.js';

//my own gmail mail trasporter for testing
const gmail_pass = process.env.GMAIL_PASS;
const gmail_user = process.env.GMAIL_USER;
const senderEmail = process.env.GMAIL_SENDER;

const emailGmail = {
    host: "smtp.gmail.com",
    port: 587, // Use 465 for SSL
    secure: false, // Use true for SSL
    auth: {
      user: gmail_user,
      pass: gmail_pass
    },
    tls: {
      rejectUnauthorized: false // This helps in development and might be risky for production (?)
    }
}

//the ebrains mail transporter
/*
//const senderEmail = process.env.EMAIL_ADDRESS_SENDER;
//const senderEmail = '"Oslo curation team" <curation-support@ebrains.eu>';
const transportConf = {
    host: process.env.EMAIL_HOSTNAME,
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    logger: true,
    debug: true
  }
*/

export async function sendEmailOnWebhook(contactPersonName, recipientEmail, positionContact, institution, departm, purposeAccess, dataTitle, zammadTicket, nameCustodian, surnameCustodian, emailCustodian) { 
    //text of the email to the data custodian
    const emailHtml = generateEmailHtml(contactPersonName, recipientEmail, positionContact, institution, departm, purposeAccess, dataTitle, nameCustodian, surnameCustodian);
    const transporter = nodemailer.createTransport(emailGmail);//for testing my own gmail emailGmail
    //const transporter = nodemailer.createTransport(transportConf); //prod
    const mailOptions = {
        from: senderEmail, 
        to: emailCustodian,   
        cc : 'curation-support@ebrains.eu', 
        subject: zammadTicket,         
        html: emailHtml  
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email is sent to the data custodian: ${info.messageId}`);
    } catch (error) {
        throw new Error(`Error sending email to the data custodian: ${error.message}`);
    }
};