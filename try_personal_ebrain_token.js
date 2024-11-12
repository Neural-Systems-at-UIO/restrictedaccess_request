//import dotenv from 'dotenv';
//dotenv.config();
//const tokenPersonal = process.env.MAYA_EBRAIN_TOKEN;

async function getData() {

    const url = "https://core.kg.ebrains.eu/v3/queries/de7e79ae-5b67-47bf-b8b0-8c4fa830348e/instances?stage=IN_PROGRESS&instanceId=54719155-54c7-4456-8987-36b7d5dce071"
    const token = "Bearer " + "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJLYU01NTRCM2RmMHBIamZYWi1aRl94bUUwMThPS1R0RkNjMjR3aVVqQmFvIn0.eyJleHAiOjE3MzEzMzA5MzksImlhdCI6MTczMTMyOTEzNywiYXV0aF90aW1lIjoxNzMxMzE3MDQyLCJqdGkiOiJhYzA2OTdmZC05OTU4LTQxM2MtYTk3YS01ZDY0OTIxOTY0YWUiLCJpc3MiOiJodHRwczovL2lhbS5lYnJhaW5zLmV1L2F1dGgvcmVhbG1zL2hicCIsImF1ZCI6WyJqdXB5dGVyaHViIiwieHdpa2kiLCJqdXB5dGVyaHViLWpzYyIsInRlYW0iLCJncm91cCJdLCJzdWIiOiI3YWVjMmJmMi04MmM4LTQwYzEtYmQ2NC0xNzNjYWJjZmQ4NDIiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJrZyIsIm5vbmNlIjoiOTQzM2VlMzgtNmIxYS00MWYxLTgxNmYtZGM5Yzk5NjJhZmRiIiwic2Vzc2lvbl9zdGF0ZSI6ImNjYjYwOTA0LTY1ZmUtNGVjMS04ZjE1LTk0Y2RjOTQwNDgzMSIsInNjb3BlIjoicHJvZmlsZSByb2xlcyBlbWFpbCBvcGVuaWQgZ3JvdXAgY2xiLndpa2kucmVhZCB0ZWFtIiwic2lkIjoiY2NiNjA5MDQtNjVmZS00ZWMxLThmMTUtOTRjZGM5NDA0ODMxIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsIm5hbWUiOiJNYXlhIEtvYmNoZW5rbyIsIm1pdHJlaWQtc3ViIjoiMjM4MDk0NjMyOTI1NTYxNiIsInByZWZlcnJlZF91c2VybmFtZSI6Im1heWFrb2JjaGVua28iLCJnaXZlbl9uYW1lIjoiTWF5YSIsImZhbWlseV9uYW1lIjoiS29iY2hlbmtvIiwiZW1haWwiOiJtYXlhLmtvYmNoZW5rb0BtZWRpc2luLnVpby5ubyJ9.SBZInt2sQpMZT8Uw4w9LAHJFImKqC_mvDMYz_KSrTMm6dOa2xyOcaOpB1OurnZrXTghGPFXRV-JVAZ1uEwChGuHlg3kdg6w2gPbg0YMEwc1MFDN-T4FI6YV9dHpaZpVd_jABqXL5fHE3YzY_hjLKfj7aIitX4kOSe25Syu_28AGtUGgooQ2pKN_v84lmdItT_rBqNyQc6Csbr9rWJFxYSDYGYZerQ3qBf0b1gy-spWMHhS0ePya9-JtUs7r6QZ7yV2yx3s29stezKqFpbH8smoX_t2-0nAyjTqlNIWQvWaV-kwRjiu9UV9nwdnaRkTCvV2jtqOrVK0_QXcbEbjYozw";
    
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", token);    

    try {

        const response = await fetch(url, {headers: myHeaders});

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
  
        const json = await response.json();
        console.log(json);
        console.log(json['data']['custodian']);
        console.log(json['data']['dataset']);
        console.log(json['data']['@context']);
    } catch (error) {
        console.error(error.message);
    }
  }

getData();  