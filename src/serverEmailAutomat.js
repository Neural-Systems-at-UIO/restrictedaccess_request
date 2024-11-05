import express from 'express';
import cron from 'node-cron';
import {fetchToken} from './tokenFetcher.js';
import {sendEmailOnWebhook} from './sendEmailOnWebhook.js';
import {htmlPageContent} from './mainPageContent.js';
import {fetchSubmission,fetchAnswers} from './fetchNettskjemaData.js';
import {getRequestOptions} from './kgAuthentication.js';

const app = express();
app.use(express.json());
const port = 4000;
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

app.post('/test', (req, res) => {
    const jsonData = req.body;
    console.log(jsonData);
    res.json({ message: 'Data received successfully', data: jsonData });
});

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
        console.log(datasetID);

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

// Schedule the token refresh to run daily at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running a task to fetch token at midnight');
    await initializeTokens();
});

app.listen(port, async () => {
    console.log(`Server is on http://localhost:${port}`);
    await initializeTokens();
});
