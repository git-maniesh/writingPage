const https = require('https');

const data = JSON.stringify({
  access_key: '60ccc337-3792-478d-8d17-ae18209b0d07',
  name: 'Test'
});

const options = {
  hostname: 'api.web3forms.com',
  port: 443,
  path: '/submit',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  console.log('headers:', res.headers);

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
