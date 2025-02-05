//this was used to test zammad api, not in the app itself
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
//import {notificationError} from './htmlNotificationError.js'; 
import {replyEmailHtml} from './htmlEmailReply.js';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const maya_token = process.env.MAYA_ZAMMAD_TOKEN;
const token_maya = "Bearer " + maya_token;
const zammadBaseUrl = 'https://support.humanbrainproject.eu/';
const urlSendEmail = `${zammadBaseUrl}/api/v1/ticket_articles`;

const ticketId = 24211; //my test ticket
const submissionId = 7654321;
const logFilePath = path.resolve(__dirname, '../restrictedaccess.log');
console.log(logFilePath);
//const emailHtml = notificationError(ticketId, submissionId);
const emailHtml = replyEmailHtml('persons name', 'data title', '789hk');
const fileContent = fs.readFileSync(logFilePath, { encoding: 'utf8' });
const base64Data = Buffer.from(fileContent).toString('base64');
const content = {
    "ticket_id": ticketId,  //replace by actuall ticketId
    "subject": "test_mayas_app [Ticket#4824171]",
    "body": emailHtml,
    "content_type": "text/html",
    "type": "email",
    "internal": "false",
    "sender": "Agent",
    "time_unit": "0",
    // "from":"curation-support@ebrains.eu", -- fails at SMTP
    //"origin_by_id": "1292",
    "to": "maya.kobchenko@medisin.uio.no",  //data custodian email
    "attachments": [
        {   filename: 'restrictedaccess.log',  // Use the appropriate filename
            data: base64Data,
            "mime-type": 'text/plain' // Assuming it's a plain text log file
        }
        ]  
}

const response = await fetch(urlSendEmail, {
	method: 'post',
	body: JSON.stringify(content),
	headers: {'Content-Type': 'application/json', 'Authorization': token_maya}
});
const data = await response.json();
console.log(data.message_id);
console.log(response.status);

 