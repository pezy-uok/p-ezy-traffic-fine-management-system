import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import './Home.css'
import './FinePayFailure.css'

const formatDate = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

export default function FinePayFailure() {
  const transactionDate = useMemo(() => formatDate(new Date()), [])

  return (
    <section className="home-police fine-pay-failure-page">
      <NavBar />

      <div className="fine-pay-failure-page__content">
        <article className="fine-pay-failure-card" aria-labelledby="fine-pay-failure-title">
          <div className="fine-pay-failure-card__icon" aria-hidden="true">
            <span className="fine-pay-failure-card__icon-mark" />
          </div>

          <h2 id="fine-pay-failure-title">Payment Failed</h2>
          <p>We could not complete your transaction. Please verify your payment information and try again.</p>

          <section className="fine-pay-failure-summary" aria-label="Failed payment summary">
            <div className="fine-pay-failure-summary__row fine-pay-failure-summary__row--amount">
              <span>Amount</span>
              <strong>LKR 6,000</strong>
            </div>

            <div className="fine-pay-failure-summary__row">
              <span>Date</span>
              <span>{transactionDate}</span>
            </div>

            <div className="fine-pay-failure-summary__row">
              <span>Reference ID</span>
              <span>TRX-291763</span>
            </div>

            <div className="fine-pay-failure-summary__row">
              <span>Reason</span>
              <span>Card authorization failed</span>
            </div>
          </section>

          <Link to="/fine-pay" className="fine-pay-failure-card__retry">
            Try Payment Again
          </Link>

          <Link to="/dashboard" className="fine-pay-failure-card__secondary-link">
            Back to Dashboard
          </Link>
        </article>
      </div>
    </section>
  )
}