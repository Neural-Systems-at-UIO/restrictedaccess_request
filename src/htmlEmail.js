export function emailHtmlText(contactPersonName, recipientEmail, positionContact, institution, departm, purposeAccess, dataTitle, dataset_uuid, nameCustodian, surnameCustodian) {
    return  `
    <!DOCTYPE html>
    <html>
    <body>
    <div>
        <p>Dear ${nameCustodian} ${surnameCustodian},</p>
        <p><br></p>

        <p>We have received a data access request for the following human dataset published on EBRAINS under your custodianship:</p>
        <p>${dataTitle}.</p>
        <p>https://search.kg.ebrains.eu/instances/${dataset_uuid}</p>

        <p>Requester: ${contactPersonName}, ${positionContact}, ${departm}, ${institution}, email: ${recipientEmail}<p/>

        <p>Purpose of access: ${purposeAccess}</p>

        <p>We provide you with this information so that you can get in touch with the person who has requested access, 
        and agree on the conditions for sharing these data.</p>

        <p>Please note that as the data custodian, it is your responsibility 
        to ensure that GDPR and other applicable regulations are followed when processing human data. 
        It is often advisable to set up a Data Processing Agreement with interested parties. 
        The Data Protection Officer of your academic institution may be able to assist you in related matters.</p>
        
        <p>Please do not hesitate to contact us, if you have any questions.<p/>
        
        <p><br></p>
        <p>Best regards,<p/>
        <p>---<br>
        EBRAINS Data Curation Support <br>
        curation-support@ebrains.eu <br>
        https://www.ebrains.eu/ <br>
        https://www.humanbrainproject.eu/
        <p/>
    </div>
    </body>
    </html>
    `
};

