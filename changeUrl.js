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
  

  