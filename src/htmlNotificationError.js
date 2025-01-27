export function notificationError(zammadTicket, submissionId) {
    return  `
    <!DOCTYPE html>
    <html>
    <body>
    <div>
        <p>This is a problem sending automatic email to data custodian.</p>
        <p>Zammad ticket is ${zammadTicket}, nettskjema submission is ${submissionId}. <p/>
        <p>See log file in the attachment.</p>
    </div>
    </body>
    </html>
    `
};

