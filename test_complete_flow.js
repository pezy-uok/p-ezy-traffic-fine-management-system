import http from 'http';

console.log('🔧 Testing complete OTP flow...\n');

// Test 1: Verify Email
console.log('1️⃣ Testing /api/auth/verify endpoint');
const verifyOptions = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/auth/verify',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  }
};

const verifyReq = http.request(verifyOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Response:`, data);
    console.log('\n2️⃣ Testing /api/auth/request-otp endpoint\n');
    
    // Test 2: Request OTP
    const otpOptions = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/auth/request-otp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const otpReq = http.request(otpOptions, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        console.log(`   Status: ${res2.statusCode}`);
        console.log(`   Response:`, data2);
        console.log('\n✅ Test complete!');
        process.exit(0);
      });
    });

    otpReq.on('error', e => console.error('❌ OTP request error:', e));
    otpReq.write(JSON.stringify({ email: 'officer.bandara@pezy.gov' }));
    otpReq.end();
  });
});

verifyReq.on('error', e => console.error('❌ Verify request error:', e));
verifyReq.write(JSON.stringify({ email: 'officer.bandara@pezy.gov' }));
verifyReq.end();

// Timeout
setTimeout(() => {
  console.error('⏱️ Test timed out');
  process.exit(1);
}, 5000);
