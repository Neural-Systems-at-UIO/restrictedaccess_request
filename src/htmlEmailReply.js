//reply to the person requesting data access, to be sent to this email ${recipientEmail}

export function replyEmailHtml(contactPersonName, dataTitle, dataset_uuid) {
    return  `
    <!DOCTYPE html>
    <html>
    <body>
    <div>
        <p>Dear ${contactPersonName},</p>
        <p><br></p>

        <p>We have received your data access request for the following human dataset published on EBRAINS:</p>
        <p>${dataTitle}.</p>
        <p>https://search.kg.ebrains.eu/instances/${dataset_uuid}</p>
        <p><br></p>
        <p>Thank you for your interest in these data. We have forwarded your request to the data custodian, so that they can get in touch with you and agree on the conditions for sharing the data.</p>
        
        <p><br></p>
        <p>Best regards,<p/>
        <p>
        EBRAINS Data Curation Support <br>
        curation-support@ebrains.eu <br>
        https://www.ebrains.eu/ <br>
        <p/>
    </div>
    </body>
    </html>
    `
};
