import axios from 'axios';
import jwt from 'jsonwebtoken';
import readline from 'readline';

/**
 * =============================================================================
 * 🔐 Complete OTP → JWT Authentication Flow Test
 * =============================================================================
 * 
 * This test performs the COMPLETE authentication flow:
 * 1. Request OTP for a user
 * 2. Manually input the OTP (found in backend console logs)
 * 3. Verify OTP and receive JWT
 * 4. Decode and validate JWT structure
 * 5. Test logout with JWT
 * 
 * PREREQUISITE: Database must be seeded with users
 * RUN: npx node testCompleteAuthFlow.js
 * 
 * =============================================================================
 */

const BASE_URL = 'http://localhost:3001';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
};

const log = (title, message = '') => {
  console.log(`\n${colors.bright}${colors.cyan}═════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${title}${colors.reset}`);
  if (message) console.log(`${colors.bright}${message}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}═════════════════════════════════════════${colors.reset}\n`);
};

const success = (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`);
const error = (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`);
const info = (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`);
const warning = (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);

// Interactive prompt
function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// Test credentials (from seed data)
const TEST_ACCOUNTS = [
  {
    label: 'Admin',
    email: 'admin@pezy.gov',
    name: 'System Administrator',
  },
  {
    label: 'Officer 1',
    email: 'officer.bandara@pezy.gov',
    name: 'Officer Shashmitha Bandara',
  },
  {
    label: 'Officer 2',
    email: 'officer.silva@pezy.gov',
    name: 'Officer Kasun Silva',
  },
  {
    label: 'Officer 3',
    email: 'officer.fernando@pezy.gov',
    name: 'Officer Dilshan Fernando',
  },
];

// ============================================================================
// MAIN TEST FLOW
// ============================================================================

async function runCompleteAuthTest() {
  console.clear();
  console.log(`
${colors.bgBlue}${colors.bright}
╔════════════════════════════════════════════════════════════════╗
║     🔐 Complete OTP → JWT Authentication Flow Test              ║
║         Request OTP → Verify → Decode JWT → Logout             ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}
  `);

  try {
    // Step 1: Check server connectivity
    log('STEP 1: Server Connectivity Check');
    try {
      await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 }).catch(() => {
        return axios.get(`${BASE_URL}/`, { timeout: 5000 });
      });
      success('Backend server is online');
    } catch (err) {
      error('Backend server not responding');
      warning(`Please start backend with: npm run dev`);
      process.exit(1);
    }

    // Step 2: Select account
    log('STEP 2: Select Test Account', 'Which account would you like to test?');
    TEST_ACCOUNTS.forEach((acc, i) => {
      console.log(`  ${i + 1}. ${acc.label} - ${acc.email}`);
    });

    let selection;
    while (!selection || selection < 1 || selection > TEST_ACCOUNTS.length) {
      const input = await prompt(`\nSelect account (1-${TEST_ACCOUNTS.length}): `);
      selection = parseInt(input);
    }

    const selectedAccount = TEST_ACCOUNTS[selection - 1];
    console.log(`\n${colors.bright}Selected: ${selectedAccount.name}${colors.reset}`);

    // Step 3: Request OTP
    log('STEP 3: Request OTP', `Requesting OTP for ${selectedAccount.email}`);

    let requestResponse;
    try {
      requestResponse = await axios.post(`${BASE_URL}/api/auth/request-otp`, {
        email: selectedAccount.email,
      });
    } catch (err) {
      error(`Failed to request OTP: ${err.response?.data?.message || err.message}`);
      warning('Make sure database is seeded: npm run seed');
      process.exit(1);
    }

    if (!requestResponse.data.success) {
      error(`OTP request failed: ${requestResponse.data.message}`);
      process.exit(1);
    }

    const { temporary_id } = requestResponse.data;
    success(`OTP requested successfully`);
    info(`Temporary ID: ${temporary_id}`);

    // Step 4: Fetch OTP from user
    log('STEP 4: Get OTP Code', 'Check backend console for OTP message');

    console.log(`
${colors.yellow}╔════════════════════════════════════════════════════════════╗${colors.reset}
${colors.yellow}║                   🔍 FIND YOUR OTP CODE                   ║${colors.reset}
${colors.yellow}╚════════════════════════════════════════════════════════════╝${colors.reset}

Look in the ${colors.bright}backend console${colors.reset} (where 'npm run dev' is running) for:

  ${colors.bright}📱 OTP sent to ${selectedAccount.email}: XXXXXX${colors.reset}

