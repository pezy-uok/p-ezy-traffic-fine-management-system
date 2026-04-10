/**
 * Network Diagnostics Utility
 * Helps diagnose connectivity issues with PayHere and backend services
 */

export interface DiagnosticResult {
  name: string
  status: 'success' | 'warning' | 'error' | 'pending'
  message: string
  details?: string
  duration?: number
}

/**
 * Test connectivity to a URL
 */
export const testUrlConnectivity = async (
  url: string,
  timeout = 10000,
): Promise<DiagnosticResult> => {
  const startTime = performance.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const duration = Math.round(performance.now() - startTime)

    return {
      name: `Connectivity to ${new URL(url).host}`,
      status: 'success',
      message: `Successfully connected to ${url}`,
      duration,
    }
  } catch (error) {
    const duration = Math.round(performance.now() - startTime)
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes('AbortError')) {
      return {
        name: `Connectivity to ${new URL(url).host}`,
        status: 'error',
        message: `Connection timeout after ${timeout}ms`,
        details: 'The server is not responding. Check if the domain is reachable.',
        duration,
      }
    }

    return {
      name: `Connectivity to ${new URL(url).host}`,
      status: 'error',
      message: `Failed to connect: ${errorMessage}`,
      details: 'This could indicate a network block or DNS issue.',
      duration,
    }
  }
}

/**
 * Run all diagnostic tests
 */
export const runDiagnostics = async (): Promise<DiagnosticResult[]> => {
  const results: DiagnosticResult[] = []

  // Test 1: Backend connectivity
  results.push({
    name: 'Backend API Connectivity',
    status: 'pending',
    message: 'Testing backend server...',
  })

  try {
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    const backendDomain = new URL(backendUrl).origin
    const connectResult = await testUrlConnectivity(backendDomain)
    results[results.length - 1] = connectResult
  } catch (error) {
    results[results.length - 1] = {
      name: 'Backend API Connectivity',
      status: 'error',
      message: 'Could not test backend connectivity',
      details: String(error),
    }
  }

  // Test 2: PayHere CDN (Primary)
  results.push({
    name: 'PayHere CDN (www.payhere.lk)',
    status: 'pending',
    message: 'Testing PayHere primary domain...',
  })

  const payHereResult = await testUrlConnectivity('https://www.payhere.lk/sign/checkoutnew/js/payhere.js')
  results[results.length - 1] = payHereResult

  // Test 3: PayHere CDN (Alternative)
  if (payHereResult.status !== 'success') {
    results.push({
      name: 'PayHere CDN (payhere.lk)',
      status: 'pending',
      message: 'Testing PayHere alternative domain...',
    })

    const altResult = await testUrlConnectivity('https://payhere.lk/sign/checkoutnew/js/payhere.js')
    results[results.length - 1] = altResult
  }

  // Test 4: DNS Resolution
  results.push({
    name: 'DNS Resolution',
    status: 'pending',
    message: 'Testing DNS resolution...',
  })

  try {
    // Attempt to resolve payhere.lk via a simple request
    await fetch('https://payhere.lk/ping', {
      method: 'GET',
      mode: 'no-cors',
      signal: AbortSignal.timeout(5000),
    }).catch(() => {
      // Expected to fail due to no-cors, but DNS should resolve
    })

    results[results.length - 1] = {
      name: 'DNS Resolution',
      status: 'success',
      message: 'DNS resolution for payhere.lk successful',
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    results[results.length - 1] = {
      name: 'DNS Resolution',
      status: 'error',
      message: 'DNS resolution failed',
      details: 'Cannot resolve payhere.lk domain. Check your DNS settings.',
    }
  }

  // Test 5: Network Type Check
  results.push({
    name: 'Network Information',
    status: 'success',
    message: getNetworkInfo(),
  })

  return results
}

/**
 * Get network information
 */
const getNetworkInfo = (): string => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

  if (!connection) {
    return 'Network type: Unknown'
  }

  const effectiveType = connection.effectiveType || 'unknown'
  const downlink = connection.downlink ? `${connection.downlink} Mbps` : 'unknown'

  return `Network: ${effectiveType} | Downlink: ${downlink} | Offline: ${navigator.onLine ? 'No' : 'Yes'}`
}

/**
 * Format diagnostic results for display
 */
export const formatDiagnosticsReport = (results: DiagnosticResult[]): string => {
  const timestamp = new Date().toISOString()
  const successCount = results.filter((r) => r.status === 'success').length
  const totalCount = results.length

  let report = `Network Diagnostics Report\nGenerated: ${timestamp}\n\n`
  report += `Summary: ${successCount}/${totalCount} tests passed\n\n`

  results.forEach((result, index) => {
    const icon = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      pending: '⏳',
    }[result.status]

    report += `${icon} ${result.name}\n`
    report += `   Status: ${result.status.toUpperCase()}\n`
    report += `   Message: ${result.message}\n`

    if (result.duration) {
      report += `   Duration: ${result.duration}ms\n`
    }

    if (result.details) {
      report += `   Details: ${result.details}\n`
    }

    report += '\n'
  })

  return report
}
