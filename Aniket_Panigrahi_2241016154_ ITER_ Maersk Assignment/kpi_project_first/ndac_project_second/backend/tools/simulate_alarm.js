// Simple simulator to POST an NDAC alarm to the service
const http = require('http');

const payload = {
  type: "CELL_OUTAGE",
  severity: "CRITICAL",
  timestamp: (new Date()).toISOString(),
  source: "NDAC-Unit-01",
  details: "Cell site 12 lost connectivity",
  payload: { cellId: 12, reason: "link_down" }
};

const data = JSON.stringify(payload);
const options = {
  hostname: process.env.HOST || 'localhost',
  port: process.env.PORT || 5000,
  path: '/api/alarms/ingest?api_key=' + (process.env.API_KEY || 'SUPERSECRET_NDAC_KEY'),
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
