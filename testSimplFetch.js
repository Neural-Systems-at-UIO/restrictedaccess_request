import {getRequestOptions} from './fetchTokenKG.js';
import 'dotenv/config';

const maya_token = process.env.MAYA_EBRAIN_TOKEN;
const token_maya = "Bearer " + maya_token;
const wizard_token = await getRequestOptions();
const wizardHeaders = new Headers();
wizardHeaders.append("Content-Type", "application/json");
wizardHeaders.append("Authorization", wizard_token);
wizardHeaders.append("Accept", '*/*');
//console.log(wizardHeaders);

const url = "https://core.kg.ebrains.eu/v3/queries/de7e79ae-5b67-47bf-b8b0-8c4fa830348e/instances?stage=IN_PROGRESS&instanceId=54719155-54c7-4456-8987-36b7d5dce071";


const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", token_maya);    
myHeaders.append("Accept", '*/*');
//console.log(myHeaders);

try {
    const response = await fetch(url, {headers: myHeaders});
    const response_wizard = await fetch (url, {headers: wizardHeaders});

    const json = await response.json();
    console.log('complete response');
    console.log(json['data'][0]);
    console.log('dataset');
    console.log(json['data'][0]['dataset'][0]);
    console.log('email of the data custodian');
    console.log(json['data'][0]['dataset'][0]['custodian'][1]['contactInformation'][0]);
    console.log(json['data'][0]['id']);
    console.log('json wizard');

    const json_wizard = await response_wizard.json();
    console.log(json_wizard);
    console.log(json_wizard['data']);
} catch (error) {
    console.error(error.message);
}