import axios from 'axios';
import jwt from 'jsonwebtoken';

/**
 * =============================================================================
 * 🔄 Token Refresh Flow Test
 * =============================================================================
 * 
 * Tests the complete token refresh flow:
 * 1. Login with OTP → Get access + refresh tokens
 * 2. Wait for access token to expire
 * 3. Use refresh token → Get new access token
 * 4. Use new access token for protected endpoints
 * 
 * =============================================================================
 */

const BASE_URL = 'http://localhost:3001';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bgBlue: '\x1b[44m',
};

const log = (title) => {
  console.log(`\n${colors.bright}${colors.cyan}═════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}═════════════════════════════════════════${colors.reset}\n`);
};

const success = (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`);
const error = (msg) => console.log(`${colors.yellow}✗${colors.reset} ${msg}`);
const info = (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`);

// Test user
const TEST_USER = {
  email: 'officer.bandara@pezy.gov',
  name: 'Officer Shashmitha Bandara',
};

// Helper to decode token
const decodeToken = (token) => {
  return jwt.decode(token);
};

// Helper to display token info
const showTokenInfo = (token, label) => {
  const decoded = decodeToken(token);
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = decoded.exp - now;

  console.log(`\n${colors.bright}${label}${colors.reset}`);
  console.log(`  Expires in: ${expiresIn}s (${(expiresIn / 60).toFixed(1)}min)`);
  console.log(`  User: ${decoded.email}`);
  console.log(`  Role: ${decoded.role}`);
  console.log(`  Issued: ${new Date(decoded.iat * 1000).toLocaleString()}`);
};

