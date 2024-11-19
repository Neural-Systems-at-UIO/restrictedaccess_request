import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
//const clientId = process.env.WIZARD_OIDC_CLIENT_ID;
const clientSecret = process.env.WIZARD_OIDC_CLIENT_SECRET;
//set up loggin here as well

export async function getRequestOptions() {

    let token = await getTokenFromServiceAccount(clientSecret);

    const requestHeader = { 
        //method: 'GET',
        Accept: "*/*", 
        Authorization: "Bearer " + token, 
        //gzip: true,
        //'User-Agent': "python-requests/2.25.0",
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip, deflate',
        //'Transfer-Encoding': 'chunked',
        //'Connection': 'keep-alive'
    };
        
    const requestOptions = {headers: requestHeader};
    return requestOptions;
}
        
export async function getTokenFromServiceAccount(clientSecret) {

    let endpointURL = "https://iam.ebrains.eu/auth/realms/hbp/protocol/openid-connect/token";
    let secret = clientSecret;

    let body = "grant_type=client_credentials&client_id=ebrains-wizard-dev&client_secret=" + secret + "&scope=email%20profile%20team%20group";
    
    let requestOptions = {
	    method: 'post',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	    body: body
    };

    let result = await fetch(endpointURL, requestOptions);
    let jsonData = await result.json();
    return jsonData.access_token;
}


