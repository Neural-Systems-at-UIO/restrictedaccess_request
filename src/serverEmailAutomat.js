//vanilla javascript server (ES8)
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {fetchToken} from './tokenFetcher.js';
import {sendEmailOnWebhook} from './sendEmailOnWebhook.js';
import {htmlPageContent} from './mainPageContent.js';
import {fetchSubmission, fetchAnswers, fetchPosition} from './fetchNettskjemaData.js';
import {getRequestOptions} from './kgAuthentication.js';
import {contactInfoKG} from './contactDataKG.js';
//import {modifyUrlPath} from './changeUrl.js';
import {extractSubmissionId} from './changeUrl.js';
import dotenv from 'dotenv';
import logger from './logger.js';
dotenv.config(); 

// Get __dirname with ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
const port = process.env.PORT || 4000;

//to log post requests from zammad webhook or tests
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

//use my ebrain account for testing  -- replace with service account and getRequestOptions()
//const maya_token = process.env.MAYA_EBRAIN_TOKEN;
//const token_maya = "Bearer " + maya_token;
//const myHeaders = new Headers();
//myHeaders.append("Content-Type", "application/json");
//myHeaders.append("Authorization", token_maya);    
//myHeaders.append("Accept", '*/*');
//const mayaHeaders = {headers: myHeaders};

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

// to test post requests
app.post('/test', (req, res) => {
    const jsonData = req.body;
    logger.info(`incoming test post request: ${jsonData.message}`);
    res.json({ message: 'Data received successfully', data: jsonData });
});
//to test get requests
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

//the webhook endpoint
app.post('/webhook', async (req, res) => {
    //const event = req.body.event;   //modify this part accordingly when the weebhook is created
    //logger.info(`webhook is fired: ${event}`);
    logger.info(`webhook is fired`);
    const data_webhook = req.body;
    logger.info(`POST received: ${data_webhook}`);
    res.json({ message: 'Webhook received successfully', data: data_webhook });
    const submissionId = data_webhook.submission_url;  //get submission id and zammad ticket from webhook
    const zammadTicket = data_webhook.ticket_no;
    logger.info(`requested nettskjema: ${submissionId}`);
    logger.info(`Zammad ticket: ${zammadTicket}`);
    //we created a query manually in KG editor named = fetch_data_custodian_info
    const queryID = 'de7e79ae-5b67-47bf-b8b0-8c4fa830348e';
    try {  
        const extractedSubmissionId = extractSubmissionId(submissionId);//I need subm id and zammad ticket number
        //extract zammad ticket number from the webhook and put it in the email subject    
        //const zammadTicket = 'test_mayas_app [Ticket#4824171]'; //this needs to be changed dynamically (get zammad ticket info from zammad webhook)
        logger.info(`nettskjema request was received, submission id: ${extractedSubmissionId}`);
        const tokenNettskjema = await fetchToken();
        logger.info("token for nettskjema is fetched successfully");
        const submissionData = await fetchSubmission(extractedSubmissionId, tokenNettskjema);
        logger.info("successfully fetched submission data from the nettskjema api");
        const datasetID = await fetchAnswers(submissionData);
        logger.info(`requested dataset id: ${datasetID}`);

        //replace here mayaHeaders with requestOptions and dedicated service account
        const requestOptions = await getRequestOptions();
        //for testing I was using my own KG token (copied after login from https://editor.kg.ebrains.eu/)
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
        //sendEmailOnWebhook(respondentName, respondentEmail, positionContact, instituionCorrespondent, departm, purposeAccess, dataTitle, modifiedUrl, nameCustodian, surnameCustodian, emailCustodian['email']);
        //in prod: replace my uio email by the email of the custodian: emailCustodian['email']
        }else{
            throw new Error('Custodian of the dataset did not provide contact information.');
        }
    } catch (error) {
        logger.error(`Something is not working:`, error);
    }; 
    res.status(200).json({ status: 'success', received: data });
});

app.listen(port, async () => {
    logger.info(`Server is running on port ${port}`);
});