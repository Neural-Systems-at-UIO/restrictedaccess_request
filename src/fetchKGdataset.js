import fetch from 'node-fetch';
import { promises as fs } from 'fs';
import pako from 'pako';
import {getRequestOptions} from './kgAuthentication.js';
//import {streamToBuffer} from './bufferDecompResponse.js';
//import { gunzip } from 'zlib';
//import { promisify } from 'util';
import { Buffer } from 'buffer';
//import { createGunzip } from 'zlib';
//import { pipeline } from 'stream';
//import {handleGzipResponse} from './decomprStremGzip.js';

function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', chunk => {
        console.log('Received chunk size:', chunk.length);
        chunks.push(chunk);
      });
      stream.on('end', () => {
        console.log('End of stream');
        const buffer = Buffer.concat(chunks);
        console.log('Total Buffer Length:', buffer.length);
        resolve(buffer);
      });
      stream.on('error', error => {
        console.error('Stream error:', error);
        reject(error);
      });
    });
  }

async function fetchInstance(apiQueryUrl, requestOptions) {
    try{
        const response = await fetch(apiQueryUrl, requestOptions);
        console.log('Raw response:', response );
        if (!response.ok) {
            console.error('Error connecting to KG: ' + response.status);
            throw error;}

        const encoding = response.headers.get('content-encoding');  
        const dataBuffer = await streamToBuffer(response.body);
        // Check if the first bytes of the buffer shows gzip compression
        const isGzip = dataBuffer.slice(0, 2).equals(Buffer.from([0x1f, 0x8b]));
        console.log('Is Gzip:', isGzip);

        let decompressedBuffer;
        if (encoding === 'gzip' && isGzip) {
            decompressedBuffer = pako.ungzip(dataBuffer);
            console.log('Decompressed Data Length:', decompressedBuffer.length);
            const data = JSON.parse(Buffer.from(decompressedBuffer).toString('utf-8'));
            saveData(data);
            return data;
          } else {
            console.log('Received plain JSON data');
            const data = JSON.parse(dataBuffer.toString('utf-8'));
            saveData(data);
            return data;
          }
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
        console.log('request headers:', requestOptions);
        console.log(queryUrl);
        const data = await fetchInstance(queryUrl, requestOptions);
        results.push(data);
    } catch (error) {
        console.error(`Error fetching instance from KG`, error);
        throw error; 
    }
    //console.log('results from KG:',results);
    return results;
}

async function writeFile(filePath, jsonStr) {
    try {
        await fs.writeFile(filePath, jsonStr);
    } catch (err) {
        console.error('Error writing file:', err);
        throw err;
    }
}

async function saveData(data) {
        const jsonStr = JSON.stringify(data, null, 2);
        const filename = 'KGdata.json';    
        try {
            await writeFile(filename, jsonStr);
            console.log('File with fetched data written successfully');
        } catch (error) {
            console.error('Error writing json file:', error);
        }
}

