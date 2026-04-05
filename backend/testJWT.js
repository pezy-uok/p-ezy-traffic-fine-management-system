#!/usr/bin/env node

/**
 * JWT Generation Test Script
 * Tests the OTP-based authentication flow
 * Run: node testJWT.js
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:3001';
const HEADERS = { 'Content-Type': 'application/json' };

// Test credentials from seed data
const TEST_USER = {
  email: 'officer.bandara@pezy.gov',
  phone: '+94772222222',
  name: 'Officer Shashmitha Bandara',
};

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('🧪 JWT Generation Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

async function testJWTGeneration() {
  try {
    // Step 1: Request OTP
    console.log('📝 Step 1: Request OTP');
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Expected Phone: ${TEST_USER.phone}\n`);

    const otpResponse = await axios.post(
      `${BASE_URL}/api/auth/request-otp`,
      { email: TEST_USER.email },
      { headers: HEADERS }
    );

    if (!otpResponse.data.success) {
      console.error('❌ Failed to request OTP:', otpResponse.data.message);
      return;
    }

    console.log('✅ OTP Request Success!');
    console.log(`   Message: ${otpResponse.data.message}`);
    console.log(`   Temporary ID: ${otpResponse.data.temporary_id}\n`);

    const temporaryId = otpResponse.data.temporary_id;

    // Step 2: Extract OTP from log (simulated)
    // In real world, this would come from SMS
    console.log('⏳ Step 2: Waiting for OTP');
    console.log('   Check backend logs for OTP value');
    console.log('   Format: "📱 OTP sent to +94772222222: 456789"\n');

    // For testing, we'll use a dummy OTP and show what happens
    const dummyOTP = '000000'; // Will fail, user needs to provide actual OTP

    console.log('📦 Step 3: Verify OTP');
    console.log(`   Temporary ID: ${temporaryId}`);
    console.log(`   OTP: ${dummyOTP}\n`);

    try {
      const verifyResponse = await axios.post(
        `${BASE_URL}/api/auth/verify-otp`,
        { temporary_id: temporaryId, otp: dummyOTP },
        { headers: HEADERS }
      );

      console.log('❌ This should fail with invalid OTP...\n');
    } catch (error) {
      console.log('✅ Expected Error (wrong OTP):');
      console.log(`   ${error.response.data.message}\n`);
    }

    // Step 3: Show what a successful response would look like
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🎯 Expected Success Response (with correct OTP):\n');

    const mockSuccessResponse = {
      success: true,
      message: 'Login successful',
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMiIsImVtYWlsIjoib2ZmaWNlci5iYW5kYXJhQHBlenotZ292Iiwicm9sZSI6InBvbGljZV9vZmZpY2VyIiwibmFtZSI6Ik9mZmljZXIgU2hhc2htaXRoYSBCYW5kYXJhIiwiZGVwYXJ0bWVudCI6IlRyYWZmaWMiLCJiYWRnZSI6IlBPLTc3MjEiLCJpYXQiOjE3MTE4Njk2MjAsImV4cCI6MTcxMTg3MDUyMH0.abc123xyz',
      user: {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'officer.bandara@pezy.gov',
        name: 'Officer Shashmitha Bandara',
        role: 'police_officer',
        department: 'Traffic',
        phone: '+94772222222',
        badge: 'PO-7721',
      },
    };

    console.log(JSON.stringify(mockSuccessResponse, null, 2));

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('🔐 JWT Token Decoded:\n');

    const tokenParts = mockSuccessResponse.token.split('.');
    const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

    console.log('Header:');
    const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
    console.log(JSON.stringify(header, null, 2));

    console.log('\nPayload:');
    console.log(JSON.stringify(payload, null, 2));

    console.log('\nToken Metadata:');
    console.log(`   Issued At (iat): ${new Date(payload.iat * 1000).toISOString()}`);
    console.log(`   Expires At (exp): ${new Date(payload.exp * 1000).toISOString()}`);
    console.log(`   Valid for: ${(payload.exp - payload.iat) / 60} minutes`);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ Test Complete!\n');

    console.log('📋 Next Steps to Test with Real OTP:');
    console.log('   1. Check backend terminal for OTP message');
    console.log('   2. Copy the OTP value');
    console.log('   3. Update dummyOTP variable in this script');
    console.log('   4. Run script again\n');

    console.log('📚 Test Credentials Available:');
    console.log('   Admin: admin@pezy.gov');
    console.log('   Officer 1: officer.bandara@pezy.gov');
    console.log('   Officer 2: officer.silva@pezy.gov');
    console.log('   Officer 3: officer.fernando@pezy.gov\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
testJWTGeneration();
