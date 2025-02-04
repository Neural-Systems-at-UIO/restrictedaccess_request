import dotenv from 'dotenv';
import {notificationError} from './htmlNotificationError.js'; 
import logger from './logger.js';
import fetch from 'node-fetch';
dotenv.config();

const maya_token = process.env.MAYA_ZAMMAD_TOKEN;
const token_maya = "Bearer " + maya_token;
const zammadBaseUrl = 'https://support.humanbrainproject.eu/';
const urlSendEmail = `${zammadBaseUrl}/api/v1/ticket_articles`;

export async function errorNotificationZammad(ticketId, testTicketId, testTicketSubject, submissionId, logFilePath, emailSupport) { 
    //text of the email to the data custodian
    const emailHtml = notificationError(ticketId, submissionId);
    const content = {
        "ticket_id": testTicketId,  
        "subject": testTicketSubject,
        "body": emailHtml,
        "content_type": "text/html",
        "type": "email",
        "internal": "false",
        "sender": "Agent",
        "time_unit": "0",
        "origin_by_id": "1292",
        "to": emailSupport,  //data custodian email
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
        logger.info(`Email is sent to support including log file: ${data}`);
    } catch (error) {
        throw new Error(`Error sending email to support: ${error.message}`);
    }
};