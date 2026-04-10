/**
 * Test Payment Flow Utility
 * Quick testing of the entire payment integration
 * Usage: Open browser console and run testPaymentFlow()
 */

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: any
}

const results: TestResult[] = []

const log = (name: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any) => {
  results.push({ name, status, message, details })
  const emoji = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️'
  console.log(`${emoji} ${name}: ${message}`, details || '')
}

/**
 * Test 1: Backend Connection
 */
const testBackendConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8000/api/health')
    if (response.ok) {
      log('Backend Connection', 'pass', 'Backend is running on port 8000')
      return true
    } else {
      log('Backend Connection', 'fail', `Backend returned status ${response.status}`)
      return false
    }
  } catch (error) {
    log('Backend Connection', 'fail', 'Cannot connect to backend', error)
    return false
  }
}

/**
 * Test 2: Database Connection
 */
const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8000/api/health/supabase', {
      method: 'GET',
    })
    const data = await response.json()
    if (response.ok) {
      log('Database Connection', 'pass', 'Supabase connection is working', data)
      return true
    } else {
      log('Database Connection', 'fail', `Database connection failed: ${data.message || 'Unknown error'}`)
      return false
    }
  } catch (error) {
    log('Database Connection', 'fail', 'Cannot test database connection', error)
    return false
  }
}

/**
 * Test 3: Test Data for Driver B7283912
 */
const testDriverData = async (): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8000/api/public-fines/driver/B7283912', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()

    if (response.ok && data.success) {
      if (data.fines && data.fines.length > 0) {
        log(
          'Test Data (B7283912)',
          'pass',
          `Found ${data.fines.length} fine(s) for driver ${data.driver.driver_name}`,
          data,
        )
        return true
      } else {
        log(
          'Test Data (B7283912)',
          'warning',
          'Driver found but no fines returned - database may need seeding',
          data,
        )
        return false
      }
    } else {
      log('Test Data (B7283912)', 'fail', data.message || 'Failed to fetch driver fines', data)
      return false
    }
  } catch (error) {
    log('Test Data (B7283912)', 'fail', 'Cannot fetch driver fines', error)
    return false
  }
}

/**
 * Test 4: Multiple License Numbers
 */
const testMultipleLicenses = async (): Promise<boolean> => {
  const licenses = ['B1234567', 'B1234568', 'B1234569']
  let found = false

  for (const license of licenses) {
    try {
      const response = await fetch(`http://localhost:8000/api/public-fines/driver/${license}`)
      const data = await response.json()

      if (response.ok && data.success && data.fines && data.fines.length > 0) {
        log(
          `Test License ${license}`,
          'pass',
          `Found ${data.fines.length} fine(s)`,
          `${data.driver.driver_name}`,
        )
        found = true
      }
    } catch (error) {
      // Silently skip failed requests
    }
  }

  if (!found) {
    log('Multiple License Test', 'warning', 'No fines found for any test licenses - database may need seeding')
  }

  return found
}

/**
 * Test 5: Payment Initiation API
 */
const testPaymentInitiation = async (): Promise<boolean> => {
  try {
    // First get a fine ID
    const finesResponse = await fetch('http://localhost:8000/api/public-fines/driver/B7283912')
    const finesData = await finesResponse.json()

    if (!finesData.success || !finesData.fines || finesData.fines.length === 0) {
      log('Payment Initiation', 'warning', 'No fines available to test payment initiation')
      return false
    }

    const fineIds = [finesData.fines[0].id]

    const response = await fetch('http://localhost:8000/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fineIds,
        licenseNo: 'B7283912',
      }),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      log('Payment Initiation', 'pass', 'Payment initiation endpoint is working', { orderId: data.orderId })
      return true
    } else {
      log('Payment Initiation', 'fail', data.message || 'Payment initiation failed', data)
      return false
    }
  } catch (error) {
    log('Payment Initiation', 'fail', 'Cannot test payment initiation', error)
    return false
  }
}

/**
 * Test 6: PayHere CDN Accessibility
 */
const testPayHereCDN = async (): Promise<boolean> => {
  const cdnUrls = [
    'https://www.payhere.lk/pay/payment.js',
    'https://payhere.lk/pay/payment.js',
    'https://checkout.payhere.lk/pay/payment.js',
  ]

  let accessible = false

  for (const url of cdnUrls) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok || response.status === 200) {
        log(`PayHere CDN (${url.split('/')[2]})`, 'pass', 'CDN is accessible')
        accessible = true
        break
      }
    } catch (error) {
      // Try next CDN
    }
  }

  if (!accessible) {
    log('PayHere CDN', 'fail', 'None of the PayHere CDN URLs are accessible', {
      possibleCauses: ['Network/firewall blocking', 'VPN enabled', 'DNS issues'],
    })
  }

  return accessible
}

/**
 * Run All Tests
 */
export const testPaymentFlow = async () => {
  console.clear()
  console.log('🧪 PEZY Payment Integration Test Suite')
  console.log('=====================================\n')

  results.length = 0

  console.log('Running tests...\n')

  // Run tests sequentially
  await testBackendConnection()
  await testDatabaseConnection()
  await testDriverData()
  await testMultipleLicenses()
  await testPaymentInitiation()
  await testPayHereCDN()

  // Summary
  console.log('\n====================================')
  console.log('📊 TEST SUMMARY')
  console.log('====================================\n')

  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const warnings = results.filter(r => r.status === 'warning').length

  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  console.log(`⚠️  Warnings: ${warnings}`)
  console.log(`📝 Total: ${results.length}\n`)

  // Recommendations
  if (failed > 0) {
    console.log('🔧 RECOMMENDATIONS:')
    console.log('--------------------')

    if (results.some(r => r.name === 'Backend Connection' && r.status === 'fail')) {
      console.log('1. Start backend: cd backend && npm run dev')
    }

    if (results.some(r => r.name === 'Database Connection' && r.status === 'fail')) {
      console.log('2. Check Supabase connection in backend/.env')
      console.log('   - Verify SUPABASE_URL is correct')
      console.log('   - Verify SUPABASE_SERVICE_ROLE_KEY is set')
    }

    if (
      results.some(
        r => (r.name.includes('Test Data') || r.name.includes('Multiple License')) && r.status === 'warning',
      )
    ) {
      console.log('3. Seed database: cd backend && npm run seed')
    }

    if (results.some(r => r.name === 'PayHere CDN' && r.status === 'fail')) {
      console.log('4. PayHere CDN not accessible:')
      console.log('   - Check your internet connection')
      console.log('   - Disable VPN if enabled')
      console.log('   - Check firewall/network settings')
    }
  } else if (warnings > 0) {
    console.log('💡 SUGGESTIONS:')
    console.log('---------------')
    console.log('Run: cd backend && npm run seed')
    console.log('This will populate the database with test data')
  } else {
    console.log('✨ All tests passed! Your payment integration is ready.')
  }

  console.log('\n📋 Detailed Results:')
  console.table(
    results.map(r => ({
      Test: r.name,
      Status: r.status.toUpperCase(),
      Message: r.message,
    })),
  )

  return results
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testPaymentFlow = testPaymentFlow
}
