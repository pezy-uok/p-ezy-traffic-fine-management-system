import fetch from 'node-fetch';

const testCreateFine = async () => {
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMiIsImVtYWlsIjoib2ZmaWNlci5iYW5kYXJhQHBlenkuZ292Iiwicm9sZSI6InBvbGljZV9vZmZpY2VyIiwibmFtZSI6Ik9mZmljZXIgQmFuZGFyYSIsImRlcGFydG1lbnQiOm51bGwsImJhZGdlIjoiUE8tNzcyMSIsImlhdCI6MTc3NTc3NTg3OCwiZXhwIjoxNzc1ODYyMjc4fQ.KKJr0qh7TbJLYiIFXJQXh2qWBKJCaBSmBTY_oF_ZZ3A';
  
  const response = await fetch('http://localhost:8000/api/fines', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      licenseNo: 'B1122334',
      amount: 5000,
      reason: 'reason 4',
      issuedDate: '2026-03-26',
      violationCode: 'SPEED-001',
      location: 'Colombo Main Road',
      vehicleRegistration: 'RA-1234'
    })
  });

  const text = await response.text();
  console.log('\n=== RESPONSE ===');
  console.log(`Status: ${response.status}`);
  console.log(`Body: ${text}`);
};

testCreateFine().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
