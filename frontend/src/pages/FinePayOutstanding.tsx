import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import finePayBg from '../assets/slider/slide-1.png'
import './Home.css'
import './FinePayOutstanding.css'

type DriverInfo = {
  driver_id: string
  driver_name: string
  license_number: string
}

type FineItem = {
  id: string
  driver_id: string
  amount: number
  reason: string
  location?: string
  issue_date: string
  status: string
}

type FinePayLocationState = {
  suspensionReminder?: string
  licenseNumber?: string
  driver?: DriverInfo
  fines?: FineItem[]
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
  
  // Debug logging
  console.log('🔍 FinePayOutstanding Component Loaded')
  console.log('📍 Location State:', reminderState)
  
  // Safely extract data from location state
  const driverInfo = reminderState?.driver
  const driverName = driverInfo?.driver_name || 'Driver'
  const licenseNumber = driverInfo?.license_number || reminderState?.licenseNumber || 'N/A'
  
  // Get fines from location state or use empty array
  const allFines = useMemo(() => reminderState?.fines || [], [reminderState?.fines])
  
  console.log('📋 Fines Data:', { driverName, licenseNumber, finesCount: allFines.length, fines: allFines })
  
  const [selectedFineIds, setSelectedFineIds] = useState<string[]>(() => {
    if (!allFines || allFines.length === 0) return []
    return allFines.map((fine: FineItem) => fine.id)
  })

  const selectedFines = useMemo(
    () => allFines.filter((fine: FineItem) => selectedFineIds.includes(fine.id)),
    [selectedFineIds, allFines],
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

    // Navigate to payment details page with order information
    navigate('/fine-pay/payment-details', {
      state: {
        fineIds: selectedFineIds,
        licenseNo: licenseNumber,
        fines: selectedFines,
        totalAmount,
      },
    })
  }

  // If no fines found, show empty state
  if (allFines.length === 0) {
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
                {!reminderState ? (
                  <>Great news! There are no outstanding fines for this driving license. Your traffic record is clean.</>
                ) : (
                  <>Please go back and search for a driving license number to view fines.</>
                )}
              </p>
            </div>

            <button
              type="button"
              className="fine-pay-outstanding-footer__button"
              onClick={() => navigate('/fine-pay')}
              style={{ marginTop: '2rem', width: '100%' }}
            >
              Search Another License
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
            <span>{allFines.length} Records Found</span>
          </div>

          <div className="fine-pay-outstanding-list" aria-label="Outstanding fines list">
            {allFines && allFines.length > 0 ? (
              allFines.map((fine: FineItem) => {
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
            })
            ) : (
              <div className="fine-pay-outstanding-empty" style={{ textAlign: 'center', padding: '2rem' }}>
                <p>No fines found. Please go back and try again.</p>
              </div>
            )}
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
            <div className="fine-pay-outstanding-footer__content">
              <div className="fine-pay-outstanding-footer__section">
                <span className="fine-pay-outstanding-footer__label">Fines Selected</span>
                <strong className="fine-pay-outstanding-footer__count">
                  {selectedFineIds.length} / {allFines.length}
                </strong>
              </div>

              <div className="fine-pay-outstanding-footer__divider" aria-hidden="true" />

              <div className="fine-pay-outstanding-footer__section">
                <span className="fine-pay-outstanding-footer__label">Total Amount</span>
                <strong className="fine-pay-outstanding-footer__amount">
                  {formatCurrency(totalAmount)}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="fine-pay-outstanding-footer__button"
              onClick={handlePayNow}
              disabled={selectedFineIds.length === 0}
              aria-label={
                selectedFineIds.length === 0
                  ? 'Select fines to pay'
                  : `Pay now for ${selectedFineIds.length} fine${selectedFineIds.length === 1 ? '' : 's'}`
              }
            >
              {selectedFineIds.length === 0 ? 'Select Fines to Pay' : 'Pay Now'}
            </button>
          </footer>
        </div>
      </div>
    </section>
  )
}