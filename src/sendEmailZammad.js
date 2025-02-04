//this was used to test zammad api, not in the app itself
import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const maya_token = process.env.MAYA_ZAMMAD_TOKEN;
const token_maya = "Bearer " + maya_token;
const zammadBaseUrl = 'https://support.humanbrainproject.eu/';

const ticketId = 24211; //my test ticket
const content = {
    "ticket_id": ticketId,  //replace by actuall ticketId
    "subject": "Data access request",
    "body": "Sending a fourth test e-mail via the Zammad API.",
    "content_type": "text/html",
    "type": "email",
    "internal": "false",
    "sender": "Agent",
    "time_unit": "0",
    // "from":"curation-support@ebrains.eu", -- fails at SMTP
    "origin_by_id": "1292",
    "to": "maya.kobchenko@medisin.uio.no"  //data custodian email
}

const urlSendEmail = `${zammadBaseUrl}/api/v1/ticket_articles`;
const response = await fetch(urlSendEmail, {
	method: 'post',
	body: JSON.stringify(content),
	headers: {'Content-Type': 'application/json', 'Authorization': token_maya}
});
const data = await response.json();
console.log(data);