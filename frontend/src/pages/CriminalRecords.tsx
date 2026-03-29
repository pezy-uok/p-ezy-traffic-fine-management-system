import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import NavBar from '../components/NavBar'
import { criminalRecords, type CriminalRecord, type RecordStatus } from '../data/criminalRecords'
import './CriminalRecords.css'

interface TipFormState {
  location: string
  sightingTime: string
  description: string
  anonymous: boolean
}

const statusToVariant: Record<RecordStatus, 'danger' | 'info' | 'warning'> = {
  wanted: 'danger',
  arrested: 'info',
  unidentified: 'warning',
}

const statusToCardClass: Record<RecordStatus, string> = {
  wanted: 'records-card--danger',
  arrested: 'records-card--info',
  unidentified: 'records-card--warning',
}

const defaultTipState: TipFormState = {
  location: '',
  sightingTime: '',
  description: '',
  anonymous: true,
}

export default function CriminalRecords() {
  const [searchTerm, setSearchTerm] = useState('')
  const [tipForm, setTipForm] = useState<TipFormState>(defaultTipState)

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) {
      return criminalRecords
    }

    return criminalRecords.filter(card => {
      const target = `${card.name} ${card.alias} ${card.summary} ${card.crime}`.toLowerCase()
      return target.includes(searchTerm.trim().toLowerCase())
    })
  }, [searchTerm])

  const handleTipFieldChange = (field: keyof TipFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'anonymous' ? (event.target as HTMLInputElement).checked : event.target.value
    setTipForm(previous => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleTipSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Placeholder submit handler. Integrate with backend tip API when ready.
    console.info('Secure tip submitted', tipForm)
    setTipForm(defaultTipState)
  }

  const handleOpenProfile = (record: CriminalRecord) => {
    const detailUrl = new URL(`/criminal-records/${record.id}`, window.location.origin)
    window.open(detailUrl.toString(), '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="records">
      <NavBar />

      <div className="records__masthead">
        <p className="records__breadcrumb">Home / Criminal Records</p>
        <h2>Public Criminal Records</h2>
        <p>Information provided here is for public awareness. Do not attempt to apprehend any wanted individuals yourself.</p>

        <label className="records__search-bar">
          <span aria-hidden="true">&#128269;</span>
          <input
            type="text"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Search by Name..."
            aria-label="Search records by name"
          />
        </label>
      </div>

      <div className="records__content">
        <div className="records__grid" aria-live="polite">
          {filteredRecords.map(card => (
            <article key={card.id} className={`records-card ${statusToCardClass[card.status]}`}>
              <div className="records-card__badge-wrap">
                <span className={`records-card__badge is-${statusToVariant[card.status]}`}>{card.badgeLabel}</span>
              </div>
              <div className="records-card__avatar">
                <img src={card.photoUrl} alt={`Portrait of ${card.name}`} loading="lazy" />
              </div>
              <div className="records-card__body">
                <p className="records-card__name">{card.name}</p>
                <p className="records-card__alias">{card.alias}</p>
                <p className="records-card__crime">{card.crime}</p>
                <p className="records-card__summary">{card.summary}</p>
                <button type="button" className="records-card__action" onClick={() => handleOpenProfile(card)}>
                  View Details
                </button>
              </div>
            </article>
          ))}
          {filteredRecords.length === 0 && (
            <div className="records__empty">
              <p>No records found for "{searchTerm}".</p>
              <p>Please refine your search or submit a secure tip below.</p>
            </div>
          )}
        </div>

        <aside className="records-tip" aria-label="Submit Secure Tip">
          <p className="records-tip__eyebrow">Community Intel</p>
          <h3>Submit a Secure Tip Now</h3>
          <p>Provide as many details as you can. Your information directly assists ongoing investigations.</p>

          <form className="records-tip__form" onSubmit={handleTipSubmit}>
            <label className="records-tip__field">
              Location Found
              <input
                type="text"
                value={tipForm.location}
                onChange={handleTipFieldChange('location')}
                placeholder="City, street, or landmark"
                required
              />
            </label>

            <label className="records-tip__field">
              Time of Sighting
              <input
                type="datetime-local"
                value={tipForm.sightingTime}
                onChange={handleTipFieldChange('sightingTime')}
                required
              />
            </label>

            <label className="records-tip__field">
              Detailed Description
              <textarea
                value={tipForm.description}
                onChange={handleTipFieldChange('description')}
                placeholder="Give a brief description of what you saw..."
                minLength={12}
                rows={5}
                required
              />
            </label>

            <label className="records-tip__checkbox">
              <input
                type="checkbox"
                checked={tipForm.anonymous}
                onChange={handleTipFieldChange('anonymous')}
              />
              Submit Anonymously
            </label>

            <button type="submit" className="records-tip__submit">
              Submit Secure Tip Now
            </button>
          </form>
        </aside>
      </div>
    </section>
  )
}
