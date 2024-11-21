import{fetchKGjson} from './fetchKGdataset.js';

export async function contactInfoKG(queryID, datasetID, headers) {
    try{
        const dataKG = await fetchKGjson(queryID, datasetID, headers);

        const custodianDatasetVersion = dataKG[0]['data'][0]['custodian'];
        //const originalUrl = dataKG[0]['data'][0]['id'];  //requested dataset version id to create a link
        //const modifiedUrl = modifyUrlPath(originalUrl);  //to send a link to the data custodians
        let nameCustodian;
        let surnameCustodian;
        let emailCustodian;
        //if the custodian of the dataset version is empty, we take custodian of the dataset
        if (custodianDatasetVersion.length === 0) {
            const datasetCustodian = dataKG[0]['data'][0]['dataset'][0]['custodian'];              
            const foundPerson = datasetCustodian.find(obj => obj.contactInformation.length !== 0);
            nameCustodian = foundPerson['givenName'];
            surnameCustodian = foundPerson['familyName'];
            emailCustodian = foundPerson['contactInformation'][0];
        } else {
            const foundPersonVersion = custodianDatasetVersion.find(obj => obj.contactInformation.length !== 0);
            console.log('Data custodian:', foundPersonVersion);
            nameCustodian = foundPersonVersion['givenName'];
            surnameCustodian = foundPersonVersion['familyName'];
            emailCustodian = foundPersonVersion['contactInformation'][0];              
        }

        return {nameCustodian, surnameCustodian, emailCustodian};
    }catch(error) {
        throw new Error(`Could not retrieve contact information from KG: ${error.message}`);
    }

}