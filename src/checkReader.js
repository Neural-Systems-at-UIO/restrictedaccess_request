if (typeof ReadableStream !== "undefined" && ReadableStream.prototype.getReader) {
    console.log('Web Streams API is supported');
  } else {
    console.log('Web Streams API is not supported in this version of Node.js');
  }
  