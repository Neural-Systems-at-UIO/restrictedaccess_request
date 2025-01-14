// This script creates a transport object which can be used to send emails
//modify email text here in the htmlContent const
import 'dotenv/config';
import nodemailer from 'nodemailer';
import {generateEmailHtml} from './htmlEmail.js';
import logger from './logger.js';

//  This script requires the following environment variables to be set:
//  - EMAIL_HOSTNAME : The hostname of the smtp server, e.g. smtp.gmail.com, a relay server or an ip address.
//  - EMAIL_ADDRESS_SENDER : Oslo curation team
//  - EMAIL_PASSWORD : password for the mail transporter
//  - EMAIL_USER: user name of the mail transporter 
//https://gitlab.ebrains.eu/ri/tech-hub/devops/docs/-/blob/main/Email_relay.md

//const gmail_pass = process.env.GMAIL_PASS;  //comment these lines about gmail at prod
//const gmail_user = process.env.GMAIL_USER;
//const senderEmail = process.env.GMAIL_SENDER;
//const senderEmail = process.env.EMAIL_ADDRESS_SENDER;

//my own gmail mail trasporter for testing
/* const emailGmail = {
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
} */

//the ebrains mail transporter
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

export async function sendEmailOnWebhook(contactPersonName, recipientEmail, positionContact, institution, departm, purposeAccess, dataTitle, zammadTicket, nameCustodian, surnameCustodian, emailCustodian) {
    //text of the email: 
    const emailHtml = generateEmailHtml(contactPersonName, recipientEmail, positionContact, institution, departm, purposeAccess, dataTitle, nameCustodian, surnameCustodian);
    //const transporter = nodemailer.createTransport(emailGmail);//for testing my own gmail emailGmail
    const transporter = nodemailer.createTransport(transportConf);
    // for prod use the wizard mail trasporter: transportConf
    const mailOptions = {
        from: senderEmail, // Sender address, replace by oslo curation team email at prod EMAIL_ADDRESS_SENDER
        to: emailCustodian,     // Recipient address - custodian - change at deployment
        cc : 'curation-support@ebrains.eu', 
        subject: zammadTicket,         
        html: emailHtml  
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email is sent to the data custodian: ${info.messageId}`);
    } catch (error) {
        throw new Error(`Error sending email to the data custodian:: ${error.message}`);
    }
};