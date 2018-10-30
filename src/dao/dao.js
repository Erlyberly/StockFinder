const https = require('https');
let host = 'https://api.iextrading.com/1.0';

export function getStockInfo(ticker: string, type: string) {
//console.log("Getting data...");
let path = '/stock/' + ticker + '/' + type;

return new Promise((resolve, reject) => {
  https.get(host + path, resp => {
      let data = '';

      // A chunk of data has been recieved.
      resp.on('data', chunk => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        if(data === "Not Found" || data === "Unknown symbol"){
          resolve(404);
          return;
        }
        const parsedData = JSON.parse(data);
        resolve(parsedData);
      });

    })
    .on('error', err => {
      console.log('Error: ' + err.message);
    });
  });
}
