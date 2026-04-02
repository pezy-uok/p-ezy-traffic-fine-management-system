import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import NavBar from '../components/NavBar'
import finePayBg from '../assets/slider/slide-1.png'
import './Home.css'
import './FinePayOutstanding.css'

type FineItem = {
  id: string
  title: string
  details: string
  date: string
  amount: number
}

const fines: FineItem[] = [
  {
    id: 'fine-1',
    title: 'Speeding (80km/h in 60 zone)',
    details: 'A 14th Ave',
    date: '2025-11-06',
    amount: 3500,
  },
  {
    id: 'fine-2',
    title: 'Illegal Parking',
    details: 'St. Clair Road',
    date: '2025-11-05',
    amount: 1500,
  },
  {
    id: 'fine-3',
    title: 'Broken Tail Light',
    details: 'Kurunegala Road',
    date: '2025-11-03',
    amount: 1000,
  },
]

const formatCurrency = (value: number) => `LKR ${value.toLocaleString('en-LK')}`

const formatFineDate = (value: string) =>
  new Date(value).toLocaleDateString('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export default function FinePayOutstanding() {
  const navigate = useNavigate()
  const [selectedFineIds, setSelectedFineIds] = useState<string[]>(fines.map(fine => fine.id))

  const selectedFines = useMemo(
    () => fines.filter(fine => selectedFineIds.includes(fine.id)),
    [selectedFineIds],
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
                <h2 id="driver-info-title">Mahinda Mahattaya</h2>
                <p>Light Vehicle (Class C)</p>
              </div>

              <span className="fine-pay-outstanding-header__status">Active</span>
            </div>
          </article>

          <div className="fine-pay-outstanding-list__header">
            <h3>Outstanding Fines</h3>
            <span>{fines.length} Records Found</span>
          </div>

          <div className="fine-pay-outstanding-list" aria-label="Outstanding fines list">
            {fines.map(fine => {
              const isSelected = selectedFineIds.includes(fine.id)

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
                    aria-label={isSelected ? `Remove ${fine.title}` : `Select ${fine.title}`}
                  />

                  <div className="fine-pay-outstanding-card__top">
                    <div className="fine-pay-outstanding-card__title-group">
                      <h4>{fine.title}</h4>
                      <p>{fine.details}</p>
                    </div>

                    <div className="fine-pay-outstanding-card__amount-group">
                      <strong>{formatCurrency(fine.amount)}</strong>
                      <span className="fine-pay-outstanding-card__tag">Unpaid</span>
                    </div>
                  </div>

                  <div className="fine-pay-outstanding-card__meta">
                    <span>Issued {formatFineDate(fine.date)}</span>
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