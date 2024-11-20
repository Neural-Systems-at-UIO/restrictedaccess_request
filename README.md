# access_data_email

A vanilla javascript backend app running on Rancher (kubernetes). Node version > 20.17.0

This javascript app sends an automatic email to data custodian informing about submitted request to access externally hosted data.

Users send request using nettskjema (id=127835), where they provide dataset title and dataset id, which is by default the id of the dataset version. When nettskjema is sent, zammad ticket is created and zammad webhook sends a POST request to the app containing url: https://nettskjema.no/user/form/127835/submission/{submission_id}. Submission_id is used to extract information about the requested dataset from the Nettskjema API. Using dataset version id, we fetch contact information of the data custodian from the Knowledge Graph API and forward request to the data custodian's email.

To launch the server:

```
$ npm start
```

In development mode:

```
$ npm run dev
```

Using KG editor, we manually defined a query named "fetch_data_custodian_info".  
The defined query: https://query.kg.ebrains.eu/queries/de7e79ae-5b67-47bf-b8b0-8c4fa830348e

To test if the application is running, type in PowerShell:

```
$headers = @{"Content-Type" = "application/json"}
>> $body = @{
>>      message = "Application is running"}
>> $jsonBody = $body | ConvertTo-Json
>> Invoke-RestMethod -Uri "http://localhost:4000/test" -Method POST -Headers $headers -Body $jsonBody
```

To try if application reacts to webhook, in PowerShell:

```
$headers = @{"Content-Type" = "application/json"}
>> $body = @{
>>      event = "data request"
>>      data = @{submission_id = "33139391"}
>>  }
>> $jsonBody = $body | ConvertTo-Json
>> Invoke-RestMethod -Uri "http://localhost:4000/test" -Method POST -Headers $headers -Body $jsonBody
```
