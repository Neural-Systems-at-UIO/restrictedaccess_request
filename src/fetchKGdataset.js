import fetch from 'node-fetch';
import logger from './logger.js';

//https://core.kg.ebrains.eu/v3/queries/de7e79ae-5b67-47bf-b8b0-8c4fa830348e/instances?stage=IN_PROGRESS&instanceId=54719155-54c7-4456-8987-36b7d5dce071
//const queryUrl = 'https://core.kg.ebrains.eu/v3/instances/54719155-54c7-4456-8987-36b7d5dce071?stage=IN_PROGRESS'; 
   
export async function fetchKGjson(queryID, datasetID, headers, next) {
    const API_BASE_URL = "https://core.kg.ebrains.eu/";
    const API_ENDPOINT = "v3/queries/";
    const QUERY_PARAMS = ["stage=IN_PROGRESS", "instanceId="];
    const queryUrl = API_BASE_URL + API_ENDPOINT + `${queryID}` + "/instances?" + QUERY_PARAMS.join("&") + `${datasetID}`;
    const results = [];
    try {
        const response = await fetch(queryUrl, headers); 
        if (!response.ok) {
            const error = new Error('Error connecting to KG: ' + response.status);
            logger.error(error.message);
            next(error);
            return;
        } 

        const data = await response.json();
        results.push(data);   
    } catch (error) {
        logger.error(`Error fetching instance from KG: ${error.message}`, error);
        next(error);
    }
    return results; 
}

