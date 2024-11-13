import fetch from 'node-fetch';
import {getRequestOptions} from './kgAuthentication.js';


async function fetchInstance(apiQueryUrl, requestOptions) {
    try{
        const response = await fetch(apiQueryUrl, requestOptions);
        if (!response.ok) {
            console.error('Error connecting to KG: ' + response.status);
            throw error;} 
        if (response.body && typeof response.body.getReader === 'function') {
            console.log('response.body is a ReadableStream');}
        const data = await response.json();
        return data;
        } catch (error) {
            console.error('Error fetching json from KG api', error);
            throw error;
        }
}
//https://core.kg.ebrains.eu/v3/queries/de7e79ae-5b67-47bf-b8b0-8c4fa830348e/instances?stage=IN_PROGRESS&instanceId=54719155-54c7-4456-8987-36b7d5dce071
export async function fetchKGjson(queryID, datasetID) {
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

