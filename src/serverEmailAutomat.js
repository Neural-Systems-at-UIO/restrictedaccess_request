import express from 'express';
import cron from 'node-cron';
import 'dotenv/config';
import {fetchToken} from './tokenFetcher.js';
import {sendEmailOnWebhook} from './sendEmailOnWebhook.js';
import {htmlPageContent} from './mainPageContent.js';
import {fetchSubmission, fetchAnswers} from './fetchNettskjemaData.js';
import {getRequestOptions} from './kgAuthentication.js';
import {fetchKGjson} from './fetchKGdataset.js';

const app = express();
app.use(express.json());
const port = 4000;
//use my ebrain account for testing
//dotenv.config();  //not sure that this is needed
const maya_token = process.env.MAYA_EBRAIN_TOKEN;
const token_maya = "Bearer " + maya_token;
const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", token_maya);    
myHeaders.append("Accept", '*/*');

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
//a simple front end page jsut to see that app is working
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

/*app.post('/test', (req, res) => {
    const jsonData = req.body;
    console.log(jsonData);
    res.json({ message: 'Data received successfully', data: jsonData });
});*/

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

app.post('/webhook', async (req, res) => {
    const event = req.body.event;
    console.log('webhook is fired:', event);
    const data = req.body.data;
    const submissionId = data.submission_id;

    try {
        if (!tokenStore.tokenNettskjema) {
            throw new Error('Token to access nettskjema not available');
        }
        if (!tokenStore.tokenKG) {
            throw new Error('Token to access KG not available');
        }
        const submissionData = await fetchSubmission(submissionId, tokenStore.tokenNettskjema);
        const datasetID = await fetchAnswers(submissionData);
        console.log('datasetID:', datasetID);
        if (!datasetID) {
            throw new Error('Could not fetch dataset id from nettskjema');
        }
        //we created a query manually in KG editor 
        const queryID = 'de7e79ae-5b67-47bf-b8b0-8c4fa830348e';
        try{
            const dataKG = await fetchKGjson(queryID, datasetID);
            console.log('we managed to fetch data:', dataKG);
            console.log(dataKG['data']);
        }catch (error) {
            console.error('Error fetching instances from KG.', error);
            throw error;
        }

        const respondentName = submissionData['submissionMetadata']['person']['name'];
        const respondentEmail = submissionData['submissionMetadata']['person']['email'];
        //send email:
        sendEmailOnWebhook(respondentName, respondentEmail);


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
