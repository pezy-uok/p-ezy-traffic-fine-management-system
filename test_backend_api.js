import http from 'http';

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/auth/request-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const req = http.request(options, (res) => {
  console.log(`\n✅ Backend responded with status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`📦 Response data:`, data);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error(`❌ Error: ${e.message}`);
  process.exit(1);
});

const payload = JSON.stringify({
  email: 'officer.bandara@pezy.gov'
});

console.log('🚀 Sending request to http://localhost:8000/api/auth/request-otp');
console.log(`📦 Payload:`, payload);
console.log('⏳ Waiting for response...\n');

req.write(payload);
req.end();
