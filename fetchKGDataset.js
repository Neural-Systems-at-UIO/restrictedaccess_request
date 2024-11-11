import fetch from 'node-fetch';
import {getRequestOptions} from './src/kgAuthentication.js';

async function fetchInstance(apiQueryUrl, requestOptions) {
    try{
        const response = await fetch(apiQueryUrl, requestOptions);
        //console.log('Raw response:', response );
        if (!response.ok) {
            console.error('Error connecting to KG: ' + response.status);
            throw error;}
        
        console.log('checking response headers for dataset');
        console.log('Response Headers dataset:', response.headers.raw());
        console.log('Content encoding dataset', response.headers.get('content-encoding'));
        console.log('Transfer encoding dataset:', response.headers.get('transfer-encoding'));
        console.log('Content-Type dataset', response.headers.get('Content-Type') );
        console.log("response type dataset =", response.type); 

        if (response.body && typeof response.body.getReader === 'function') {
            console.log('response.body is a ReadableStream');}
        //const reader = response.body.getReader();
        //const reader = stream.getReader();
        //const decoder = new TextDecoder();
        //const data = await fetchChuncks(reader);
        //const data = await decodeStream(response.body, encoding);
        const data = await response.json();
        return data;
        } catch (error) {
            console.error('Error fetching json from KG api', error);
            throw error;
        }
}
//https://core.kg.ebrains.eu/v3/queries/de7e79ae-5b67-47bf-b8b0-8c4fa830348e/instances?stage=IN_PROGRESS&instanceId=54719155-54c7-4456-8987-36b7d5dce071
export async function datasetKG() {
    const API_BASE_URL = "https://core.kg.ebrains.eu/";
    const API_ENDPOINT = "v3/queries/";
    const QUERY_PARAMS = ["stage=IN_PROGRESS", "instanceId="];
    const results = [];
    const queryUrl = 'https://core.kg.ebrains.eu/v3/instances/54719155-54c7-4456-8987-36b7d5dce071?stage=IN_PROGRESS'; 
    //const queryUrl = API_BASE_URL + API_ENDPOINT + `${queryID}` + "/instances?" + QUERY_PARAMS.join("&") + `${datasetID}`;
    //console.log(queryUrl);
    try {
        const requestOptions = await getRequestOptions();
        //console.log('request headers:', requestOptions);
        const data = await fetchInstance(queryUrl, requestOptions);
        //console.log(data);
        results.push(data);
    } catch (error) {
        console.error(`Error fetching instance from KG`, error);
        throw error; 
    }
    //console.log('results from KG:',results);
    return results;
}