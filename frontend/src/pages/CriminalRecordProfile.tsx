import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import Swal from 'sweetalert2'
import pLogo from '../assets/plogo.png'
import { tipAPI } from '../api'
import { findCriminalRecord } from '../data/criminalRecords'
import './CriminalRecordProfile.css'

interface TipFormState {
  title: string
  location: string
  sightingTime: Date | null
  description: string
  category: string
  contactEmail: string
  anonymous: boolean
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

const profileMenuLinks = ['Home', 'About Us', 'Fine Pay', 'Criminal Records', 'Division', 'Downloads', 'Library', 'Survey']

export default function CriminalRecordProfile() {
  const { recordId } = useParams()
  const navigate = useNavigate()
  const record = recordId ? findCriminalRecord(recordId) : undefined
  const [tipForm, setTipForm] = useState<TipFormState>(defaultTipState)
  const [submitting, setSubmitting] = useState(false)

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

  const handleGoBack = () => {
    navigate('/criminal-records')
  }

  return (
    <section className="record-profile">
      <header className="records__banner">
        <div className="records__container records__brand-row">
          <div className="records__brand">
            <img src={pLogo} alt="Sri Lanka Police logo" className="records__logo" />
            <div>
              <p className="records__badge-label">Official Website</p>
              <h1>SRI LANKA POLICE</h1>
            </div>
          </div>
          <span className="records__lang">ENGLISH</span>
        </div>

        <div className="records__container records__menu-row">
          <nav className="records__menu" aria-label="Primary">
            {profileMenuLinks.map(link => (
              <button
                key={link}
                type="button"
                className={`records__menu-item${link === 'Criminal Records' ? ' is-active' : ''}`}
                onClick={() => {
                  if (link === 'Criminal Records') {
                    navigate('/criminal-records')
                  }
                }}
              >
                {link}
              </button>
            ))}
          </nav>

          <label className="records__menu-search" aria-label="Search site wide">
            <span aria-hidden="true">&#128269;</span>
            <input type="text" placeholder="Search" readOnly />
          </label>
        </div>
      </header>

      <div className="record-profile__container">
        <button type="button" className="record-profile__back" onClick={handleGoBack}>
          &#8592; Back to All Records
        </button>

        {record ? (
          <div className="record-profile__grid">
            <article className="record-profile__card">
              <div className="record-profile__photo">
                <img src={record.photoUrl} alt={`Portrait of ${record.name}`} />
                <span className="record-profile__status">{record.badgeLabel}</span>
              </div>
              <div className="record-profile__card-body">
                <p className="record-profile__alias">{record.alias}</p>
                <h2>{record.name}</h2>
                <p className="record-profile__crime">{record.crime}</p>
                <p className="record-profile__summary">{record.summary}</p>

                <div className="record-profile__identifiers">
                  <div>
                    <span>AGE</span>
                    <strong>{record.stats.age}</strong>
                  </div>
                  <div>
                    <span>HEIGHT</span>
                    <strong>{record.stats.height}</strong>
                  </div>
                  <div>
                    <span>WEIGHT</span>
                    <strong>{record.stats.weight}</strong>
                  </div>
                </div>
              </div>
            </article>

            <div className="record-profile__details">
              <section className="record-profile__panel">
                <h3>Physical Description</h3>
                <p>{record.physicalDescription}</p>
              </section>

              <section className="record-profile__panel">
                <h3>Last Known Activity</h3>
                <ul>
                  <li>
                    <span>LAST SEEN LOCATION</span>
                    <p>{record.lastKnownLocation}</p>
                  </li>
                  <li>
                    <span>DATE OF SIGHTING</span>
                    <p>{new Date(record.lastSeenOn).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </li>
                </ul>
              </section>

              <section className="record-profile__report">
                <p className="record-profile__report-eyebrow">Report a Sighting</p>
                <h3>Have you seen {record.name}?</h3>
                <p>Submit a secure, anonymous tip to law enforcement immediately.</p>

                <form className="record-profile__form" onSubmit={handleTipSubmit}>
                  <label>
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

                  <label>
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

                  <label>
                    Location Found
                    <input
                      type="text"
                      value={tipForm.location}
                      onChange={handleTipFieldChange('location')}
                      placeholder="e.g. Main St. Bus Stop"
                      required
                    />
                  </label>

                  <div className="record-profile__datepicker-field">
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
                      wrapperClassName="record-profile__datepicker-wrapper"
                      className="record-profile__datepicker-input"
                    />
                  </div>

                  <label>
                    Detailed Description
                    <textarea
                      rows={5}
                      value={tipForm.description}
                      onChange={handleTipFieldChange('description')}
                      placeholder="What were they wearing? Which direction were they heading?"
                      minLength={20}
                      required
                    />
                  </label>

                  <label className="record-profile__checkbox">
                    <input type="checkbox" checked={tipForm.anonymous} onChange={handleTipFieldChange('anonymous')} />
                    Submit Anonymously
                  </label>

                  {!tipForm.anonymous && (
                    <label>
                      Contact Email
                      <input
                        type="email"
                        value={tipForm.contactEmail}
                        onChange={handleTipFieldChange('contactEmail')}
                        placeholder="your@email.com"
                      />
                    </label>
                  )}

                  <button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Secure Tip Now'}
                  </button>
                </form>
              </section>
            </div>
          </div>
        ) : (
          <div className="record-profile__empty">
            <p>Record not found.</p>
            <button type="button" onClick={handleGoBack}>
              Back to list
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
