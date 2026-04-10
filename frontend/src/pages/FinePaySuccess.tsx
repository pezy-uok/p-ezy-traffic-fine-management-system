import { useMemo } from 'react'
import { useLocation, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import './Home.css'
import './FinePaySuccess.css'

interface PaymentSuccessData {
  orderId?: string
  paymentId?: string
  amount?: number
  fineCount?: number
  cardLast4?: string
}

const formatDate = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

const formatCurrency = (value: number) => `LKR ${value.toLocaleString('en-LK')}`

export default function FinePaySuccess() {
  const location = useLocation()
  const paymentData = location.state as PaymentSuccessData | null

  const transactionDate = useMemo(() => formatDate(new Date()), [])

  const amount = paymentData?.amount || 0
  const paymentId = paymentData?.paymentId || 'N/A'
  const cardLast4 = paymentData?.cardLast4 || '****'
  const fineCount = paymentData?.fineCount || 0

  return (
    <section className="home-police fine-pay-success-page">
      <NavBar />

      <div className="fine-pay-success-page__content">
        <article className="fine-pay-success-card" aria-labelledby="fine-pay-success-title">
          <div className="fine-pay-success-card__icon" aria-hidden="true">
            <span className="fine-pay-success-card__icon-mark" />
          </div>

          <h2 id="fine-pay-success-title">Payment Successful!</h2>
          <p>Your transaction has been completed and the selected {fineCount} fine(s) have been cleared from the system.</p>

          <section className="fine-pay-success-summary" aria-label="Payment summary">
            <div className="fine-pay-success-summary__row fine-pay-success-summary__row--amount">
              <span>Amount Paid</span>
              <strong>{formatCurrency(amount)}</strong>
            </div>

            <div className="fine-pay-success-summary__row">
              <span>Date</span>
              <span>{transactionDate}</span>
            </div>

            <div className="fine-pay-success-summary__row">
              <span>Reference ID</span>
              <span>{paymentId}</span>
            </div>

            <div className="fine-pay-success-summary__row">
              <span>Payment Method</span>
              <span>CARD **** {cardLast4}</span>
            </div>
          </section>

          <button type="button" className="fine-pay-success-card__download">
            Download Receipt (PDF)
          </button>

          <Link to="/fine-pay" className="fine-pay-success-card__retry">
            Make Another Payment
          </Link>
        </article>
      </div>
    </section>
  )
}