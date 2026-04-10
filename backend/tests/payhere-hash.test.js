/**
 * PayHere Hash Function Unit Tests
 * Quick standalone verification without needing backend running
 * 
 * Run with: node tests/payhere.test.js OR npm run test:payhere
 */

import crypto from 'crypto';

// ============================================================================
// PAYHERE HASH GENERATOR (Inline for standalone testing)
// ============================================================================

/**
 * Calculate PayHere MD5 hash
 * Formula: MD5(merchant_id + order_id + amount + currency + MD5(secret).toUpperCase()).toUpperCase()
 */
function calculatePayHereHash(merchantId, merchantSecret, orderId, amount, currency) {
  // Step 1: MD5 hash of merchant secret
  const hashedSecret = crypto
    .createHash('md5')
    .update(merchantSecret)
    .digest('hex')
    .toUpperCase();

  // Step 2: Format amount to 2 decimal places
  const amountFormatted = parseFloat(amount).toFixed(2);

  // Step 3: Create hash input string
  const hashInput = `${merchantId}${orderId}${amountFormatted}${currency}${hashedSecret}`;

  // Step 4: Generate final MD5 hash
  const hash = crypto
    .createHash('md5')
    .update(hashInput)
    .digest('hex')
    .toUpperCase();

  return {
    hash,
    debug: {
      merchantId,
      orderId,
      amountFormatted,
      currency,
      hashedSecret,
      hashInput,
    },
  };
}

// ============================================================================
// TEST UTILITIES
// ============================================================================

const COLORS = {
  RESET: '\x1b[0m',
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  YELLOW: '\x1b[33m',
  CYAN: '\x1b[36m',
  GRAY: '\x1b[90m',
};

function log(message, color = 'RESET') {
  const prefix = {
    success: '✓',
    error: '✗',
    test: '→',
    info: 'ℹ',
    separator: '─',
  };

  const colorCode = COLORS[color] || '';
  console.log(`${colorCode}${message}${COLORS.RESET}`);
}

// ============================================================================
// TEST CASES
// ============================================================================

const MERCHANT_ID = 'TESTMERCHANT123';
const MERCHANT_SECRET = 'TESTSECRET123';

// Known test vectors (calculate expected output)
const TEST_VECTORS = [
  {
    name: 'Simple 1000 LKR payment',
    orderId: 'PEZY-001',
    amount: 1000,
    currency: 'LKR',
  },
  {
    name: 'Decimal amount 2500.50',
    orderId: 'PEZY-1712345678901-ABC123',
    amount: '2500.50',
    currency: 'LKR',
  },
  {
    name: 'Large amount 50000',
    orderId: 'PEZY-1712345678902-DEF456',
    amount: 50000,
    currency: 'LKR',
  },
  {
    name: 'Small amount with decimals 0.99',
    orderId: 'PEZY-1712345678903-GHI789',
    amount: 0.99,
    currency: 'LKR',
  },
  {
    name: 'USD currency test',
    orderId: 'PEZY-1712345678904-JKL012',
    amount: 100,
    currency: 'USD',
  },
];

// ============================================================================
// TEST: Hash Consistency
// ============================================================================

