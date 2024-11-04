import express from 'express';
import bodyParser from 'body-parser';
import { fetchToken } from './tokenFetcher.js';
import {sendEmailOnWebhook} from './sendEmailOnWebhook.js';
import {htmlPageContent} from './mainPageContent.js';
import {fetchSubmission,fetchAnswers} from './fetchNettskjemaData.js';
import {getRequestOptions} from './tryKgAuthentication.js';

const app = express();
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

app.get('/nettskjema', async (req, res) => {
    try {
        if (!tokenStore.tokenNettskjema) {
            throw new Error('Token for nettskjema not available');
        }
        //to fetch description of nettskjema fields 
        //https://api.nettskjema.no/v3/form/127835/definition
        //'Accept': '*/*'
        const submissionId = 33139391;
        const data = await fetchSubmission(submissionId, tokenStore.tokenNettskjema);
        res.status(200).json(data);
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.use(bodyParser.json());
app.post('/webhook', async (req, res) => {
    const event = req.body.event;
    console.log('webhook is fired:', event);
    const data = req.body.data;
    const contactPersonName = data.name;
    const recipientEmail = data.email;
    const submissionId = data.submission_id;

    try {
        sendEmailOnWebhook(contactPersonName, recipientEmail);
        if (!tokenStore.tokenNettskjema) {
            throw new Error('Token to access nettskjema not available');
        }
        const submissionData = await fetchSubmission(submissionId, tokenStore.tokenNettskjema);
        console.log('submission meatdata:', submissionData['submissionMetadata']);
    } catch (error) {
        console.error('Error sending email:', error);
    };

    res.status(200).json({ status: 'success', received: data });
});

app.listen(port, async () => {
    console.log(`Server is on http://localhost:${port}`);
    await initializeTokens();
});
