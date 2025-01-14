# access_data_email

A vanilla javascript backend app running on Rancher (kubernetes). Written in Node 20.17.0

The app sends an automatic email to data custodian informing about submitted request to access externally hosted data.

Users send requests using nettskjema (id=127835), where they provide dataset title and dataset id, which is by default the id of the dataset version. When nettskjema is sent, a dedicated zammad ticket is created and zammad webhook sends a POST request to an endpoint of the application. Zammad webhook should contain the nettskjema url: https://nettskjema.no/user/form/127835/submission/{submission_id} and the corresponding zammad ticket number. Submission_id is used to extract information about the requested dataset from the Nettskjema API. Using dataset version id, we fetch contact information of the data custodian from the Knowledge Graph API and forward request to the data custodian's email. The app sends an CC-email to the curation team with the ticket number in the email subject.

In order to fetch information from the Knowledge Graph API, we set up a service account as described here: https://docs.kg.ebrains.eu/8387ccd27a186dea3dd0b949dc528842/authentication.html#how-to-get-your-token
Service account needs permision to access contact information of the data custodians in both spaces: "RELEASED" and "IN_PROGRESS".

I created a ticket in Zammad for testing the application: https://support.humanbrainproject.eu/#ticket/zoom/24211. I assigned myself as an owner.

The entry file of the application is serverEmailAutomat.js

To launch the server:

```
$ npm start
```

In development mode:

```
$ npm run dev
```

Check in webbrowser:

```
http://localhost:4000/
```

Using KG editor, we manually defined a query named "fetch_data_custodian_info" to fetch information about requested datasets.  
The defined query: https://query.kg.ebrains.eu/queries/de7e79ae-5b67-47bf-b8b0-8c4fa830348e

To test if the application is running, type in PowerShell:

```
$headers = @{"Content-Type" = "application/json"}
$body = @{
     message = "Application is running"}
$jsonBody = $body | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/test" -Method POST -Headers $headers -Body $jsonBody
```

To try if application reacts to webhook, in PowerShell:

```
$headers = @{"Content-Type" = "application/json"}
$body = @{
     event = "data request"
     data = @{submission_id = "https://nettskjema.no/user/form/127835/submission/33139391"}
 }
$jsonBody = $body | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:4000/webhook" -Method POST -Headers $headers -Body $jsonBody
```

# Using curl from command line in console from Browser Developer Tools:

```
fetch('http://localhost:4000/webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    event: 'test event',
    data: {
      submission_id: 'https://nettskjema.no/user/form/127835/submission/33139391'
    }
  })
})
.then(response => {
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));

```

# using Postman:

```
curl -X POST http://localhost:4000/webhook -H "Content-Type: application/json" -d '{"event":"test event"}'
```

Authentication with OIDC client:
https://github.com/HumanBrainProject/kg-core/blob/main/docs/authentication.md
