//import fetch from 'node-fetch';
//import https from 'https'; 
//import { promises as fs } from 'fs';
//import pako from 'pako';
import {getRequestOptions} from './src/kgAuthentication.js';
import {decodeStream} from './src/bufferStream.js';
import {fetchChuncks} from './src/fetchChunks.js';
//import { gunzip } from 'zlib';
//import { promisify } from 'util';
//import { Buffer } from 'buffer';
//import { createGunzip } from 'zlib';
//import { pipeline } from 'stream';
//import {handleGzipResponse} from './decomprStremGzip.js';

async function fetchInstance(apiQueryUrl, requestOptions) {
    try{
        const options = {
            hostname: apiQueryUrl, // Replace with your API's hostname  
            requestOptions,                       // Replace with your API's path
            method: 'GET'
          };
        console.log(options);

        https.get(options, (res) => {
        let responseData = [];
        const contentType = res.headers['content-type'];
        const isBinaryContent = contentType && ['application/octet-stream', 'image/jpeg', 'image/png', 'application/pdf'].some(type => contentType.includes(type));
        
        console.log(`Content-Type: ${contentType}`);
        
        if (isBinaryContent) {
            console.log('The response is likely a binary stream.');
        } else {
            console.log('The response does not appear to be a binary stream.');
        }
        
        res.on('data', (chunk) => {
            responseData.push(chunk);
            console.log(`Received chunk of size: ${chunk.length}`);
        });
        
        res.on('end', () => {
            const buffer = Buffer.concat(responseData);
            if (isBinaryContent) {
            console.log('Binary data received:', buffer);
            } else {
            console.log('Textual data received:', buffer.toString('utf8'));
            }
        });
        
        }).on('error', (e) => {
        console.error(`Request error: ${e.message}`);
        });
          

        

        const response = await fetch(apiQueryUrl, requestOptions);
        if (!response.ok) {
            console.error('Error connecting to KG: ' + response.status);
            throw error;}

        //check response headers    
        console.log('Transfer-Encoding query:', response.headers.get('transfer-encoding'));
        console.log('Content-Type query', response.headers.get('Content-Type') );
        console.log('Response Headers query:', response.headers.raw());
        console.log("response type query =", response.type); 
        console.log('query content encoding:', response.headers.get('content-encoding'));
        //console.log('Raw response:', response ); 

        if (response.body && typeof response.body.getReader === 'function') {
            console.log('response.body is a ReadableStream');}

        //const data = await decodeStream(response.body, encoding);

        //const reader = response.body.getReader();
        //const reader = stream.getReader();
        //const decoder = new TextDecoder();
        //const data = await fetchChuncks(reader);
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
    //console.log(queryUrl);
    try {
        const requestOptions = await getRequestOptions();
        //console.log('request headers:', requestOptions);
        //console.log(queryUrl);
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

