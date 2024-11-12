import {fetchKGjson} from './fetchKGquery.js';
import {getRequestOptions} from './src/kgAuthentication.js';
import {datasetKG} from './fetchKGDataset.js'; 

const queryID = 'de7e79ae-5b67-47bf-b8b0-8c4fa830348e';
const datasetID = '54719155-54c7-4456-8987-36b7d5dce071';
let tokenKG;
try {
    tokenKG = await getRequestOptions();
    //console.log(tokenKG);
} catch (error) {
    console.error('Error fetching tokens:', error);
}

try {
    console.log('fetching query');
    const dataKG = await fetchKGjson(queryID, datasetID);
    console.log('we managed to fetch data:', dataKG);

    console.log('fetching dataset ');
    const dataKGDataset = await datasetKG();
    console.log('we managed to fetch data:', dataKGDataset);

    //console.log(dataKGDataset['data']);
    //console.log(dataKG['data']);
    //console.log(dataKG['startTime']);

}catch (error) {
    console.log('Error fetching instances from KG.', error);
    throw error;
}