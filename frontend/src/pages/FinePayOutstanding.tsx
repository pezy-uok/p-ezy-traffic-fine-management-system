import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import finePayBg from '../assets/slider/slide-1.png'
import './Home.css'
import './FinePayOutstanding.css'

type FinePayLocationState = {
  suspensionReminder?: string
  licenseNumber?: string
  fines?: any[]
}

type FineItem = {
  id: string
  reason: string
  location: string
  issue_date: string
  amount: number
  status: string
}

const formatCurrency = (value: number) => `LKR ${value.toLocaleString('en-LK')}`

const formatFineDate = (value: string) =>
  new Date(value).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export default function FinePayOutstanding() {
  const navigate = useNavigate()
  const location = useLocation()
  const reminderState = location.state as FinePayLocationState | null
  
  // Get fines from location state or use empty array
  const apieFines = reminderState?.fines || []
  
  // Initialize selected fines to all by default
  const [selectedFineIds, setSelectedFineIds] = useState<string[]>(
    apieFines.map((fine: any) => fine.id)
  )

  const selectedFines = useMemo(
    () => apieFines.filter((fine: any) => selectedFineIds.includes(fine.id)),
    [selectedFineIds, apieFines],
  )

  const totalAmount = useMemo(
    () => selectedFines.reduce((total, fine) => total + fine.amount, 0),
    [selectedFines],
  )

  const toggleFine = (fineId: string) => {
    setSelectedFineIds(previous =>
      previous.includes(fineId) ? previous.filter(id => id !== fineId) : [...previous, fineId],
    )
  }

  const handlePayNow = () => {
    if (selectedFineIds.length === 0) {
      return
    }

    navigate('/fine-pay/success')
  }

  // Get driver info from first fine
  const driverName = apieFines.length > 0 ? apieFines[0].driver_name : 'Driver'
  const licenseNumber = reminderState?.licenseNumber || 'N/A'

  // If no fines found, show empty state
  if (apieFines.length === 0) {
    return (
      <section className="home-police fine-pay-outstanding-page">
        <NavBar />

        <div
          className="fine-pay-outstanding-page__content"
          style={{ '--fine-pay-outstanding-bg-image': `url(${finePayBg})` } as CSSProperties}
        >
          <div className="fine-pay-outstanding-page__overlay" />

          <div className="fine-pay-outstanding-page__shell">
            <article className="fine-pay-outstanding-header" aria-labelledby="driver-info-title">
              <p className="fine-pay-outstanding-header__eyebrow">Driving License Verified</p>
              <div className="fine-pay-outstanding-header__row">
                <div>
                  <h2 id="driver-info-title">{driverName}</h2>
                  <p>License: {licenseNumber}</p>
                </div>

                <span className="fine-pay-outstanding-header__status">No Records</span>
              </div>
            </article>

            <div className="fine-pay-outstanding-note" role="status" style={{ marginTop: '2rem' }}>
              <span className="fine-pay-outstanding-note__icon" aria-hidden="true">
                ✓
              </span>
              <p>
                Great news! There are no outstanding fines for this driving license. Your traffic record is clean.
              </p>
            </div>

            <button
              type="button"
              className="fine-pay-outstanding-footer__button"
              onClick={() => navigate('/fine-pay')}
              style={{ marginTop: '2rem', width: '100%' }}
            >
              Check Another License
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="home-police fine-pay-outstanding-page">
      <NavBar />

      <div
        className="fine-pay-outstanding-page__content"
        style={{ '--fine-pay-outstanding-bg-image': `url(${finePayBg})` } as CSSProperties}
      >
        <div className="fine-pay-outstanding-page__overlay" />

        <div className="fine-pay-outstanding-page__shell">
          {reminderState?.suspensionReminder && (
            <section className="fine-pay-outstanding-reminder" role="alert" aria-live="polite">
              <div className="fine-pay-outstanding-reminder__icon" aria-hidden="true">
                !
              </div>
              <div className="fine-pay-outstanding-reminder__body">
                <h3>Suspension reminder</h3>
                <p>{reminderState.suspensionReminder}</p>
                {reminderState.licenseNumber && (
                  <span>License: {reminderState.licenseNumber}</span>
                )}
              </div>
            </section>
          )}

          <article className="fine-pay-outstanding-header" aria-labelledby="driver-info-title">
            <p className="fine-pay-outstanding-header__eyebrow">Driving License Verified</p>
            <div className="fine-pay-outstanding-header__row">
              <div>
                <h2 id="driver-info-title">{driverName}</h2>
                <p>License: {licenseNumber}</p>
              </div>

              <span className="fine-pay-outstanding-header__status">Active</span>
            </div>
          </article>

          <div className="fine-pay-outstanding-list__header">
            <h3>Outstanding Fines</h3>
            <span>{apieFines.length} Records Found</span>
          </div>

          <div className="fine-pay-outstanding-list" aria-label="Outstanding fines list">
            {apieFines.map((fine: any) => {
              const isSelected = selectedFineIds.includes(fine.id)
              const amount = typeof fine.amount === 'string' ? parseFloat(fine.amount) : fine.amount

              return (
                <label
                  className={`fine-pay-outstanding-card${isSelected ? ' is-selected' : ''}`}
                  key={fine.id}
                  htmlFor={fine.id}
                >
                  <input
                    id={fine.id}
                    type="checkbox"
                    className="fine-pay-outstanding-card__input"
                    checked={isSelected}
                    onChange={() => toggleFine(fine.id)}
                    aria-label={isSelected ? `Remove ${fine.reason}` : `Select ${fine.reason}`}
                  />

                  <div className="fine-pay-outstanding-card__top">
                    <div className="fine-pay-outstanding-card__title-group">
                      <h4>{fine.reason}</h4>
                      <p>{fine.location || 'N/A'}</p>
                    </div>

                    <div className="fine-pay-outstanding-card__amount-group">
                      <strong>{formatCurrency(amount)}</strong>
                      <span className="fine-pay-outstanding-card__tag">{fine.status === 'paid' ? 'Paid' : 'Unpaid'}</span>
                    </div>
                  </div>

                  <div className="fine-pay-outstanding-card__meta">
                    <span>Issued {formatFineDate(fine.issue_date)}</span>
                    <span className={`fine-pay-outstanding-card__check${isSelected ? ' is-selected' : ''}`} aria-hidden="true">
                      <span className="fine-pay-outstanding-card__check-mark" />
                    </span>
                  </div>
                </label>
              )
            })}
          </div>

          <div className="fine-pay-outstanding-note" role="note">
            <span className="fine-pay-outstanding-note__icon" aria-hidden="true">
              i
            </span>
            <p>
              You can select specific fines to pay. Unpaid fines may result in license suspension after 30 days from
              the offense date.
            </p>
          </div>

          <footer className="fine-pay-outstanding-footer" aria-label="Payment summary">
            <div>
              <span>{selectedFineIds.length} fines selected</span>
              <strong>{formatCurrency(totalAmount)}</strong>
            </div>

            <button
              type="button"
              className="fine-pay-outstanding-footer__button"
              onClick={handlePayNow}
              disabled={selectedFineIds.length === 0}
            >
              Pay Now
            </button>
          </footer>
        </div>
      </div>
    </section>
  )
}