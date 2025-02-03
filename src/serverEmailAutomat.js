import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import {fetchToken} from './tokenFetcher.js';
import {sendEmailOnWebhookZammad} from './sendEmailOnWebhookZammad.js';
import {htmlPageContent} from './mainPageContent.js';
import {fetchSubmission, fetchAnswers, fetchPosition} from './fetchNettskjemaData.js';
import {getRequestOptions} from './kgAuthentication.js';
import {contactInfoKG} from './contactDataKG.js'; 
import logger from './logger.js';
import {errorNotification} from './sendErrorNotification.js'; 
import {zammadTicket} from './getZammadTicketInfo.js';
//intended to send the data link to the data custodian, but emails get spam filtered
//changed the webhook playload, no need for extractSubmissionId
//import {modifyUrlPath, extractSubmissionId} from './changeUrl.js'; 

dotenv.config(); 

//work around for ECMAScript modules (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const port = process.env.PORT || 4000;

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
});

//a simple frontend page just for showing something
app.use('/public', express.static(path.join(__dirname, 'public')));
async function mainAppPage() {
    return htmlPageContent;
}

app.get('/', async (req, res, next) => {
    try {
        const data = await mainAppPage();
        res.send(data);
    } catch (error) {
        logger.error(`Internal Server Error: ${error.message}`, error);
        next(error);
    }
});

//to test if app is working - get requests
app.get('/health', async (req, res) => {
    res.status(200).json({ status: 'UP' });
});

// to test post requests
//change it back to test, and place webhook back
app.post('/webhook', async (req, res) => {
    //const event = req.body.event;  
    const testData = req.body;
    logger.info('Incoming post request from the test endpoint');
    const testString = JSON.stringify(testData, null, 2);
    logger.info(`Received test JSON: ${testString}`);
    res.status(200).json({ status: 'success test', received: testData });
});

//use my ebrain token for testing 
//const maya_token = process.env.MAYA_EBRAIN_TOKEN;
//const token_maya = "Bearer " + maya_token;
//const myHeaders = new Headers();
//myHeaders.append("Content-Type", "application/json");
//myHeaders.append("Authorization", token_maya);    
//myHeaders.append("Accept", '*/*');
//const mayaHeaders = {headers: myHeaders};

//the main endpoint that will receive webhook
app.post('/test', async (req, res) => {
    const jsonData = req.body;
    logger.info('New post request');
    //zammad webhook sends 5 post requests, need to send response to stop posting
    res.status(200).json({ status: 'success', received: jsonData });
    const jsonString = JSON.stringify(jsonData, null, 2);
    logger.info(`Received JSON: ${jsonString}`);
    const ticketId = jsonString.ticket_id;
    logger.info(`Incoming post request, ticket id: ${ticketId}`);
    const {isTicket, ticketNumber, submissionId} = await zammadTicket(ticketId);
    logger.info(`Zammad ticket number: ${ticketNumber}, is it data access request: ${isTicket}`);
    logger.info(`Submitted nettskjema: ${submissionId}`);
    //we created a query manually in KG editor named = fetch_data_custodian_info
    const queryID = 'de7e79ae-5b67-47bf-b8b0-8c4fa830348e';
    try {  
        //const submissionId = extractSubmissionId(submissionId); //no need anymore  
        //const zammadTicket = 'test_mayas_app [Ticket#4824171]';
        //const zammadTicket = '[Ticket#4824171]';  //put in the email subject
        if (isTicket) {
            const tokenNettskjema = await fetchToken();
            logger.info("token for nettskjema is fetched successfully");
            const submissionData = await fetchSubmission(submissionId, tokenNettskjema);
            logger.info("successfully fetched submission data from the nettskjema api");
            const datasetID = await fetchAnswers(submissionData);
            logger.info(`requested dataset id: ${datasetID}`);
            //for testing - personal KG token (copy-pasted from https://editor.kg.ebrains.eu/)
            //mayaHeaders - for personal KG token, requestOptions - for dedicated service account
            const requestOptions = await getRequestOptions();
            //const {nameCustodian, surnameCustodian, emailCustodian} = await contactInfoKG(queryID, datasetID, mayaHeaders);
            const {nameCustodian, surnameCustodian, emailCustodian} = await contactInfoKG(queryID, datasetID, requestOptions);
            logger.info("successfully fetched contact info from KG");

            //from submitted nettskjema
            const respondentName = submissionData['submissionMetadata']['person']['name'];
            const respondentEmail = submissionData['submissionMetadata']['person']['email'];
            const datasetTitle = submissionData['answers'].find(d => d['externalElementId']==='DatasetTitle');
            const dataTitle = datasetTitle['textAnswer'];
            const institution = submissionData['answers'].find(d => d['externalElementId']==='Institution');
            const instituionCorrespondent = institution['textAnswer'];
            const department = submissionData['answers'].find(d => d['externalElementId']==='Department');
            const departm = department['textAnswer'];
            const position = submissionData['answers'].find(d => d['externalElementId']==='Position');
            const positionCode = position['answerOptionIds'];//people write several positions
            const posContact = [];
            for (const code of positionCode) {
                const position = await fetchPosition(extractedSubmissionId, tokenNettskjema, code);
                posContact.push(position);     
            }
            const positionContact = posContact.join(', ');
            const purpose = submissionData['answers'].find(d => d['externalElementId']==='Purpose');
            const purposeAccess = purpose['textAnswer'];
        
            if (emailCustodian['email'].length>0){
                //replace this function by zammad service
                const testTicketId = 24211; //my test ticket in zammad
                //replace my test ticket by actuall ticketId
                sendEmailOnWebhookZammad(respondentName, respondentEmail, positionContact, instituionCorrespondent, departm, purposeAccess, dataTitle, testTicketId, nameCustodian, surnameCustodian, 'maya.kobchenko@medisin.uio.no');
                //sendEmailOnWebhookZammad(respondentName, respondentEmail, positionContact, instituionCorrespondent, departm, purposeAccess, dataTitle, ticketId, nameCustodian, surnameCustodian, emailCustodian['email']);
                //in prod: replace my uio email by the email of the custodian: emailCustodian['email']
            } else {
                throw new Error('Custodian of the dataset did not provide contact information.');
            }
        } else {
            logger.info('ticket is not relevant');
        }
    } catch (error) {
        logger.error(`Something is not working:`, error);
        const logFilePath = path.resolve(__dirname, '../restrictedaccess.log');
        const emailSupport = 'maya.kobchenko@medisin.uio.no'; //forward notification to my email
        const testTicketSubject = 'test_mayas_app [Ticket#4824171]'; //for testing use the same test ticket
        //replace in prod by the testTicket by ticketNumber
        //const submissionId = "33139391";//for testing
        const testTicketId = 24211; //my test ticket in zammad
        await errorNotification(ticketId, testTicketId, testTicketSubject, submissionId, logFilePath, emailSupport);
        //add here sending emails to my email notifying that something is not working 
    }; 
});

app.listen(port, async () => {
    logger.info(`Server is running on port ${port}`);
});