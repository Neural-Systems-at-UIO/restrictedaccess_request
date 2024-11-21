import express from 'express';
import {fetchToken} from './tokenFetcher.js';
import {sendEmailOnWebhook} from './sendEmailOnWebhook.js';
import {htmlPageContent} from './mainPageContent.js';
import {fetchSubmission, fetchAnswers, fetchPosition} from './fetchNettskjemaData.js';
//import {getRequestOptions} from './kgAuthentication.js';
import {fetchKGjson} from './fetchKGdataset.js';
//import {modifyUrlPath} from './changeUrl.js';
import {extractSubmissionId} from './changeUrl.js';
import dotenv from 'dotenv';
import logger from './logger.js';
dotenv.config(); 

const app = express();
app.use(express.json());
const port = process.env.PORT || 4000;

app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
});

//use my ebrain account for testing  -- replace with getRequestOptions()
const maya_token = process.env.MAYA_EBRAIN_TOKEN;
const token_maya = "Bearer " + maya_token;
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", token_maya);    
myHeaders.append("Accept", '*/*');
const mayaHeaders = {headers: myHeaders};

app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    /*logger.error(`Error occurred at ${req.method} ${req.url} - ${err.message}`, {
        method: req.method,
        url: req.url,
        stack: err.stack,
    });*/
    //logger.error({ message: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal Server Error' });
});

//a simple front end page just for showing something
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
app.post('/webhook', async (req, res, next) => {
    const event = req.body.event;
    logger.info(`webhook is fired: ${event}`);
    const data = req.body.data;
    const submissionId = data.submission_id;  
    //we created a query manually in KG editor named = fetch_data_custodian_info
    const queryID = 'de7e79ae-5b67-47bf-b8b0-8c4fa830348e';
    try {  
        const extractedSubmissionId = extractSubmissionId(submissionId);//I need subm id and zammad ticket number    
        logger.info(`nettskjema request was received, submission id: ${extractedSubmissionId}`);
        const tokenNettskjema = await fetchToken();
        logger.info("token for nettskjema is fetched successfully");
        const submissionData = await fetchSubmission(extractedSubmissionId, tokenNettskjema);
        logger.info("successfully fetched submission data from the nettskjema api");
        const datasetID = await fetchAnswers(submissionData);
        logger.info(`requested dataset id: ${datasetID}`);

        //replace here mayaHeaders with requestOptions and dedicated service account
        //const requestOptions = await getRequestOptions();
        const dataKG = await fetchKGjson(queryID, datasetID, mayaHeaders);
        logger.info("successfully fetched info from KG");
        const custodianDatasetVersion = dataKG[0]['data'][0]['custodian'];
        //const originalUrl = dataKG[0]['data'][0]['id'];  //requested dataset version id to create a link
        //const modifiedUrl = modifyUrlPath(originalUrl);  //to send a link to the data custodians
        let nameCustodian;
        let surnameCustodian;
        let emailCustodian;
        //if the custodian of the dataset version is empty, we take custodian of the dataset
        if (custodianDatasetVersion.length === 0) {
            const datasetCustodian = dataKG[0]['data'][0]['dataset'][0]['custodian'];              
            const foundPerson = datasetCustodian.find(obj => obj.contactInformation.length !== 0);
            nameCustodian = foundPerson['givenName'];
            surnameCustodian = foundPerson['familyName'];
            emailCustodian = foundPerson['contactInformation'][0];
        } else {
            const foundPersonVersion = custodianDatasetVersion.find(obj => obj.contactInformation.length !== 0);
            console.log('Data custodian:', foundPersonVersion);
            nameCustodian = foundPersonVersion['givenName'];
            surnameCustodian = foundPersonVersion['familyName'];
            emailCustodian = foundPersonVersion['contactInformation'][0];              
        }
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
        const zammadTicket = 'test_mayas_app [Ticket#4824171]';
        sendEmailOnWebhook(respondentName, respondentEmail, positionContact, instituionCorrespondent, departm, purposeAccess, dataTitle, zammadTicket, nameCustodian, surnameCustodian, 'maya.kobchenko@medisin.uio.no');
        //emailCustodian['email'] -- replace my email by the email of the custodian
        }else{
            throw new Error('Custodian of the dataset did not provide contact information.');
        }
        //sendEmailOnWebhook(respondentName, respondentEmail, positionContact, instituionCorrespondent, departm, purposeAccess, dataTitle, modifiedUrl, nameCustodian, surnameCustodian, emailCustodian['email']);
    } catch (error) {
        logger.error(`Error sending email:`, error);
    }; 
    res.status(200).json({ status: 'success', received: data });
});

app.listen(port, async () => {
    logger.info(`Server is running on port ${port}`);
});