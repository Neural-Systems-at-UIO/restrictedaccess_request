import { Buffer } from 'buffer';
import { promises as fs } from 'fs';
import { gunzip } from 'zlib';
import { createGunzip } from 'zlib';

function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on('data', chunk => {
        console.log('Received chunk size:', chunk.length);
        chunks.push(chunk);
      });
      stream.on('end', () => {
        console.log('End of stream');
        const buffer = Buffer.concat(chunks);
        console.log('Total Buffer Length:', buffer.length);
        resolve(buffer);
      });
      stream.on('error', error => {
        console.error('Stream error:', error);
        reject(error);
      });
    });
  }

  export async function decodeStream(stream, encoding) {
    const dataBuffer = await streamToBuffer(stream);
    console.log('Raw Buffer Contents (first 64 bytes):', dataBuffer.slice(0, 64));
    console.log('Raw Buffer Contents (first 64 bytes):', dataBuffer.slice(0, 64).toString('hex'));
    // Check if the first bytes of the buffer shows gzip compression
    const isGzip = dataBuffer.slice(0, 2).equals(Buffer.from([0x1f, 0x8b]));
    console.log('Is Gzip:', isGzip);  
    
    let decompressedBuffer;
    if (encoding === 'gzip' && isGzip) {
        //decompressedBuffer = pako.ungzip(dataBuffer);
        decompressedBuffer = zlib.gunzip(dataBuffer);
        console.log('Decompressed Data Length:', decompressedBuffer.length);
        const data = JSON.parse(Buffer.from(decompressedBuffer).toString('utf-8'));
        saveData(data);
        return data;
      } else {
        console.log('Received plain JSON data');
        const data = JSON.parse(dataBuffer.toString('utf-8'));
        saveData(data);
        return data;
      }

  }
  async function writeFile(filePath, jsonStr) {
    try {
        await fs.writeFile(filePath, jsonStr);
    } catch (err) {
        console.error('Error writing file:', err);
        throw err;
    }
}

async function saveData(data) {
        const jsonStr = JSON.stringify(data, null, 2);
        const filename = 'KGdata.json';    
        try {
            await writeFile(filename, jsonStr);
            console.log('File with fetched data written successfully');
        } catch (error) {
            console.error('Error writing json file:', error);
        }
}