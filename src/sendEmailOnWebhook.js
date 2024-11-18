//modify email text here in the htmlContent const
import 'dotenv/config';
import nodemailer from 'nodemailer';
import {generateEmailHtml} from './htmlEmail.js';

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
      rejectUnauthorized: false // This helps in development and might be risky for production
    }
}

export async function sendEmailOnWebhook(contactPersonName, recipientEmail, positionContact, institution, departm, purposeAccess, dataTitle, modifiedUrl, nameCustodian, surnameCustodian, emailCustodian) {
    //const tryEmail = process.env.GMAIL_MAIL;
    const tryEmail = emailCustodian;
    //at deployment remove passing here the custodianEmail argumnet
    const emailHtml = generateEmailHtml(contactPersonName, recipientEmail, positionContact, institution, departm, purposeAccess, dataTitle, modifiedUrl, nameCustodian, surnameCustodian, emailCustodian);
    const transporter = nodemailer.createTransport(emailGmail);
    const mailOptions = {
        from: senderEmail, // Sender address
        to: tryEmail,     // Recipient address - custodian - change at deployment
        subject: 'This is an authomaticly generated email from Ebrains curation team',   // dataset access request                           // Plain text body
        html: emailHtml   //htmlContent 
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};