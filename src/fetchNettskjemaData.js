//put here nettskjema api endpoints to fetch data

import fetch from 'node-fetch';
import {NETTSKJEMA_QUESTIONS_ID} from './constants.js';

export async function fetchSubmission(submissionId, tokenNettskjema) {
    const response = await fetch(`https://api.nettskjema.no/v3/form/submission/${submissionId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${tokenNettskjema}`,
            'Accept': 'application/json'
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch submission data`);
    }
    const submissionData = await response.json();
    return submissionData;
}

export async function fetchAnswers(submissionData) {
    const elementId = NETTSKJEMA_QUESTIONS_ID['DatasetID'];
    const result = submissionData['answers'].find(item => item.elementId === elementId);
    const datasetID = result['textAnswer'];
    //console.log(submissionData['submissionMetadata']);

    return datasetID;
}