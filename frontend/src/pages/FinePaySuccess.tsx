import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import NavBar from '../components/NavBar'
import './Home.css'
import './FinePaySuccess.css'

const formatDate = (date: Date) => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month}/${day}/${year}`
}

export default function FinePaySuccess() {
  const transactionDate = useMemo(() => formatDate(new Date()), [])

  return (
    <section className="home-police fine-pay-success-page">
      <NavBar />

      <div className="fine-pay-success-page__content">
        <article className="fine-pay-success-card" aria-labelledby="fine-pay-success-title">
          <div className="fine-pay-success-card__icon" aria-hidden="true">
            <span className="fine-pay-success-card__icon-mark" />
          </div>

          <h2 id="fine-pay-success-title">Payment Successful!</h2>
          <p>Your transaction has been completed and the selected fines have been cleared from the system.</p>

          <section className="fine-pay-success-summary" aria-label="Payment summary">
            <div className="fine-pay-success-summary__row fine-pay-success-summary__row--amount">
              <span>Amount Paid</span>
              <strong>LKR 6,000</strong>
            </div>

            <div className="fine-pay-success-summary__row">
              <span>Date</span>
              <span>{transactionDate}</span>
            </div>

            <div className="fine-pay-success-summary__row">
              <span>Reference ID</span>
              <span>TRX-291763</span>
            </div>

            <div className="fine-pay-success-summary__row">
              <span>Payment Method</span>
              <span>VISA **** 4242</span>
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