function testHashConsistency() {
  console.log('\n' + '═'.repeat(70));
  console.log('TEST 1: Hash Consistency (Same input must always produce same hash)');
  console.log('═'.repeat(70) + '\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_VECTORS) {
    log(`Testing: ${testCase.name}`, 'YELLOW');

    try {
      // Generate hash 3 times
      const result1 = calculatePayHereHash(
        MERCHANT_ID,
        MERCHANT_SECRET,
        testCase.orderId,
        testCase.amount,
        testCase.currency
      );

      const result2 = calculatePayHereHash(
        MERCHANT_ID,
        MERCHANT_SECRET,
        testCase.orderId,
        testCase.amount,
        testCase.currency
      );

      const result3 = calculatePayHereHash(
        MERCHANT_ID,
        MERCHANT_SECRET,
        testCase.orderId,
        testCase.amount,
        testCase.currency
      );

      // Check all three match
      if (result1.hash === result2.hash && result2.hash === result3.hash) {
        log(`✓ PASS: Hash is consistent`, 'GREEN');
        log(`  Hash: ${result1.hash}\n`, 'GRAY');
        passed++;
      } else {
        log(`✗ FAIL: Hash mismatch detected!`, 'RED');
        log(`  Hash 1: ${result1.hash}`, 'RED');
        log(`  Hash 2: ${result2.hash}`, 'RED');
        log(`  Hash 3: ${result3.hash}\n`, 'RED');
        failed++;
      }
    } catch (error) {
      log(`✗ FAIL: ${error.message}\n`, 'RED');
      failed++;
    }
  }

  console.log(`Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

// ============================================================================
// TEST: Hash Format
// ============================================================================

function testHashFormat() {
  console.log('\n' + '═'.repeat(70));
  console.log('TEST 2: Hash Format (Must be valid MD5 - 32 uppercase hex chars)');
  console.log('═'.repeat(70) + '\n');

  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_VECTORS) {
    log(`Testing: ${testCase.name}`, 'YELLOW');

    try {
      const result = calculatePayHereHash(
        MERCHANT_ID,
        MERCHANT_SECRET,
        testCase.orderId,
        testCase.amount,
        testCase.currency
      );

      const hash = result.hash;

      // Check: 32 characters
      if (hash.length !== 32) {
        log(`✗ FAIL: Wrong length ${hash.length} (expected 32)\n`, 'RED');
        failed++;
        continue;
      }

      // Check: Only hex characters
      if (!/^[A-F0-9]{32}$/.test(hash)) {
        log(`✗ FAIL: Contains non-hex characters or lowercase\n`, 'RED');
        failed++;
        continue;
      }

      // Check: Is uppercase
      if (hash !== hash.toUpperCase()) {
        log(`✗ FAIL: Contains lowercase letters\n`, 'RED');
        failed++;
        continue;
      }

      log(`✓ PASS: Valid MD5 format`, 'GREEN');
      log(`  Length: ${hash.length}, Format: [A-F0-9]+, Case: UPPERCASE\n`, 'GRAY');
      passed++;
    } catch (error) {
      log(`✗ FAIL: ${error.message}\n`, 'RED');
      failed++;
    }
  }

  console.log(`Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

// ============================================================================
// TEST: Amount Formatting
// ============================================================================

function testAmountFormatting() {
  console.log('\n' + '═'.repeat(70));
  console.log('TEST 3: Amount Formatting (Must format to 2 decimal places)');
  console.log('═'.repeat(70) + '\n');

  const testCases = [
    { input: 1000, expected: '1000.00' },
    { input: '1000', expected: '1000.00' },
    { input: 1000.5, expected: '1000.50' },
    { input: '1000.5', expected: '1000.50' },
    { input: 1000.999, expected: '1001.00' }, // Rounding
    { input: 0.1, expected: '0.10' },
    { input: '0.1', expected: '0.10' },
    { input: 99.99, expected: '99.99' },
  ];

  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    log(`Format ${testCase.input} → ${testCase.expected}`, 'YELLOW');

    const formatted = parseFloat(testCase.input).toFixed(2);

    if (formatted === testCase.expected) {
      log(`✓ PASS: ${formatted}\n`, 'GREEN');
      passed++;
    } else {
      log(`✗ FAIL: Got ${formatted}, expected ${testCase.expected}\n`, 'RED');
      failed++;
    }
  }

  console.log(`Results: ${passed} passed, ${failed} failed\n`);
  return failed === 0;
}

// ============================================================================
// TEST: Known Vector (Manual Calculation)
// ============================================================================

function testManualCalculation() {
  console.log('\n' + '═'.repeat(70));
  console.log('TEST 4: Manual MD5 Calculation (Verify step-by-step process)');
  console.log('═'.repeat(70) + '\n');

  const orderId = 'PEZY-TEST-12345';
  const amount = 5000;
  const currency = 'LKR';

  log('Manual step-by-step calculation:', 'CYAN');
  log(`Merchant ID: ${MERCHANT_ID}`);
  log(`Merchant Secret: ${MERCHANT_SECRET}`);
  log(`Order ID: ${orderId}`);
  log(`Amount: ${amount}`);
  log(`Currency: ${currency}\n`);

  // Step 1: Hash merchant secret
  const step1Secret = crypto
    .createHash('md5')
    .update(MERCHANT_SECRET)
    .digest('hex')
    .toUpperCase();
  log(`Step 1 - MD5(${MERCHANT_SECRET}) = ${step1Secret}`, 'GRAY');

  // Step 2: Format amount
  const step2Amount = parseFloat(amount).toFixed(2);
  log(`Step 2 - Format amount: ${step2Amount}`, 'GRAY');

  // Step 3: Create input string
  const step3Input = `${MERCHANT_ID}${orderId}${step2Amount}${currency}${step1Secret}`;
  log(`Step 3 - Input string: ${step3Input}`, 'GRAY');

  // Step 4: Final hash
  const step4Hash = crypto
    .createHash('md5')
    .update(step3Input)
    .digest('hex')
    .toUpperCase();
  log(`Step 4 - Final hash: ${step4Hash}\n`, 'GRAY');

  // Compare with function
  const result = calculatePayHereHash(MERCHANT_ID, MERCHANT_SECRET, orderId, amount, currency);

  if (result.hash === step4Hash) {
    log(`✓ PASS: Manual calculation matches function output\n`, 'GREEN');
    return true;
  } else {
    log(`✗ FAIL: Mismatch!`, 'RED');
    log(`  Manual:   ${step4Hash}`, 'RED');
    log(`  Function: ${result.hash}\n`, 'RED');
    return false;
  }
}

// ============================================================================
// TEST: Different Amounts Same Order
// ============================================================================

function testDifferentAmounts() {
  console.log('\n' + '═'.repeat(70));
  console.log('TEST 5: Different Amounts Produce Different Hashes');
  console.log('═'.repeat(70) + '\n');

  const orderId = 'PEZY-SAME-ORDER';
  const currency = 'LKR';
  const amounts = [1000, 2000, 5000, 10000];

  const hashes = [];
  let passed = 0;
  let failed = 0;

  for (const amount of amounts) {
    const result = calculatePayHereHash(
      MERCHANT_ID,
      MERCHANT_SECRET,
      orderId,
      amount,
      currency
    );
    hashes.push(result.hash);
    log(`Amount ${amount}: ${result.hash}`);
  }

  // Check all hashes are unique
  const uniqueHashes = new Set(hashes);

  if (uniqueHashes.size === hashes.length) {
    log(`\n✓ PASS: All amounts produced unique hashes\n`, 'GREEN');
    passed++;
  } else {
    log(
      `\n✗ FAIL: Duplicate hashes found! ${hashes.length} amounts produced ${uniqueHashes.size} unique hashes\n`,
      'RED'
    );
    failed++;
  }

  return failed === 0;
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

function runAllTests() {
  console.clear();
  console.log('═'.repeat(70));
  console.log('PayHere MD5 Hash Function - Unit Test Suite');
  console.log('═'.repeat(70));

  const results = {
    test1: testHashConsistency(),
    test2: testHashFormat(),
    test3: testAmountFormatting(),
    test4: testManualCalculation(),
    test5: testDifferentAmounts(),
  };

  // Final summary
  console.log('═'.repeat(70));
  console.log('FINAL SUMMARY');
  console.log('═'.repeat(70) + '\n');

  const testNames = [
    'Hash Consistency',
    'Hash Format',
    'Amount Formatting',
    'Manual Calculation',
    'Different Amounts',
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  Object.keys(results).forEach((key, index) => {
    const status = results[key] ? '✓' : '✗';
    const color = results[key] ? 'GREEN' : 'RED';
    log(`${status} ${testNames[index]}`, color);
    if (results[key]) totalPassed++;
    else totalFailed++;
  });

  console.log('\n' + '─'.repeat(70));
  log(`Total Passed: ${totalPassed}/5`, totalPassed === 5 ? 'GREEN' : 'YELLOW');
  log(`Total Failed: ${totalFailed}/5`, totalFailed === 0 ? 'GREEN' : 'RED');
  console.log('─'.repeat(70) + '\n');

  if (totalFailed === 0) {
    log('All tests passed! ✨\n', 'GREEN');
    process.exit(0);
  } else {
    log('Some tests failed. Please review the output above.\n', 'RED');
    process.exit(1);
  }
}

// Run tests
runAllTests();
