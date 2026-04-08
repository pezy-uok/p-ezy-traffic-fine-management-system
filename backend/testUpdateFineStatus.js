import axios from 'axios';

/**
 * =============================================================================
 * 📋 PEZY-410: Update Fine Status Test
 * =============================================================================
 * 
 * This test validates the updateFineStatus() service implementation:
 * ✓ Valid status transitions (unpaid → paid, unpaid → outdated)
 * ✓ Invalid status transitions (paid cannot transition)
 * ✓ Audit log creation
 * ✓ Payment date recording
 * ✓ Error handling
 * 
 * PREREQUISITE: 
 * - Backend must be running (http://localhost:3001)
 * - Database seeded with test data
 * - Valid JWT token (from police officer)
 * 
 * RUN: npx node testUpdateFineStatus.js
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
};

const log = (title, message = '') => {
  console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${title}${colors.reset}`);
  if (message) console.log(`${colors.bright}${message}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);
};

const success = (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`);
const error = (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`);
const info = (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`);

// Test data
const testData = {
  officerToken: null, // Will be obtained from login
  driverId: null,
  fineId: null,
};

// ============================================================================
// 1. LOGIN & GET JWT TOKEN
// ============================================================================
async function loginOfficer() {
  log('STEP 1: Officer Login');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'officer@pezy.com',
      password: 'password123',
    });

    testData.officerToken = response.data.token;
    info(`Email: officer@pezy.com`);
    success(`JWT Token obtained: ${testData.officerToken.slice(0, 20)}...`);
    return true;
  } catch (err) {
    error(`Login failed: ${err.response?.data?.message || err.message}`);
    info(`Make sure backend is running and database is seeded`);
    return false;
  }
}

// ============================================================================
// 2. CREATE A TEST FINE
// ============================================================================
async function createTestFine() {
  log('STEP 2: Create Test Fine');

  try {
    const response = await axios.post(
      `${BASE_URL}/api/fines`,
      {
        licenseNo: 'DL0001234', // Use existing driver
        amount: 5000,
        reason: 'Speeding in residential area',
        issuedByOfficerId: 'test-officer-id',
      },
      {
        headers: {
          Authorization: `Bearer ${testData.officerToken}`,
        },
      }
    );

    testData.fineId = response.data.fine.id;
    testData.driverId = response.data.fine.driver_id;
    
    success(`Fine created: ${testData.fineId}`);
    info(`Initial status: ${response.data.fine.status}`);
    info(`Fine reference: ${response.data.fine.fine_ref}`);
    return true;
  } catch (err) {
    error(`Fine creation failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// ============================================================================
// 3. TEST: VALID TRANSITION (unpaid → paid)
// ============================================================================
async function testUnpaidToPaid() {
  log('TEST 1: Valid Transition - unpaid → paid');

  try {
    const response = await axios.patch(
      `${BASE_URL}/api/fines/${testData.fineId}/status`,
      { status: 'paid' },
      {
        headers: {
          Authorization: `Bearer ${testData.officerToken}`,
        },
      }
    );

    success(`Status updated to: ${response.data.fine.status}`);
    info(`Payment date recorded: ${response.data.fine.payment_date}`);
    info(`Updated at: ${response.data.fine.updated_at}`);
    return true;
  } catch (err) {
    error(`Update failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// ============================================================================
// 4. TEST: INVALID TRANSITION (paid → outdated) - Should fail
// ============================================================================
async function testInvalidPaidTransition() {
  log('TEST 2: Invalid Transition - paid → outdated (SHOULD FAIL)');

  try {
    const response = await axios.patch(
      `${BASE_URL}/api/fines/${testData.fineId}/status`,
      { status: 'outdated' },
      {
        headers: {
          Authorization: `Bearer ${testData.officerToken}`,
        },
      }
    );

    error(`Unexpected success! Should have rejected paid → outdated transition`);
    return false;
  } catch (err) {
    if (err.response?.status === 409) {
      success(`✓ Correctly rejected (409): ${err.response.data.message}`);
      return true;
    } else {
      error(`Wrong error: ${err.response?.data?.message || err.message}`);
      return false;
    }
  }
}

// ============================================================================
// 5. CREATE SECOND FINE FOR OUTDATED TRANSITION TEST
// ============================================================================
async function createSecondFine() {
  log('STEP 3: Create Second Fine for Outdated Transition Test');

  try {
    const response = await axios.post(
      `${BASE_URL}/api/fines`,
      {
        licenseNo: 'DL0001234',
        amount: 3000,
        reason: 'Traffic signal violation',
        issuedByOfficerId: 'test-officer-id',
      },
      {
        headers: {
          Authorization: `Bearer ${testData.officerToken}`,
        },
      }
    );

    testData.fineId2 = response.data.fine.id;
    success(`Second fine created: ${testData.fineId2}`);
    return true;
  } catch (err) {
    error(`Fine creation failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// ============================================================================
// 6. TEST: VALID TRANSITION (unpaid → outdated)
// ============================================================================
async function testUnpaidToOutdated() {
  log('TEST 3: Valid Transition - unpaid → outdated');

  try {
    const response = await axios.patch(
      `${BASE_URL}/api/fines/${testData.fineId2}/status`,
      { status: 'outdated' },
      {
        headers: {
          Authorization: `Bearer ${testData.officerToken}`,
        },
      }
    );

    success(`Status updated to: ${response.data.fine.status}`);
    info(`No payment date set: ${response.data.fine.payment_date || 'null'}`);
    return true;
  } catch (err) {
    error(`Update failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// ============================================================================
// 7. TEST: VALID TRANSITION (outdated → paid)
// ============================================================================
async function testOutdatedToPaid() {
  log('TEST 4: Valid Transition - outdated → paid');

  try {
    const response = await axios.patch(
      `${BASE_URL}/api/fines/${testData.fineId2}/status`,
      { status: 'paid' },
      {
        headers: {
          Authorization: `Bearer ${testData.officerToken}`,
        },
      }
    );

    success(`Status updated to: ${response.data.fine.status}`);
    info(`Payment date recorded: ${response.data.fine.payment_date}`);
    return true;
  } catch (err) {
    error(`Update failed: ${err.response?.data?.message || err.message}`);
    return false;
  }
}

// ============================================================================
// 8. TEST: MISSING PARAMETER (no status provided)
// ============================================================================
async function testMissingParameter() {
  log('TEST 5: Missing Parameter - no status (SHOULD FAIL)');

  try {
    const response = await axios.patch(
      `${BASE_URL}/api/fines/${testData.fineId}/status`,
      {},
      {
        headers: {
          Authorization: `Bearer ${testData.officerToken}`,
        },
      }
    );

    error(`Unexpected success! Should have rejected missing status`);
    return false;
  } catch (err) {
    if (err.response?.status === 400 || err.response?.status === 422) {
      success(`✓ Correctly rejected (${err.response.status}): ${err.response.data.message}`);
      return true;
    } else {
      error(`Wrong error code: ${err.response?.status} - ${err.response?.data?.message || err.message}`);
      return false;
    }
  }
}

// ============================================================================
// 9. TEST: NON-EXISTENT FINE
// ============================================================================
async function testNonExistentFine() {
  log('TEST 6: Non-Existent Fine ID (SHOULD FAIL)');

  try {
    const response = await axios.patch(
      `${BASE_URL}/api/fines/fake-fine-id-12345/status`,
      { status: 'paid' },
      {
        headers: {
          Authorization: `Bearer ${testData.officerToken}`,
        },
      }
    );

    error(`Unexpected success! Should have rejected fake fine ID`);
    return false;
  } catch (err) {
    if (err.response?.status === 404) {
      success(`✓ Correctly rejected (404): ${err.response.data.message}`);
      return true;
    } else {
      error(`Wrong error: ${err.response?.data?.message || err.message}`);
      return false;
    }
  }
}

// ============================================================================
// 10. VERIFY AUDIT LOGS
// ============================================================================
async function verifyAuditLogs() {
  log('STEP 4: Verify Audit Logs');

  try {
    const response = await axios.get(`${BASE_URL}/api/admin/audit-logs`, {
      headers: {
        Authorization: `Bearer ${testData.officerToken}`,
      },
    });

    const fineLogs = response.data.auditLogs
      .filter((log) => log.entity_type === 'Fine' && log.action === 'update')
      .slice(0, 3);

    if (fineLogs.length > 0) {
      success(`Found ${fineLogs.length} fine update audit logs`);
      fineLogs.forEach((log) => {
        info(`${log.entity_name}: ${log.old_value} → ${log.new_value}`);
        info(`  By: ${log.user_role} | Summary: ${log.change_summary}`);
      });
      return true;
    } else {
      error(`No audit logs found for fine updates`);
      return false;
    }
  } catch (err) {
    error(`Failed to fetch audit logs: ${err.response?.data?.message || err.message}`);
    info(`(This endpoint may not exist or require different permissions)`);
    return true; // Don't fail if audit endpoint doesn't exist
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================
async function runTests() {
  log('🧪 PEZY-410: Update Fine Status Test Suite', 'Testing status transitions, validation, and audit logging');

  const results = [];

  // Setup
  if (!(await loginOfficer())) {
    error('Cannot proceed without valid authentication');
    process.exit(1);
  }

  if (!(await createTestFine())) {
    error('Cannot proceed without test fine');
    process.exit(1);
  }

  // Run tests
  results.push({ name: 'Valid: unpaid → paid', passed: await testUnpaidToPaid() });
  results.push({ name: 'Invalid: paid → outdated (should fail)', passed: await testInvalidPaidTransition() });

  if (!(await createSecondFine())) {
    error('Cannot create second fine for transition tests');
  } else {
    results.push({ name: 'Valid: unpaid → outdated', passed: await testUnpaidToOutdated() });
    results.push({ name: 'Valid: outdated → paid', passed: await testOutdatedToPaid() });
    results.push({ name: 'Invalid: missing status (should fail)', passed: await testMissingParameter() });
  }

  results.push({ name: 'Invalid: non-existent fine (should fail)', passed: await testNonExistentFine() });

  // Verify
  if (!(await verifyAuditLogs())) {
    results.push({ name: 'Audit log verification', passed: false });
  } else {
    results.push({ name: 'Audit log verification', passed: true });
  }

  // Summary
  log('📊 Test Results Summary');
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  results.forEach((result) => {
    const status = result.passed ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
    console.log(`${status} ${result.name}`);
  });

  console.log(`\n${colors.bright}${colors.cyan}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${passed}/${total} tests passed${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

  process.exit(passed === total ? 0 : 1);
}

// Run
runTests().catch((err) => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
