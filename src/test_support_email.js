import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import {notificationError} from './htmlNotificationError.js'; 
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const maya_token = process.env.MAYA_ZAMMAD_TOKEN;
const token_maya = "Bearer " + maya_token;
const zammadBaseUrl = 'https://support.humanbrainproject.eu/';
const urlSendEmail = `${zammadBaseUrl}/api/v1/ticket_articles`;

async function errorNotificationZammad(ticketId, supportTicketId, submissionId, logFilePath, emailSupport) { 
    const emailHtml = notificationError(ticketId, submissionId);
    const content = {
        "ticket_id": supportTicketId,  
        "subject": "app error",
        "body": emailHtml,
        "content_type": "text/html",
        "type": "email",
        "internal": "false",
        "sender": "Agent",
        "time_unit": "0",
        "to": emailSupport, 
        "attachments": [
            {
                filename: 'restrictedaccess.log',
                path: logFilePath
            }]
    };
    try {
        const response = await fetch(urlSendEmail, {
            method: 'post',
            body: JSON.stringify(content),
            headers: {'Content-Type': 'application/json', 'Authorization': token_maya}
        });
        const data = await response.json();
        console.log(response.status);
        console.log(data);
        console.log(`Email is sent to support including log file: ${data}`);
    } catch (error) {
        throw new Error(`Error sending email to support: ${error.message}`);
    }
};

const logFilePath = path.resolve(__dirname, '../restrictedaccess.log');
const emailSupport = 'maya.kobchenko@medisin.uio.no'; 
//const testTicketSubject = 'test_mayas_app [Ticket#4824171]'; 
const supportTicketId = 24211; //my test ticket in zammad
const ticketId = 12345;
const submissionId = 87654321;
await errorNotificationZammad(ticketId, supportTicketId, submissionId, logFilePath, emailSupport);
