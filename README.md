# access_data_email

Automatic email to data custodian informing about submitted request to access externally hosted data

A vanilla javascript backend app running on rancher. Node version is 20.17.0

To launch the server:

```
$ npm start
```

In development mode:

```
$ npm run dev
```

The query is defined here: https://query.kg.ebrains.eu/queries/de7e79ae-5b67-47bf-b8b0-8c4fa830348e#iss=https%3A%2F%2Fiam.ebrains.eu%2Fauth%2Frealms%2Fhbp&iss=https%3A%2F%2Fiam.ebrains.eu%2Fauth%2Frealms%2Fhbp

Users send request using nettskjema where they provide title and id, which is by default the id of the dataset version.
