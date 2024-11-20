import express from 'express';
import {fetchToken} from './tokenFetcher.js';
import {sendEmailOnWebhook} from './sendEmailOnWebhook.js';
import {htmlPageContent} from './mainPageContent.js';
import {fetchSubmission, fetchAnswers, fetchPosition} from './fetchNettskjemaData.js';
import {getRequestOptions} from './kgAuthentication.js';
import {fetchKGjson} from './fetchKGdataset.js';
import {modifyUrlPath} from './changeUrl.js';
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
app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`);
    res.status(500).json({ error: 'Internal Server Error' });
});

//use my ebrain account for testing  -- replace with getRequestOptions()
const maya_token = process.env.MAYA_EBRAIN_TOKEN;
const token_maya = "Bearer " + maya_token;
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", token_maya);    
myHeaders.append("Accept", '*/*');
const mayaHeaders = {headers: myHeaders};

//a simple front end page just to see that app is working
async function mainAppPage() {
    return htmlPageContent;
}
app.get('/', async (req, res, next) => {
    try {
        const data = await mainAppPage();
        res.send(data);
    } catch (error) {
        res.status(500).send('Internal Server Error');
        logger.error(`Internal Server Error: ${error.message}`, error);
        next(error);
    }
});

// to test post requests
app.post('/test', (req, res) => {
    const jsonData = req.body;
    console.log(jsonData);
    res.json({ message: 'Data received successfully', data: jsonData });
});
//to test get requests
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});

//to check the response from nettskjema - remove at deployment
app.get('/nettskjema', async (req, res, next) => {
    try {
        const tokenNettskjema = await fetchToken();
        const submissionId = 33236276;
        const data = await fetchSubmission(submissionId, tokenNettskjema, next);
        res.status(200).json(data);
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//the main endpoint
app.post('/webhook', async (req, res, next) => {
    const event = req.body.event;
    logger.info(`webhook is fired: ${event}`);
    const data = req.body.data;
    const submissionId = data.submission_id;  
    const extractedSubmissionId = extractSubmissionId(submissionId); 
    //we created a query manually in KG editor named = fetch_data_custodian_info
    const queryID = 'de7e79ae-5b67-47bf-b8b0-8c4fa830348e';
    //this is by default the id of the dataset version
    //data custodian (if empty, not defined - means that the data custodian is the same as for the dataset)
    //check data set version field custodian if empty?
    //if yes, fetch linked dataset id --> get custodian
    try {        
        const tokenNettskjema = await fetchToken();
        if (!tokenNettskjema) {
            const error = new Error('Token to access nettskjema not available');
            logger.error(error.message);
            next(error);
            return;
        }
        const submissionData = await fetchSubmission(extractedSubmissionId, tokenNettskjema, next);
        const datasetID = await fetchAnswers(submissionData, next);
        if (!datasetID) {
            const error = new Error('Could not fetch dataset id from nettskjema');
            logger.error(error.message);
            next(error); 
            return; 
        } 
        //replace here mayaHeaders with requestOptions and dedicated service account
        //const requestOptions = await getRequestOptions();
        const dataKG = await fetchKGjson(queryID, datasetID, mayaHeaders, next);
        const custodianDatasetVersion = dataKG[0]['data'][0]['custodian'];
        const originalUrl = dataKG[0]['data'][0]['id'];  //requested dataset version id
        const modifiedUrl = modifyUrlPath(originalUrl);
        let nameCustodian;
        let surnameCustodian;
        let emailCustodian;
        //if the custodian of the dataset version is empty, we take custodian of the dataset
        if (custodianDatasetVersion.length === 0) {
            const datasetCustodian = dataKG[0]['data'][0]['dataset'][0]['custodian'];  
            //custodian can be organization, consorcium or person, we need person type             
            const foundPerson = datasetCustodian.find(obj => obj.contactInformation.length !== 0);
            //console.log('Data custodian:', foundPerson);
            nameCustodian = foundPerson['givenName'];
            surnameCustodian = foundPerson['familyName'];
            emailCustodian = foundPerson['contactInformation'][0];
        } else {
            //console.log('take the custodian of the dataset version');
            //contact info for organization is empty
            const foundPersonVersion = custodianDatasetVersion.find(obj => obj.contactInformation.length !== 0);
            console.log('Data custodian:', foundPersonVersion);
            nameCustodian = foundPersonVersion['givenName'];
            surnameCustodian = foundPersonVersion['familyName'];
            emailCustodian = foundPersonVersion['contactInformation'][0];              
        }
        console.log('email custodian', emailCustodian);
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
            const position = await fetchPosition(extractedSubmissionId, tokenNettskjema, code, next);
            posContact.push(position);     
        }
        const positionContact = posContact.join(', ');
        const purpose = submissionData['answers'].find(d => d['externalElementId']==='Purpose');
        const purposeAccess = purpose['textAnswer'];
        
        if (emailCustodian['email'].length>0){
        const zammadTicket = 'test_mayas_app [Ticket#4824171]';
        sendEmailOnWebhook(respondentName, respondentEmail, positionContact, instituionCorrespondent, departm, purposeAccess, dataTitle, zammadTicket, nameCustodian, surnameCustodian, 'maya.kobchenko@medisin.uio.no', next);
        //emailCustodian['email'] -- replace my email by the email of the custodian
        }else{
            console.log('Custodian of the dataset does not have any contact information availabale.')
        }
        //sendEmailOnWebhook(respondentName, respondentEmail, positionContact, instituionCorrespondent, departm, purposeAccess, dataTitle, modifiedUrl, nameCustodian, surnameCustodian, emailCustodian['email']);
    } catch (error) {
        logger.error(`Error sending email: ${error.message}`, error);
        next(error);
    };
// send a reply about a webhook fired successfully 
    res.status(200).json({ status: 'success', received: data });
});

app.listen(port, async () => {
    logger.info(`Server is running on port ${port}`);
});
