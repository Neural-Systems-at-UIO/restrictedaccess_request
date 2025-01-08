import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();
//const clientId = process.env.OIDC_CLIENT_ID;
//const clientSecret = process.env.CLIENT_SECRET;
const clientId = process.env.WIZARD_OIDC_CLIENT_ID;
const clientSecret = process.env.WIZARD_OIDC_CLIENT_SECRET;

export async function getRequestOptions() {
    try{
        let token = await getTokenFromServiceAccount(clientSecret);
        const requestHeader = { 
            //method: 'GET',
            Accept: "*/*", 
            Authorization: "Bearer " + token, 
            //gzip: true,
            'User-Agent': "python-requests/2.25.0",
            'Content-Type': 'application/json',
            'Content-Encoding': 'gzip, deflate',
            //'Transfer-Encoding': 'chunked',
            //'Connection': 'keep-alive'
        };               
    const requestOptions = {headers: requestHeader};
    return requestOptions;
    } catch (error) {
        throw new Error(`Failed to fetch token for KG: ${error.message}`);
    }
}
        
export async function getTokenFromServiceAccount(clientSecret) {

    let endpointURL = "https://iam.ebrains.eu/auth/realms/hbp/protocol/openid-connect/token";
    let body = "grant_type=client_credentials&client_id=" + clientId + "&client_secret=" + clientSecret + "&scope=openid%20group%20roles%20email%20profile%20team";
    //# Request to get an access token
    //curl -X POST https://iam.ebrains.eu/auth/realms/hbp/protocol/openid-connect/token \
    //-H 'Content-Type: application/x-www-form-urlencoded' \
    //-d "grant_type=client_credentials&client_id=myclient&client_secret=mysecret&scope=email%20profile%20team%20group%20clb.wiki.read%20clb.wiki.write"
    //&scope=openid%20group%20roles%20email%20profile%20team
    let requestOptions = {
	    method: 'post',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
	    body: body
    };

    try{
        let response = await fetch(endpointURL, requestOptions);
        if (!response.ok) {
            throw new Error(`client id or secret unauthorized: ${response.status}`);
          }
        let jsonData = await response.json();
        if (jsonData.access_token) {
            console.log(jsonData.access_token);
            return jsonData.access_token;
          } else {
            throw new Error('Could not fetch KG token');
          }
    } catch (error) {
        throw new Error(`Failed to fetch token for KG: ${error.message}`);
    }
}