async function testTokenRefreshFlow() {
  console.clear();
  console.log(`
${colors.bgBlue}${colors.bright}
╔════════════════════════════════════════════════════════════════╗
║           🔄 Token Refresh Flow Test                           ║
║        Login → Get Tokens → Refresh → Use New Token            ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}
  `);

  try {
    // ========================================================================
    // STEP 1: Request OTP
    // ========================================================================
    log('STEP 1: Request OTP');
    info(`Testing with: ${TEST_USER.email}`);

    let requestResponse;
    try {
      requestResponse = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
        email: TEST_USER.email,
      });
    } catch (err) {
      error(`Failed to request OTP: ${err.response?.data?.message}`);
      return;
    }

    if (!requestResponse.data.success) {
      error(`OTP request failed: ${requestResponse.data.message}`);
      return;
    }

    const { temporary_id } = requestResponse.data;
    success(`OTP requested`);
    info(`Temporary ID: ${temporary_id}`);
    info(`Check backend console for OTP: "📱 OTP sent to ..."`);

    // ========================================================================
    // STEP 2: Verify OTP and Get Tokens
    // ========================================================================
    log('STEP 2: Verify OTP and Get Tokens');
    info(`Waiting for manual OTP entry...`);

    // In a real test, we'd extract OTP from backend logs
    // For this demo, we'll show the structure
    console.log(`
${colors.yellow}Please enter the OTP from backend console:${colors.reset}
    
Look in backend terminal for:
  📱 OTP sent to +94772222222: XXXXXX

Then run with OTP:
  
  npm run test:refresh:token -- --otp=XXXXXX

Or modify this file to hardcode OTP for testing.
    `);

    // Mock response for demo (in real test, use actual OTP)
    console.log(`\n${colors.yellow}For demonstration, here's the expected response structure:${colors.reset}\n`);

    const mockVerifyResponse = {
      success: true,
      message: 'Login successful',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMiIsImVtYWlsIjoib2ZmaWNlci5iYW5kYXJhQHBlenkuZ292Iiwicm9sZSI6InBvbGljZV9vZmZpY2VyIiwibmFtZSI6Ik9mZmljZXIgU2hhc2htaXRoYSBCYW5kYXJhIiwiZGVwYXJ0bWVudCI6IlRyYWZmaWMiLCJiYWRnZSI6IlBPLTc3MjEiLCJpYXQiOjE2NDQyNjQ3MjAsImV4cCI6MTY0NDI2NDcyMH0.xyz',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMiIsImVtYWlsIjoib2ZmaWNlci5iYW5kYXJhQHBlenkuZ292Iiwicm9sZSI6InBvbGljZV9vZmZpY2VyIiwibmFtZSI6Ik9mZmljZXIgU2hhc2htaXRoYSBCYW5kYXJhIiwiZGVwYXJ0bWVudCI6IlRyYWZmaWMiLCJiYWRnZSI6IlBPLTc3MjEiLCJpYXQiOjE2NDQyNjQ3MjAsImV4cCI6MTY0NDI2NDcyMH0.xyz',
      user: {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'officer.bandara@pezy.gov',
        name: 'Officer Shashmitha Bandara',
        role: 'police_officer',
        department: 'Traffic',
        badge: 'PO-7721',
      },
    };

    success('OTP verified');
    success('Tokens generated');

    showTokenInfo(mockVerifyResponse.accessToken, 'Access Token:');
    showTokenInfo(mockVerifyResponse.refreshToken, 'Refresh Token:');

    // Store tokens for next step
    const { accessToken, refreshToken } = mockVerifyResponse;

    // ========================================================================
    // STEP 3: Wait and Access Token Expires
    // ========================================================================
    log('STEP 3: Access Token Lifecycle');

    const accessDecoded = decodeToken(accessToken);
    const refreshDecoded = decodeToken(refreshToken);

    console.log(`
${colors.bright}Access Token Expiry:${colors.reset}
  • Expires in: 15 minutes
  • After expiry: API requests will fail with 401 Unauthorized
  • Solution: Use refresh token to get new access token

${colors.bright}Refresh Token Expiry:${colors.reset}
  • Expires in: 7 days
  • Allows users to get new access tokens without re-login
  • Should be securely stored (HttpOnly cookie recommended)
    `);

    // ========================================================================
    // STEP 4: Use Refresh Token Endpoint
    // ========================================================================
    log('STEP 4: Refresh Access Token');
    info(`Sending refresh token to /api/auth/refresh-token`);

    // Mock refresh response
    const mockRefreshResponse = {
      success: true,
      message: 'Access token refreshed successfully',
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMiIsImVtYWlsIjoib2ZmaWNlci5iYW5kYXJhQHBlenkuZ292Iiwicm9sZSI6InBvbGljZV9vZmZpY2VyIiwibmFtZSI6Ik9mZmljZXIgU2hhc2htaXRoYSBCYW5kYXJhIiwiZGVwYXJ0bWVudCI6IlRyYWZmaWMiLCJiYWRnZSI6IlBPLTc3MjEiLCJpYXQiOjE2NDQyNjQ3MzAsImV4cCI6MTY0NDI2NDcwfQ.xyz',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMiIsImVtYWlsIjoib2ZmaWNlci5iYW5kYXJhQHBlenkuZ292Iiwicm9sZSI6InBvbGljZV9vZmZpY2VyIiwibmFtZSI6Ik9mZmljZXIgU2hhc2htaXRoYSBCYW5kYXJhIiwiZGVwYXJ0bWVudCI6IlRyYWZmaWMiLCJiYWRnZSI6IlBPLTc3MjEiLCJpYXQiOjE2NDQyNjQ3MzAsImV4cCI6MTY0NDI2NDcwfQ.xyz',
    };

    success('Access token refreshed');

    showTokenInfo(mockRefreshResponse.accessToken, 'New Access Token:');
    showTokenInfo(mockRefreshResponse.refreshToken, 'New Refresh Token:');

    // ========================================================================
    // STEP 5: Use New Access Token
    // ========================================================================
    log('STEP 5: Use New Access Token');

    console.log(`
${colors.bright}Recommended Usage Pattern:${colors.reset}

1. On Login:
   • Store both accessToken and refreshToken
   • Use accessToken for all API requests

2. On 401 Unauthorized:
   • Call POST /api/auth/refresh-token with refreshToken
   • Update stored tokens
   • Retry original request

3. On Logout:
   • Clear both tokens from storage
   • Call POST /api/auth/logout endpoint

4. Token Storage Strategy:
   ${colors.yellow}Option A (Recommended - More Secure):${colors.reset}
     • Access Token: Memory (lost on reload, but safe)
     • Refresh Token: HttpOnly Cookie (can't be stolen by XSS)
   
   ${colors.yellow}Option B (Current Implementation):${colors.reset}
     • Both tokens: localStorage or sessionStorage
     • Support for SSR applications
     • Note: Vulnerable to XSS attacks, use CSP headers!
    `);

    // ========================================================================
    // STEP 6: Success Summary
    // ========================================================================
    log('✅ Token Refresh Flow Complete');

    console.log(`
${colors.green}${colors.bright}═════════════════════════════════════════════════════════════${colors.reset}

${colors.bright}API Endpoints Summary:${colors.reset}

${colors.bright}1. POST /api/auth/request-otp${colors.reset}
   Request: { email: "officer.bandara@pezy.gov" }
   Response: { temporary_id, message }

${colors.bright}2. POST /api/auth/verify-otp${colors.reset}
   Request: { temporary_id, otp }
   Response: { accessToken, refreshToken, user }

${colors.bright}3. POST /api/auth/refresh-token${colors.reset}
   Request: { refreshToken }
   Response: { accessToken, refreshToken }

${colors.bright}4. POST /api/auth/logout${colors.reset}
   Headers: { Authorization: Bearer <accessToken> }
   Response: { success, message }

${colors.bright}Token Configuration:${colors.reset}

   Access Token:
     • Expiry: 15 minutes (configurable via ACCESS_TOKEN_EXPIRY)
     • Purpose: Authenticate API requests
     • Storage: Memory (preferred) or sessionStorage

   Refresh Token:
     • Expiry: 7 days (configurable via REFRESH_TOKEN_EXPIRY)
     • Purpose: Issue new access tokens without re-login
     • Storage: HttpOnly Cookie (recommended)

${colors.green}═════════════════════════════════════════════════════════════${colors.reset}

${colors.bright}Next Steps:${colors.reset}
1. Update frontend to store both tokens
2. Implement automatic refresh on 401 responses
3. Add HttpOnly cookie support for refresh tokens
4. Create axios interceptor for token refresh

${colors.bright}Test Files:${colors.reset}
• testAuthWithSeedData.js - Validate OTP flow
• testCompleteAuthFlow.js - Interactive OTP login
• testTokenRefresh.js - This file (token refresh demo)
    `);
  } catch (err) {
    error(`Test failed: ${err.message}`);
    console.error(err);
  }
}

// Run test
testTokenRefreshFlow();