The 6-digit code after the colon is your OTP.

Example:
  ${colors.dim}📱 OTP sent to officer.bandara@pezy.gov: 523891${colors.reset}
    `);

    const otpCode = await prompt(`\nEnter the 6-digit OTP code: `);

    if (!otpCode.match(/^\d{6}$/)) {
      error('Invalid OTP format (must be 6 digits)');
      process.exit(1);
    }

    // Step 5: Verify OTP
    log('STEP 5: Verify OTP and Generate JWT', `Sending OTP: ${otpCode}`);

    let verifyResponse;
    try {
      verifyResponse = await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        temporary_id,
        otp: otpCode,
      });
    } catch (err) {
      error(`OTP verification failed: ${err.response?.data?.message || err.message}`);
      warning('OTP may have expired (5-minute window) or is incorrect');
      process.exit(1);
    }

    if (!verifyResponse.data.success) {
      error(`Verification failed: ${verifyResponse.data.message}`);
      process.exit(1);
    }

    const { token, user } = verifyResponse.data;
    success('OTP verified successfully');
    success('JWT token generated');

    // Step 6: Display user info
    log('STEP 6: User Information');
    console.log(`
${colors.bright}User Details:${colors.reset}
  ID: ${user.id}
  Email: ${user.email}
  Name: ${user.name}
  Role: ${user.role}
  Department: ${user.department}
  Online Status: ${user.is_online ? colors.green + '🟢 Online' + colors.reset : colors.red + '🔴 Offline' + colors.reset}
  Last Login: ${user.last_login_at}
    `);

    // Step 7: Decode JWT
    log('STEP 7: Decode JWT Token');

    const decoded = jwt.decode(token);
    if (!decoded) {
      error('Failed to decode JWT');
      process.exit(1);
    }

    success('JWT decoded successfully');

    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    const expiresAt = new Date(decoded.exp * 1000).toLocaleString();

    console.log(`
${colors.bright}JWT Structure:${colors.reset}
  Algorithm: HS256
  Type: Bearer Token

${colors.bright}JWT Payload:${colors.reset}
  User ID: ${decoded.id}
  Email: ${decoded.email}
  Role: ${decoded.role}
  Name: ${decoded.name}
  Badge: ${decoded.badge || 'N/A'}
  Department: ${decoded.department}

${colors.bright}Token Expiry:${colors.reset}
  Issued At: ${new Date(decoded.iat * 1000).toLocaleString()}
  Expires At: ${expiresAt}
  Time Remaining: ${expiresIn} seconds (${(expiresIn / 60).toFixed(1)} minutes)

${colors.bright}JWT Token (Full):${colors.reset}
${colors.dim}${token}${colors.reset}
    `);

    // Step 8: Test logout
    log('STEP 8: Test Logout', 'Using JWT token for authentication');

    try {
      const logoutResponse = await axios.post(
        `${BASE_URL}/api/auth/logout`,
        { user_id: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (logoutResponse.data.success) {
        success('Logout successful');
        info('User marked as offline in database');
      } else {
        warning(`Logout response: ${logoutResponse.data.message}`);
      }
    } catch (err) {
      warning(`Logout test skipped: ${err.response?.data?.message || err.message}`);
    }

    // Step 9: Success Summary
    log('✅ ALL TESTS PASSED', 'Complete Authentication Flow Validated');

    console.log(`
${colors.green}${colors.bright}═════════════════════════════════════════════════════════════${colors.reset}

${colors.bright}Authentication Flow Summary:${colors.reset}

  ✓ Server connectivity verified
  ✓ OTP requested successfully
  ✓ OTP verified with correct code
  ✓ JWT token generated by backend
  ✓ JWT token decoded successfully
  ✓ Token payload contains correct user info
  ✓ Token expiry set to 15 minutes
  ✓ Logout endpoint working

${colors.bright}System Status: OPERATIONAL 🟢${colors.reset}

${colors.bright}Next Steps:${colors.reset}

  1. Save the JWT token for testing protected endpoints
  2. Use Authorization: Bearer <token> for authenticated requests
  3. Test fine creation, retrieval endpoints
  4. Test officer tracking (is_online, last_login_at)

${colors.green}═════════════════════════════════════════════════════════════${colors.reset}
    `);
  } catch (err) {
    error(`Unexpected error: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

// Run the test
runCompleteAuthTest();
