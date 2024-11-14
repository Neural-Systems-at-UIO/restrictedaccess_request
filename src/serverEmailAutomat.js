import express from 'express';
import cron from 'node-cron';
import {fetchToken} from './tokenFetcher.js';
import {sendEmailOnWebhook} from './sendEmailOnWebhook.js';
import {htmlPageContent} from './mainPageContent.js';
import {fetchSubmission, fetchAnswers} from './fetchNettskjemaData.js';
import {getRequestOptions} from './kgAuthentication.js';
import {fetchKGjson} from './fetchKGdataset.js';
import dotenv from 'dotenv';
dotenv.config(); 

const app = express();
app.use(express.json());
const port = 4000;

//use my ebrain account for testing
const maya_token = process.env.MAYA_EBRAIN_TOKEN;
const token_maya = "Bearer " + maya_token;
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", token_maya);    
myHeaders.append("Accept", '*/*');
const mayaHeaders = {headers: myHeaders};

const tokenStore = {
    tokenNettskjema: null,
    tokenKG: null
};

const initializeTokens = async () => {
    try {
        const tokenNettskjema = await fetchToken();
        const tokenKG = await getRequestOptions();
        tokenStore.tokenNettskjema = tokenNettskjema;
        tokenStore.tokenKG = tokenKG;
    } catch (error) {
        console.error('Error fetching tokens:', error);
    }
};
//a simple front end page just to see that app is working
async function mainAppPage() {
    return htmlPageContent;
}
app.get('/', async (req, res) => {
    try {
        const data = await mainAppPage();
        res.send(data);
    } catch (error) {
        console.error('Error starting app:', error);
        res.status(500).send('Internal Server Error');
    }
});

// to test remotely without seeing the front page
app.post('/test', (req, res) => {
    const jsonData = req.body;
    console.log(jsonData);
    res.json({ message: 'Data received successfully', data: jsonData });
});

//to check the response from nettskjema
app.get('/nettskjema', async (req, res) => {
    try {
        if (!tokenStore.tokenNettskjema) {
            throw new Error('Token for nettskjema not available');
        }
        const submissionId = 33139391;
        const data = await fetchSubmission(submissionId, tokenStore.tokenNettskjema);
        res.status(200).json(data);
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});
//the main endpoint
app.post('/webhook', async (req, res) => {
    const event = req.body.event;
    console.log('webhook is fired:', event);
    const data = req.body.data;
    const submissionId = data.submission_id;
    //we created a query manually in KG editor named = fetch_data_custodian_info
    const queryID = 'de7e79ae-5b67-47bf-b8b0-8c4fa830348e';
    //this is by default the id of the dataset version
    //data custodian (if empty, not defined - means that the data custodian is the same as for the dataset)
    //check data set version field custodian if empty?
    //if yes, fetch linked dataset id --> get custodian
    try {
        if (!tokenStore.tokenNettskjema) {
            throw new Error('Token to access nettskjema not available');
        }
        if (!tokenStore.tokenKG) {
            throw new Error('Token to access KG not available');
        }
        const submissionData = await fetchSubmission(submissionId, tokenStore.tokenNettskjema);
        const datasetID = await fetchAnswers(submissionData);
        //console.log('datasetID:', datasetID);
        if (!datasetID) {
            throw new Error('Could not fetch dataset id from nettskjema');
        } 
        //const requestOptions = await getRequestOptions();
        const dataKG = await fetchKGjson(queryID, datasetID, mayaHeaders);
        //console.log('we managed to fetch data:', dataKG[0]['data'][0]);
        const custodianDatasetVersion = dataKG[0]['data'][0]['custodian'];
        //console.log('custodian of the dataset version to check if empty:', custodianDatasetVersion);
        let nameCustodian;
        let surnameCustodian;
        let emailCustodian;
        if (custodianDatasetVersion.length === 0) {
            const datasetCustodian = dataKG[0]['data'][0]['dataset'][0]['custodian'];  
            //custodian can be organization, consorcium or person, we need person type             
            const foundPerson = datasetCustodian.find(obj => obj.contactInformation.length !== 0);
            console.log('Data custodian:', foundPerson);
            nameCustodian = foundPerson['givenName'];
            surnameCustodian = foundPerson['familyName'];
            emailCustodian = foundPerson['contactInformation'][0];
            //console.log('custodians name:', nameCustodian, surnameCustodian);
            //console.log('email of the data custodian:', emailCustodian)
        } else {
            console.log('take the custodian of the dataset version');
            //contact info for organization is empty
            const foundPersonVersion = custodianDatasetVersion.find(obj => obj.contactInformation.length !== 0);
            console.log('Data custodian:', foundPersonVersion);
            nameCustodian = foundPersonVersion['givenName'];
            surnameCustodian = foundPersonVersion['familyName'];
            emailCustodian = foundPersonVersion['contactInformation'][0];              
        }
            //return {emailCustodian, nameCustodian, surnameCustodian};

        const respondentName = submissionData['submissionMetadata']['person']['name'];
        const respondentEmail = submissionData['submissionMetadata']['person']['email'];
        //send email:
        console.log('email custodian', emailCustodian);
        sendEmailOnWebhook(respondentName, respondentEmail, nameCustodian, surnameCustodian, emailCustodian['email']);


    } catch (error) {
        console.error('Error sending email:', error);
    };
// send a reply about a webhook fired successfully 
    res.status(200).json({ status: 'success', received: data });
});

// Schedule the token refresh every hour
cron.schedule('0 * * * *', async () => {
    console.log('Running a task to fetch token every hour');
    await initializeTokens();
});

app.listen(port, async () => {
    console.log(`Server is on http://localhost:${port}`);
    await initializeTokens();
});
