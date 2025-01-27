import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import {fetchToken} from './tokenFetcher.js';
import {sendEmailOnWebhook} from './sendEmailOnWebhook.js';
import {htmlPageContent} from './mainPageContent.js';
import {fetchSubmission, fetchAnswers, fetchPosition} from './fetchNettskjemaData.js';
import {getRequestOptions} from './kgAuthentication.js';
import {contactInfoKG} from './contactDataKG.js'; 
import {extractSubmissionId} from './changeUrl.js';
import logger from './logger.js';
import {errorNotification} from './sendErrorNotification.js'; 
//import {modifyUrlPath} from './changeUrl.js'; 
//intended to send the data link to the data custodian, but emails get spam filtered

dotenv.config(); 

//work around for ECMAScript modules (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
const port = process.env.PORT || 5000;

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
});

//a simple front end page just for showing something
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
    const jsonData = req.body;
    //const event = req.body.event;   //modify this part accordingly when the weebhook is created
    //logger.info(`webhook is fired: ${event}`);
    //logger.info(`logging incoming test post request, ticket: ${jsonData.ticket_no}`);
    logger.info(`logging incoming test post request, ticket: ${jsonData}`);
    //logger.info(`console logging incoming test post request: ${jsonData.submission_url}`);
    console.log(`logging incoming test post request, ticket: ${jsonData}`);
    //console.log(`console logging incoming test post request: ${jsonData.submission_url}`);
    //console.log(`logging incoming test post request, ticket: ${jsonData.ticket_no}`);
    //res.json({ message: 'Data received successfully', data: jsonData });
    console.log('successfull test');
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
    logger.info(`webhook is fired`);
    const data_webhook = req.body;
    logger.info(`POST request received: ${data_webhook}`);
    console.log(`POST request received: ${data_webhook}`);
    //we created a query manually in KG editor named = fetch_data_custodian_info
    const queryID = 'de7e79ae-5b67-47bf-b8b0-8c4fa830348e';
    try {  
        const submissionId = data_webhook.submission_url;  //to test Pauls webhook
        const zammadTicket = data_webhook.ticket_no;//to test Pauls webhook
        logger.info(`requested nettskjema: ${submissionId}`);
        logger.info(`Zammad ticket: ${zammadTicket}`);
        const extractedSubmissionId = extractSubmissionId(submissionId);   
        //const zammadTicket = 'test_mayas_app [Ticket#4824171]';
        //const zammadTicket = '[Ticket#4824171]';  //I need to test the format of the email subject
        logger.info(`nettskjema request was received, submission id: ${extractedSubmissionId}`);
        const tokenNettskjema = await fetchToken();
        logger.info("token for nettskjema is fetched successfully");
        const submissionData = await fetchSubmission(extractedSubmissionId, tokenNettskjema);
        logger.info("successfully fetched submission data from the nettskjema api");
        const datasetID = await fetchAnswers(submissionData);
        logger.info(`requested dataset id: ${datasetID}`);

        //mayaHeaders - for personal token, requestOptions - for dedicated service account
        const requestOptions = await getRequestOptions();
        //for testing I was using my own KG token (copy-pasted from https://editor.kg.ebrains.eu/)
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
        sendEmailOnWebhook(respondentName, respondentEmail, positionContact, instituionCorrespondent, departm, purposeAccess, dataTitle, zammadTicket, nameCustodian, surnameCustodian, 'maya.kobchenko@medisin.uio.no');
        //sendEmailOnWebhook(respondentName, respondentEmail, positionContact, instituionCorrespondent, departm, purposeAccess, dataTitle, zammadTicket, nameCustodian, surnameCustodian, emailCustodian['email']);
        //in prod: replace my uio email by the email of the custodian: emailCustodian['email']
        }else{
            throw new Error('Custodian of the dataset did not provide contact information.');
        }
    } catch (error) {
        logger.error(`Something is not working:`, error);
        const logFilePath = path.resolve(__dirname, '../restrictedaccess.log');
        console.log(logFilePath);
        const emailSupport = 'maya.kobchenko@medisin.uio.no';
        const zammadTicket = 'test_mayas_app [Ticket#4824171]'; //for testing use the same test ticket
        //replace in prod by the ticket corresponding to request
        const submissionId = "https://nettskjema.no/user/form/127835/submission/33139391";//for testing
        await errorNotification(zammadTicket, submissionId, logFilePath, emailSupport);
        //add here sending emails to my email notifying that something is not working 
    }; 
    //response to the webhook - not needed in production
    //res.status(200).json({ status: 'success', received: data });
});

app.listen(port, async () => {
    logger.info(`Server is running on port ${port}`);
});