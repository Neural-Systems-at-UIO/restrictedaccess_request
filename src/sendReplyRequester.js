import dotenv from 'dotenv';
import {replyEmailHtml} from './htmlEmailReply.js';
import logger from './logger.js';
import fetch from 'node-fetch';
dotenv.config();

const maya_token = process.env.MAYA_ZAMMAD_TOKEN;
const token_maya = "Bearer " + maya_token;
const zammadBaseUrl = 'https://support.humanbrainproject.eu/';
const urlSendEmail = `${zammadBaseUrl}/api/v1/ticket_articles`;

export async function sendReply(contactPersonName, recipientEmail, dataTitle, dataset_uuid, ticketId) { 
    //text of the email to the data custodian
    const emailHtml = replyEmailHtml(contactPersonName, dataTitle, dataset_uuid);
    const content = {
        "ticket_id": ticketId,  
        "subject": "Data access request",
        "body": emailHtml,
        "content_type": "text/html",
        "type": "email",
        "internal": "false",
        "sender": "Agent",
        "time_unit": "0",
        // "from":"curation-support@ebrains.eu", -- fails at SMTP
        "origin_by_id": "1292",
        "to": recipientEmail  //data requester email
    };
    try {
        const response = await fetch(urlSendEmail, {
            method: 'post',
            body: JSON.stringify(content),
            headers: {'Content-Type': 'application/json', 'Authorization': token_maya}
        });
        const data = await response.json();
        if (response.ok) {
            logger.info(`Reply is sent: message id: ${data.message_id}`);
        }
        else {
            throw new Error('Error sending reply: ' + response.status);
        }
    } catch (error) {
        throw new Error(`Error sending email to the person requested data access: ${error.message}`);
    }
};