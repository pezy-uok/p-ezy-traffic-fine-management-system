/**
 * PayHere Payment Gateway Utility
 * Handles PayHere SDK loading and payment initialization
 */

declare global {
  interface Window {
    payhere?: {
      startPayment: (params: any) => void
      onCompleted: (paymentId: string) => void
      onDismissed: () => void
      onError: (error: string) => void
    }
  }
}

const PAYHERE_SCRIPT_URLS = [
  'https://www.payhere.lk/sign/checkoutnew/js/payhere.js',
  'https://payhere.lk/sign/checkoutnew/js/payhere.js',
  'https://checkout.payhere.lk/payhere-checkout-staging.js',
]

/**
 * Test if a URL is accessible
 */
const testUrlAccessibility = (url: string, timeout = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve(false)
    }, timeout)

    fetch(url, { method: 'HEAD', mode: 'no-cors' })
      .then(() => {
        clearTimeout(timer)
        resolve(true)
      })
      .catch(() => {
        clearTimeout(timer)
        resolve(false)
      })
  })
}

/**
 * Load PayHere JS SDK from CDN with retry logic
 */
export const loadPayHereScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Check if PayHere is already loaded
    if (window.payhere) {
      console.log('✅ PayHere already loaded')
      resolve()
      return
    }

    console.log('🔵 Starting PayHere script load with CDN URLs:', PAYHERE_SCRIPT_URLS)

    let scriptIndex = 0
    let lastError = ''

    const tryLoadScript = async () => {
      if (scriptIndex >= PAYHERE_SCRIPT_URLS.length) {
        console.error('❌ Failed to load PayHere from all CDN URLs')
        console.error('ℹ️ Last error:', lastError)
        console.error('💡 Possible causes:')
        console.error('   - Network/firewall blocking payhere.lk domain')
        console.error('   - PayHere service temporarily unavailable')
        console.error('   - DNS resolution issues')
        reject(
          new Error(
            'Failed to load PayHere payment gateway. Please ensure:\n' +
              '1. Your internet connection is active\n' +
              '2. payhere.lk domain is not blocked by firewall\n' +
              '3. Try again in a few moments',
          ),
        )
        return
      }

      const url = PAYHERE_SCRIPT_URLS[scriptIndex]
      console.log(`🔵 Attempt ${scriptIndex + 1}/${PAYHERE_SCRIPT_URLS.length}: Loading from ${url}`)

      try {
        // First test if URL is accessible
        console.log(`   Testing URL accessibility...`)
        const isAccessible = await testUrlAccessibility(url, 5000)

        if (!isAccessible) {
          console.warn(`   ⚠️ URL not accessible from this network`)
          lastError = `URL not accessible: ${url}`
          scriptIndex++
          tryLoadScript()
          return
        }

        console.log(`   ✓ URL is accessible, loading script...`)

        const script = document.createElement('script')
        script.src = url
        script.async = true
        script.type = 'text/javascript'

        const timeout = setTimeout(() => {
          console.warn(`⚠️ PayHere script timeout from ${url}`)
          script.remove()
          lastError = `Timeout loading from ${url}`
          scriptIndex++
          tryLoadScript()
        }, 10000)

        script.onload = () => {
          clearTimeout(timeout)
          console.log(`✅ PayHere script loaded successfully from: ${url}`)

          // Give the script time to initialize
          setTimeout(() => {
            if (window.payhere) {
              console.log('✅ PayHere object is available and ready')
              resolve()
            } else {
              console.warn('⚠️ PayHere object not available after load, trying next URL')
              lastError = `PayHere object not initialized after loading from ${url}`
              script.remove()
              scriptIndex++
              tryLoadScript()
            }
          }, 500)
        }

        script.onerror = (error) => {
          clearTimeout(timeout)
          console.warn(`⚠️ Failed to load PayHere script from ${url}`)
          console.warn(`   Error:`, error)
          lastError = `Script load error from ${url}: ${error}`
          script.remove()
          scriptIndex++
          tryLoadScript()
        }

        document.head.appendChild(script)
      } catch (error) {
        console.error(`❌ Error during script load attempt:`, error)
        lastError = String(error)
        scriptIndex++
        tryLoadScript()
      }
    }

    tryLoadScript()
  })
}

/**
 * Start PayHere payment
 */
export const startPayHerePayment = async (
  checkoutParams: any,
  onCompleted?: (paymentId: string) => void,
  onDismissed?: () => void,
  onError?: (error: string) => void,
): Promise<void> => {
  try {
    console.log('🔵 Loading PayHere SDK...')

    // Attempt to load PayHere script with retries
    try {
      await loadPayHereScript()
    } catch (scriptError) {
      console.error('❌ PayHere script loading failed:', scriptError)
      throw scriptError
    }

    if (!window.payhere) {
      throw new Error('PayHere SDK initialization failed. Please refresh and try again.')
    }

    console.log('✅ PayHere SDK loaded successfully')
    console.log('🔵 Setting up payment callbacks...')

    // Set up callbacks
    window.payhere.onCompleted = (paymentId: string) => {
      console.log('✅ Payment completed with ID:', paymentId)
      onCompleted?.(paymentId)
    }

    window.payhere.onDismissed = () => {
      console.log('⚠️ Payment modal dismissed by user')
      onDismissed?.()
    }

    window.payhere.onError = (error: string) => {
      console.error('❌ Payment error:', error)
      onError?.(error)
    }

    console.log('✅ Callbacks configured')
    console.log('🔵 Starting payment with params:', checkoutParams)

    // Start payment
    window.payhere.startPayment(checkoutParams)
    console.log('✅ PayHere payment modal opened')
  } catch (error) {
    console.error('❌ PayHere payment error:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new Error(errorMessage)
  }
}

/**
 * Get PayHere payment status
 * Can be used to check if payment is still pending
 */
export const getPaymentStatus = async (
  orderId: string,
): Promise<{ status: string; transactionId?: string }> => {
  try {
    console.log('🔵 Checking payment status for order:', orderId)
    // This would call your backend endpoint
    // const response = await paymentAPI.getPaymentStatus(orderId)
    // return response.data.data
    return { status: 'pending' }
  } catch (error) {
    console.error('❌ Error checking payment status:', error)
    throw error
  }
}

export default {
  loadPayHereScript,
  startPayHerePayment,
  getPaymentStatus,
}
