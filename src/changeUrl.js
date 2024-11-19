//change from this https://kg.ebrains.eu/api/instances/{dataset version id}
//to this https://search.kg.ebrains.eu/instances/{dataset version id}

export function modifyUrlPath(originalUrl) {
  const url = new URL(originalUrl);
  url.hostname = 'search.kg.ebrains.eu';
  const pathSegments = url.pathname.split('/');
  pathSegments.splice(1, 1); 
  url.pathname = pathSegments.join('/');
  return url.toString(); 
}
  
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
  if(isNaN(lastSegment)){new Error(`Submission id is missing in url sent by zammad webhook: "${lastSegment}".`);}
  return lastSegment;
}
  