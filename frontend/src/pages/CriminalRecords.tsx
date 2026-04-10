import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Swal from 'sweetalert2'
import NavBar from '../components/NavBar'
import { tipAPI } from '../api'
import { criminalRecords, type CriminalRecord, type RecordStatus } from '../data/criminalRecords'
import './CriminalRecords.css'

interface TipFormState {
  title: string
  location: string
  sightingTime: Date | null
  description: string
  category: string
  contactEmail: string
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
  title: '',
  location: '',
  sightingTime: null,
  description: '',
  category: '',
  contactEmail: '',
  anonymous: true,
}

export default function CriminalRecords() {
  const [searchTerm, setSearchTerm] = useState('')
  const [tipForm, setTipForm] = useState<TipFormState>(defaultTipState)
  const [submitting, setSubmitting] = useState(false)
  const [_tipSuccessMessage, _setTipSuccessMessage] = useState('')
  const [_tipErrorMessage, _setTipErrorMessage] = useState('')

  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) {
      return criminalRecords
    }

    return criminalRecords.filter(card => {
      const target = `${card.name} ${card.alias} ${card.summary} ${card.crime}`.toLowerCase()
      return target.includes(searchTerm.trim().toLowerCase())
    })
  }, [searchTerm])

  const handleTipFieldChange = (field: keyof TipFormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = field === 'anonymous' ? (event.target as HTMLInputElement).checked : event.target.value
    setTipForm(previous => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleTipSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      await tipAPI.submit({
        title: tipForm.title,
        description: tipForm.description,
        category: tipForm.category,
        location: tipForm.location,
        dateTime: tipForm.sightingTime ? tipForm.sightingTime.toISOString() : new Date().toISOString(),
        contactEmail: tipForm.anonymous ? undefined : tipForm.contactEmail || undefined,
        isAnonymous: tipForm.anonymous,
      })
      setTipForm(defaultTipState)
      await Swal.fire({
        icon: 'success',
        title: 'Tip Submitted',
        text: 'Your secure tip has been received. Thank you for helping the community.',
        confirmButtonColor: '#e84393',
      })
    } catch {
      await Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: 'Unable to submit your tip. Please try again later.',
        confirmButtonColor: '#e84393',
      })
    } finally {
      setSubmitting(false)
    }
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
              Title
              <input
                type="text"
                value={tipForm.title}
                onChange={handleTipFieldChange('title')}
                placeholder="Brief title of your tip"
                maxLength={255}
                required
              />
            </label>

            <label className="records-tip__field">
              Category
              <select
                value={tipForm.category}
                onChange={handleTipFieldChange('category')}
                required
              >
                <option value="" disabled>Select a category</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="wanted_person">Wanted Person Sighting</option>
                <option value="crime_report">Crime Report</option>
                <option value="theft">Theft</option>
                <option value="violence">Violence</option>
                <option value="drug_related">Drug Related</option>
                <option value="fraud">Fraud</option>
                <option value="traffic_violation">Traffic Violation</option>
                <option value="missing_person">Missing Person</option>
                <option value="other">Other</option>
              </select>
            </label>

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

            <div className="records-tip__field">
              <span>Date &amp; Time of Sighting</span>
              <DatePicker
                selected={tipForm.sightingTime}
                onChange={(date: Date | null) => setTipForm(prev => ({ ...prev, sightingTime: date }))}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                placeholderText="Select date and time"
                maxDate={new Date()}
                required
                wrapperClassName="records-tip__datepicker-wrapper"
                className="records-tip__datepicker-input"
              />
            </div>

            <label className="records-tip__field">
              Detailed Description
              <textarea
                value={tipForm.description}
                onChange={handleTipFieldChange('description')}
                placeholder="Give a brief description of what you saw..."
                minLength={20}
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

            {!tipForm.anonymous && (
              <label className="records-tip__field">
                Contact Email
                <input
                  type="email"
                  value={tipForm.contactEmail}
                  onChange={handleTipFieldChange('contactEmail')}
                  placeholder="your@email.com"
                />
              </label>
            )}

            <button type="submit" className="records-tip__submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Secure Tip Now'}
            </button>

            {_tipSuccessMessage && <p>{_tipSuccessMessage}</p>}
            {_tipErrorMessage && <p>{_tipErrorMessage}</p>}
          </form>
        </aside>
      </div>
    </section>
  )
}
