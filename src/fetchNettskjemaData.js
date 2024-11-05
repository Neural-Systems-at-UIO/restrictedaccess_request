//put here nettskjema api endpoints to fetch data

import fetch from 'node-fetch';

async function fetchSubmission(submissionId, tokenNettskjema) {
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
    const data = await response.json();
    return data;
}

async function fetchAnswers() {
    const response = await fetch('https://api.example1.com/data');
    if (!response.ok) {
        throw new Error(`Failed to fetch from API One: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
}

export {
    fetchSubmission,
    fetchAnswers
};