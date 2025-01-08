//change from this https://kg.ebrains.eu/api/instances/{dataset version id}
//to this https://search.kg.ebrains.eu/instances/{dataset version id}
//i wanted to send a link to the dataset in the email to data custodians, but email gets marked as spam
export function modifyUrlPath(originalUrl) {
  const url = new URL(originalUrl);
  url.hostname = 'search.kg.ebrains.eu';
  const pathSegments = url.pathname.split('/');
  pathSegments.splice(1, 1); 
  url.pathname = pathSegments.join('/');
  return url.toString(); 
}

//url from zammad webhook has submission_id in the last segmetn
//example of url from zammad webhook: https://nettskjema.no/user/form/127835/submission/{submission_id}
export function extractSubmissionId(nettskjemaUrl) {
  const url = new URL(nettskjemaUrl);
  const pathSegments = url.pathname.split('/');
  const validSegments = pathSegments.filter(segment => segment.length > 0);
  const segmentCount = validSegments.length;
  const lastSegment = validSegments[segmentCount - 1];
  //to check that we have only numbers in this part of url
  const isNumber = /^\d+$/.test(lastSegment);
  if (!isNumber) {
    throw new Error(`Not possible to extract submission id from the webhook: "${lastSegment}".`);
  }
  return lastSegment;
}
  