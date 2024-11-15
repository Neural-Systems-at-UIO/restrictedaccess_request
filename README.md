# access_data_email

This javascript app sends an automatic email to data custodian informing about submitted request to access externally hosted data.

Users send request using nettskjema where they provide dataset title and id, which is by default the id of the dataset version.

A vanilla javascript backend app running on rancher. Node version > 20.17.0

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

To test if the appplcation is running type in PowerShell:

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

Questions to the curation team:

1. email goes to spam (link to the dataset, html formating). Send a plain email?
2. if people check several position boxes (submission_id = 33256385)
3. position type Other, submission 33236276
