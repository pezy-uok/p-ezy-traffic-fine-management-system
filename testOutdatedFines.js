import fetch from 'node-fetch';

// Test with a sample token (this will likely fail without auth)
// But first, let's try to get a token or use public endpoint
const testOutdatedFines = async () => {
  try {
    // Try without token first
    const response = await fetch('http://localhost:8000/api/fines/outdated', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testOutdatedFines();
