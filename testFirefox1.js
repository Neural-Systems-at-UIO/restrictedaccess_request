import {getRequestOptions} from './fetchTokenKG.js';
import 'dotenv/config';

const maya_token = process.env.MAYA_EBRAIN_TOKEN;
const token_maya = "Bearer " + maya_token;
const wizard_token = await getRequestOptions();
const wizardHeaders = new Headers();
wizardHeaders.append("Content-Type", "application/json");
wizardHeaders.append("Authorization", wizard_token);
wizardHeaders.append("Accept", '*/*');

fetch('https://core.kg.ebrains.eu/v3/queries/de7e79ae-5b67-47bf-b8b0-8c4fa830348e/instances?stage=IN_PROGRESS&instanceId=54719155-54c7-4456-8987-36b7d5dce071', {headers: wizardHeaders})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");
myHeaders.append("Authorization", token_maya);    
myHeaders.append("Accept", '*/*');

fetch('https://core.kg.ebrains.eu/v3/queries/de7e79ae-5b67-47bf-b8b0-8c4fa830348e/instances?stage=IN_PROGRESS&instanceId=54719155-54c7-4456-8987-36b7d5dce071', {headers: myHeaders})
  .then(res => res.json())
  .then(json => console.log(json))
  .catch(error => console.error('Error:', error));