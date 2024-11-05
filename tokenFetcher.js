//fetches token to access nettskjema v3 using client secret and client id
//https://api.nettskjema.no/v3/swagger-ui/index.html#/Submission%20with%20answers/getSubmission
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const clientId = process.env.NETTSKJEMA_CLIENT_ID;
const clientSecret = process.env.NETTSKJEMA_CLIENT_SECRET;
const tokenEndpointUrl = process.env.TOKEN_ENDPOINT_URL; 

export async function fetchToken() {
    const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    try {
        const response = await axios.post(
            tokenEndpointUrl,
            new URLSearchParams({
                'grant_type': 'client_credentials'
            }).toString(),
            {
                headers: {
                    'Authorization': `Basic ${basicAuth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        return response.data.access_token;

    } catch (error) {
        console.error('Failed to fetch access token:', error);
        throw new Error('Failed to fetch access token');
    }
}
