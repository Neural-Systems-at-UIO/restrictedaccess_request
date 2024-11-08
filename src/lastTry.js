import {getRequestOptions} from './kgAuthentication.js';
import fetch from 'node-fetch';

async function fetchInstance(apiQueryUrl, requestOptions) {
    try{
        const response = await fetch(apiQueryUrl, requestOptions);
        //console.log('Raw response:', response );
        if (!response.ok) {
            console.error('Error connecting to KG: ' + response.status);
            throw error;}
        const encoding = response.headers.get('content-encoding');  
        console.log(encoding);
        const data = await response.json();
        return data;
        } catch (error) {
            console.error('Error fetching json from KG api', error);
            throw error;
        }
}
async function fetchKGjson(queryID, datasetID) {
    const API_BASE_URL = "https://core.kg.ebrains.eu/";
    const API_ENDPOINT = "v3/queries/";
    const QUERY_PARAMS = ["stage=IN_PROGRESS", "instanceId="];
    const results = [];
    //const queryUrl = 'https://core.kg.ebrains.eu/v3/instances/54719155-54c7-4456-8987-36b7d5dce071?stage=IN_PROGRESS'; 
    const queryUrl = API_BASE_URL + API_ENDPOINT + `${queryID}` + "/instances?" + QUERY_PARAMS.join("&") + `${datasetID}`;
    try {
        const requestOptions = await getRequestOptions();
        const data = await fetchInstance(queryUrl, requestOptions);
        results.push(data);
    } catch (error) {
        console.error(`Error fetching instance from KG`, error);
        throw error; 
    }
    return results;
}
const queryID = 'de7e79ae-5b67-47bf-b8b0-8c4fa830348e';
const datasetID = '54719155-54c7-4456-8987-36b7d5dce071';
try{
    const dataKG = await fetchKGjson(queryID, datasetID);
    console.log('we managed to fetch data:', dataKG);
    console.log('the field that we are interested in:', dataKG['data']);
}catch (error) {
    console.error('Error fetching instances from KG.', error);
    throw error;
}