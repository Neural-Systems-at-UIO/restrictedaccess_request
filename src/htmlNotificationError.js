export function notificationError(ticketId, submissionId) {
    return  `
    <!DOCTYPE html>
    <html>
    <body>
    <div>
        <p>This is a problem sending automatic email to data custodian.</p>
        <p>Zammad ticket is ${ticketId}, nettskjema submission is ${submissionId}. <p/>
        <p>See log file in the attachment.</p>
    </div>
    </body>
    </html>
    `
};

