import dotenv from 'dotenv';
import fetch from 'node-fetch';
import logger from './logger.js';
dotenv.config();

const maya_token = process.env.MAYA_ZAMMAD_TOKEN;
const token_maya = "Bearer " + maya_token;
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", token_maya);    
myHeaders.append("Accept", '*/*');
const mayaHeaders = {headers: myHeaders};

const zammadBaseUrl = 'https://support.humanbrainproject.eu/';
//https://support.humanbrainproject.eu/#ticket/zoom/{ticket_id} 

const searchTitle = 'Request for externally hosted datasets';
export async function zammadTicket (ticketId) {
    try {
        const articleUrl = `${zammadBaseUrl}/api/v1/tickets/${ticketId}`;
        const response = await fetch(articleUrl, mayaHeaders); 
        const data = await response.json();
        const dataTitle = data.title;
        const ticketNumber = data.number;
        const isTicket = dataTitle.includes(searchTitle);
        let refNumber = null;
        const regex = /(?<=Ref\.?\s?)\d+/;
        //const regex = /\(Ref\.?\s*(\d+)\)/;
        const match = dataTitle.match(regex);
        if (isTicket) {
            refNumber = match[0];
            //refNumber = match[1];
            logger.info(`Submitted nettskjema id: ${refNumber}`);
        } else {
            logger.info('Could not find nettskjema id in the ticket');
        }
        return {isTicket, ticketNumber, refNumber};
    } catch (error) {
        throw new Error(`Error fetching nettskjema id from zammad ticket: ${error.message}`);
    }
}