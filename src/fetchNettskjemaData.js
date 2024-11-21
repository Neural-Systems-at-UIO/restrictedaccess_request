import fetch from 'node-fetch';
import {NETTSKJEMA_QUESTIONS_ID, DRF_ID} from './constants.js';

export async function fetchSubmission(submissionId, tokenNettskjema, next) {
    const response = await fetch(`https://api.nettskjema.no/v3/form/submission/${submissionId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenNettskjema}`,
            'Accept': 'application/json'
        }
    });
    if (!response.ok) {
        const errorMessage = `Failed to connect to nettskjema api: ${response.status}`; 
        logger.error(errorMessage);  
        const error = new Error(errorMessage);
        next(error); 
        return;      
    }
    const submissionData = await response.json();
    return submissionData;
}

export async function fetchAnswers(submissionData, next) {
    const datasetElementId = NETTSKJEMA_QUESTIONS_ID['DatasetID'];
    let result;
    try{
        if (!submissionData || !Array.isArray(submissionData['answers'])) {
            //throw new Error("Invalid submission data or missing answers field");
            const errorMessage = "Invalid submission data or missing answers field"; 
            logger.error(errorMessage);  
            const error = new Error(errorMessage);
            next(error); 
            return; 
        }
        result = submissionData['answers'].find(item => item.elementId === datasetElementId);
        if (!result) {
            //throw new Error("DatasetID not found in nettskjema");
            const errorMessage = "DatasetID not found in nettskjema";
            logger.error(errorMessage);  
            const error = new Error(errorMessage);
            next(error); 
            return; 
        }
    }catch (error) {
        console.error('Problem fetching dataset version id from the nettskjema:', error);
        throw(error);
    };    
    const datasetID = result['textAnswer'];

    return datasetID;
}

export async function fetchPosition(extractedSubmissionId, tokenNettskjema, positionAnswerCode, next) {
    const positionElementId = 1716162;
    const response = await fetch(`https://api.nettskjema.no/v3/form/${DRF_ID}/definition`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenNettskjema}`,
            'Accept': 'application/json'  
        }
    });
    if (!response.ok) {
        //throw new Error(`Failed to fetch submission data`);
        const errorMessage = `Failed to fetch from nettskjema definition endpoint: ${response.status}`; 
        logger.error(errorMessage);  
        const error = new Error(errorMessage);
        next(error); 
        return;
    }
    const submissionData = await response.json();
    const positionIds = submissionData["elements"].find(d => d["elementId"]===positionElementId);
    const positionAnswerId = positionIds['answerOptions'].find(d => d["answerOptionId"]===positionAnswerCode);
    
    let positionAnswer;   
    if (positionAnswerId["text"]==="Other"){
        const submissionData = await fetchSubmission(extractedSubmissionId, tokenNettskjema);
        const positionOtherId = submissionData['answers'].find(d => d['externalElementId']==='PositionOther');
        positionAnswer = positionOtherId['textAnswer'];
    }else {    
        positionAnswer = positionAnswerId["text"];}

    return positionAnswer;
}