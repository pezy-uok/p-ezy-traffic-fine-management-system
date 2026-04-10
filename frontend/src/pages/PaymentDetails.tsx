import { useState, useMemo } from 'react'
import type { CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AxiosError } from 'axios'
import NavBar from '../components/NavBar'
import finePayBg from '../assets/slider/slide-1.png'
import './Home.css'
import './PaymentDetails.css'
import { paymentAPI } from '../api'

type PaymentLocationState = {
  fineIds: string[]
  licenseNo: string
  fines: any[]
  totalAmount: number
}

const formatCurrency = (value: number) => `LKR ${value.toLocaleString('en-LK')}`

export default function PaymentDetails() {
  const navigate = useNavigate()
  const location = useLocation()
  const paymentData = location.state as PaymentLocationState | null

  // Form state
  const [cardholderName, setCardholderName] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [cvv, setCvv] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [billingCity, setBillingCity] = useState('')
  const [billingZip, setBillingZip] = useState('')

  // UI state
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Calculate totals
  const totalAmount = useMemo(() => paymentData?.totalAmount || 0, [paymentData?.totalAmount])
  const fineCount = useMemo(() => paymentData?.fines?.length || 0, [paymentData?.fines?.length])

  // Format card number (add spaces for display)
  const formatCardNumber = (value: string) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
  }

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16)
    setCardNumber(value)
    if (formErrors.cardNumber) {
      setFormErrors(prev => ({ ...prev, cardNumber: '' }))
    }
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4)
    }
    setExpiryMonth(value.split('/')[0] || '')
    setExpiryYear(value.split('/')[1] || '')
    if (formErrors.expiry) {
      setFormErrors(prev => ({ ...prev, expiry: '' }))
    }
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setCvv(value)
    if (formErrors.cvv) {
      setFormErrors(prev => ({ ...prev, cvv: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required'
    }

    if (cardNumber.length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits'
    }

    if (!expiryMonth || !expiryYear) {
      newErrors.expiry = 'Expiry date is required (MM/YY)'
    } else {
      const month = parseInt(expiryMonth, 10)
      if (month < 1 || month > 12) {
        newErrors.expiry = 'Invalid expiry month'
      }
    }

    if (cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = 'CVV must be 3-4 digits'
    }

    if (!billingAddress.trim()) {
      newErrors.billingAddress = 'Address is required'
    }

    if (!billingCity.trim()) {
      newErrors.billingCity = 'City is required'
    }

    if (!billingZip.trim()) {
      newErrors.billingZip = 'ZIP code is required'
    }

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      setError('Please correct the errors in the form')
      return
    }

    if (!paymentData || !paymentData.fineIds || paymentData.fineIds.length === 0) {
      setError('No fines selected for payment')
      return
    }

    setIsProcessing(true)

    try {
      console.log('💳 Processing card payment...')

      // Call backend to initiate payment
      const response = await paymentAPI.initiatePayment({
        fineIds: paymentData.fineIds,
        licenseNo: paymentData.licenseNo,
      })

      console.log('✅ Payment initiated:', response.data)

      if (!response.data || !response.data.success) {
        throw new Error('Payment initiation failed')
      }

      // Here you would process the card payment
      // For now, we'll simulate success and navigate to success page
      const { orderId } = response.data

      // Simulate card processing (in real implementation, this would go to payment gateway)
      console.log('💳 Card Details Submitted:')
      console.log(`   - Card: **** **** **** ${cardNumber.slice(-4)}`)
      console.log(`   - Amount: ${formatCurrency(totalAmount)}`)
      console.log(`   - Order: ${orderId}`)

      // Navigate to success page
      navigate('/fine-pay/success', {
        state: {
          orderId,
          paymentId: `PMT-${Date.now()}`,
          amount: totalAmount,
          fineCount,
          currency: 'LKR',
          cardLast4: cardNumber.slice(-4),
        },
      })
    } catch (err) {
      console.error('❌ Payment processing error:', err)

      let errorMessage = 'Payment processing failed'

      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          errorMessage = err.response.data?.message || 'Invalid payment details'
        } else if (err.response?.status === 404) {
          errorMessage = 'One or more fines were not found'
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        }
      } else if (err instanceof Error) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  // If no payment data, redirect back
  if (!paymentData || !paymentData.fineIds || paymentData.fineIds.length === 0) {
    navigate('/fine-pay')
    return null
  }

  return (
    <section className="home-police payment-details-page">
      <NavBar />

      <div
        className="payment-details-page__content"
        style={{ '--payment-bg-image': `url(${finePayBg})` } as CSSProperties}
      >
        <div className="payment-details-page__overlay" />

        <div className="payment-details-container">
          {/* Order Summary */}
          <div className="payment-details-summary">
            <h3>Order Summary</h3>
            <div className="payment-details-summary__items">
              <div className="payment-details-summary__item">
                <span>Number of Fines</span>
                <strong>{fineCount}</strong>
              </div>
              <div className="payment-details-summary__item">
                <span>Total Amount</span>
                <strong>{formatCurrency(totalAmount)}</strong>
              </div>
            </div>
            <div className="payment-details-summary__fines">
              {paymentData.fines && paymentData.fines.map((fine, index) => (
                <div key={fine.id || index} className="payment-details-summary__fine">
                  <span className="payment-details-summary__fine-reason">{fine.reason || 'Traffic Fine'}</span>
                  <span className="payment-details-summary__fine-amount">{formatCurrency(fine.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="payment-details-card">
            <h2>Payment Details</h2>

            {error && (
              <div className="payment-details-error">
                <span className="payment-details-error__icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="payment-details-form">
              {/* Cardholder Name */}
              <div className="payment-details-form__group">
                <label htmlFor="cardholder-name">Cardholder Name *</label>
                <input
                  id="cardholder-name"
                  type="text"
                  placeholder="JOHN DOE"
                  value={cardholderName}
                  onChange={e => {
                    setCardholderName(e.target.value.toUpperCase())
                    if (formErrors.cardholderName) {
                      setFormErrors(prev => ({ ...prev, cardholderName: '' }))
                    }
                  }}
                  disabled={isProcessing}
                  maxLength={30}
                />
                {formErrors.cardholderName && (
                  <span className="payment-details-form__error">{formErrors.cardholderName}</span>
                )}
              </div>

              {/* Card Number */}
              <div className="payment-details-form__group">
                <label htmlFor="card-number">Card Number *</label>
                <input
                  id="card-number"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={formatCardNumber(cardNumber)}
                  onChange={handleCardNumberChange}
                  disabled={isProcessing}
                  maxLength={19}
                />
                {formErrors.cardNumber && (
                  <span className="payment-details-form__error">{formErrors.cardNumber}</span>
                )}
              </div>

              {/* Expiry and CVV Row */}
              <div className="payment-details-form__row">
                <div className="payment-details-form__group">
                  <label htmlFor="expiry">Expiry Date (MM/YY) *</label>
                  <input
                    id="expiry"
                    type="text"
                    placeholder="MM/YY"
                    value={expiryMonth && expiryYear ? `${expiryMonth}/${expiryYear}` : ''}
                    onChange={handleExpiryChange}
                    disabled={isProcessing}
                    maxLength={5}
                  />
                  {formErrors.expiry && (
                    <span className="payment-details-form__error">{formErrors.expiry}</span>
                  )}
                </div>

                <div className="payment-details-form__group">
                  <label htmlFor="cvv">CVV *</label>
                  <input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    disabled={isProcessing}
                    maxLength={4}
                  />
                  {formErrors.cvv && (
                    <span className="payment-details-form__error">{formErrors.cvv}</span>
                  )}
                </div>
              </div>

              {/* Billing Address */}
              <div className="payment-details-form__group">
                <label htmlFor="address">Billing Address *</label>
                <input
                  id="address"
                  type="text"
                  placeholder="123 Main Street"
                  value={billingAddress}
                  onChange={e => {
                    setBillingAddress(e.target.value)
                    if (formErrors.billingAddress) {
                      setFormErrors(prev => ({ ...prev, billingAddress: '' }))
                    }
                  }}
                  disabled={isProcessing}
                  maxLength={50}
                />
                {formErrors.billingAddress && (
                  <span className="payment-details-form__error">{formErrors.billingAddress}</span>
                )}
              </div>

              {/* City and ZIP Row */}
              <div className="payment-details-form__row">
                <div className="payment-details-form__group">
                  <label htmlFor="city">City *</label>
                  <input
                    id="city"
                    type="text"
                    placeholder="Colombo"
                    value={billingCity}
                    onChange={e => {
                      setBillingCity(e.target.value)
                      if (formErrors.billingCity) {
                        setFormErrors(prev => ({ ...prev, billingCity: '' }))
                      }
                    }}
                    disabled={isProcessing}
                    maxLength={30}
                  />
                  {formErrors.billingCity && (
                    <span className="payment-details-form__error">{formErrors.billingCity}</span>
                  )}
                </div>

                <div className="payment-details-form__group">
                  <label htmlFor="zip">ZIP Code *</label>
                  <input
                    id="zip"
                    type="text"
                    placeholder="00200"
                    value={billingZip}
                    onChange={e => {
                      setBillingZip(e.target.value)
                      if (formErrors.billingZip) {
                        setFormErrors(prev => ({ ...prev, billingZip: '' }))
                      }
                    }}
                    disabled={isProcessing}
                    maxLength={10}
                  />
                  {formErrors.billingZip && (
                    <span className="payment-details-form__error">{formErrors.billingZip}</span>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="payment-details-form__actions">
                <button
                  type="submit"
                  className="payment-details-form__submit"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}
                </button>
                <button
                  type="button"
                  className="payment-details-form__cancel"
                  onClick={handleCancel}
                  disabled={isProcessing}
                >
                  Cancel
                </button>
              </div>

              <p className="payment-details-form__secure">
                🔒 Your payment information is secure and encrypted
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
