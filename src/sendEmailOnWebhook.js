//modify email text here in the htmlContent const
import 'dotenv/config';
import nodemailer from 'nodemailer';

const gmail_pass = process.env.GMAIL_PASS;
const gmail_user = process.env.GMAIL_USER;
const senderEmail = process.env.GMAIL_SENDER;
const tryEmail = process.env.GMAIL_MAIL;

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

export async function sendEmailOnWebhook(contactPersonName, recipientEmail) {
    const transporter = nodemailer.createTransport(emailGmail);
    const htmlContent = `
    Dear ${contactPersonName},
    <p>How are you doing?</p>
    Please confirm you email address: ${recipientEmail} 
    `;
    const mailOptions = {
        from: senderEmail, // Sender address
        to: tryEmail,                      // Recipient address
        subject: 'dataset access request',                                 // Subject line
        //text: 'Hello, I am very glad that I sent you an email.',                             // Plain text body
        html: htmlContent                      // HTML body
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        //console.log('Message sent: %s', info.messageId);
        //console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};