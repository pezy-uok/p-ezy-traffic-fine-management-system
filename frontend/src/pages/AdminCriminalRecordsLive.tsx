import { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '@/api'
import './AdminCriminalRecords.css'

type CriminalStatus = 'active' | 'inactive' | 'deceased' | 'deported'
type DangerLevel = 'low' | 'medium' | 'high' | 'critical'

interface CriminalRecordData {
  id: string
  firstName: string
  lastName: string
  name: string
  identificationNumber: string
  gender: string
  status: CriminalStatus | string
  wanted: boolean
  dangerLevel: DangerLevel | string
  arrestCount: number
  dateOfBirth: string
  createdAt: string
}

interface CriminalFormValues {
  first_name: string
  last_name: string
  date_of_birth: string
  gender: string
  physical_description: string
  identification_number: string
  status: CriminalStatus
  wanted: boolean
  danger_level: DangerLevel
  known_aliases: string
  arrested_before: boolean
  arrest_count: string
}

const statusLabel: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  deceased: 'Deceased',
  deported: 'Deported',
  arrested: 'Arrested',
}

const dangerLabel: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

const normalizeAliases = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.join(', ')
  }

  if (typeof value === 'string') {
    return value
  }

  return value ? String(value) : ''
}

const parseAliases = (value: string) =>
  value
    .split(',')
    .map(alias => alias.trim())
    .filter(Boolean)

const initialFormValues: CriminalFormValues = {
  first_name: '',
  last_name: '',
  date_of_birth: '',
  gender: '',
  physical_description: '',
  identification_number: '',
  status: 'active',
  wanted: false,
  danger_level: 'medium',
  known_aliases: '',
  arrested_before: false,
  arrest_count: '0',
}

const formatDate = (value: string) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toISOString().split('T')[0]
}

type StatusFilter = 'all' | CriminalStatus

export default function AdminCriminalRecordsLive() {
  const [criminalRecords, setCriminalRecords] = useState<CriminalRecordData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCriminalId, setEditingCriminalId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<CriminalFormValues>(initialFormValues)
  const [formError, setFormError] = useState<string | null>(null)

  const fetchCriminals = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)

      const response = await adminAPI.getAllCriminals()
      const payload = response.data as {
        criminals?: Array<{
          id: string
          first_name?: string
          last_name?: string
          identification_number?: string
          gender?: string
          status?: string
          wanted?: boolean
          danger_level?: string
          arrest_count?: number
          date_of_birth?: string
          created_at?: string
        }>
      }

      const mappedRecords = (payload.criminals || []).map(criminal => ({
        id: criminal.id,
        firstName: criminal.first_name || '',
        lastName: criminal.last_name || '',
        name: `${criminal.first_name || ''} ${criminal.last_name || ''}`.trim() || 'Unknown Criminal',
        identificationNumber: criminal.identification_number || '-',
        gender: criminal.gender || '-',
        status: criminal.status || 'active',
        wanted: Boolean(criminal.wanted),
        dangerLevel: criminal.danger_level || 'medium',
        arrestCount: criminal.arrest_count || 0,
        dateOfBirth: criminal.date_of_birth || '-',
        createdAt: criminal.created_at || '-',
      }))

      setCriminalRecords(mappedRecords)
    } catch (error) {
      console.error('Failed to fetch admin criminals:', error)
      setLoadError('Unable to load criminals right now. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCriminals()
  }, [])

  const filteredCriminalRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return criminalRecords.filter(record => {
      const matchesStatus = statusFilter === 'all' ? true : record.status === statusFilter

      if (!normalizedQuery) {
        return matchesStatus
      }

      const matchesSearch =
        record.id.toLowerCase().includes(normalizedQuery) ||
        record.name.toLowerCase().includes(normalizedQuery) ||
        record.identificationNumber.toLowerCase().includes(normalizedQuery) ||
        record.gender.toLowerCase().includes(normalizedQuery) ||
        record.dangerLevel.toLowerCase().includes(normalizedQuery)

      return matchesStatus && matchesSearch
    })
  }, [criminalRecords, searchQuery, statusFilter])

  const wantedCount = useMemo(
    () => filteredCriminalRecords.filter(record => record.wanted).length,
    [filteredCriminalRecords],
  )

  const highRiskCount = useMemo(
    () => filteredCriminalRecords.filter(record => record.dangerLevel === 'high' || record.dangerLevel === 'critical').length,
    [filteredCriminalRecords],
  )

  const statusOptions: Array<StatusFilter> = ['all', 'active', 'inactive', 'deceased', 'deported']

  const criminalStatusOptions: CriminalStatus[] = ['active', 'inactive', 'deceased', 'deported']

  const openAddModal = () => {
    setEditingCriminalId(null)
    setFormValues(initialFormValues)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = async (criminalId: string) => {
    try {
      setEditingCriminalId(criminalId)
      setIsModalOpen(true)
      setFormError(null)

      const response = await adminAPI.getCriminalById(criminalId)
      const criminal = response.data?.criminal as {
        first_name?: string
        last_name?: string
        date_of_birth?: string | null
        gender?: string | null
        physical_description?: string | null
        identification_number?: string | null
        status?: CriminalStatus
        wanted?: boolean
        danger_level?: DangerLevel | string | null
        known_aliases?: string[] | string | null
        arrested_before?: boolean
        arrest_count?: number | null
      }

      setFormValues({
        first_name: criminal.first_name || '',
        last_name: criminal.last_name || '',
        date_of_birth: criminal.date_of_birth ? String(criminal.date_of_birth).slice(0, 10) : '',
        gender: criminal.gender || '',
        physical_description: criminal.physical_description || '',
        identification_number: criminal.identification_number || '',
        status: criminal.status || 'active',
        wanted: Boolean(criminal.wanted),
        danger_level: (criminal.danger_level as DangerLevel) || 'medium',
        known_aliases: normalizeAliases(criminal.known_aliases),
        arrested_before: Boolean(criminal.arrested_before),
        arrest_count: String(criminal.arrest_count ?? 0),
      })
    } catch (error) {
      console.error('Failed to load criminal for edit:', error)
      setLoadError('Unable to load criminal details right now. Please try again.')
      setIsModalOpen(false)
      setEditingCriminalId(null)
    }
  }

  const closeModal = () => {
    if (isSaving) return
    setIsModalOpen(false)
    setEditingCriminalId(null)
  }

  const updateForm = <K extends keyof CriminalFormValues>(field: K, value: CriminalFormValues[K]) => {
    setFormValues(previous => ({ ...previous, [field]: value }))
    if (formError) setFormError(null)
  }

  const handleSaveCriminal = async (event: import('react').FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formValues.first_name.trim() || !formValues.last_name.trim()) {
      setFormError('First name and last name are required.')
      return
    }

    const payload = {
      first_name: formValues.first_name.trim(),
      last_name: formValues.last_name.trim(),
      date_of_birth: formValues.date_of_birth || null,
      gender: formValues.gender || null,
      physical_description: formValues.physical_description.trim() || null,
      identification_number: formValues.identification_number.trim() || null,
      status: formValues.status,
      wanted: formValues.wanted,
      danger_level: formValues.danger_level,
      known_aliases: parseAliases(formValues.known_aliases),
      arrested_before: formValues.arrested_before,
      arrest_count: Number(formValues.arrest_count || 0),
    }

    try {
      setIsSaving(true)
      setFormError(null)

      if (editingCriminalId) {
        await adminAPI.updateCriminal(editingCriminalId, payload)
      } else {
        await adminAPI.createCriminal(payload)
      }

      await fetchCriminals()
      setIsModalOpen(false)
      setEditingCriminalId(null)
    } catch (error) {
      console.error('Failed to save criminal:', error)
      setFormError(editingCriminalId ? 'Unable to update criminal right now. Please try again.' : 'Unable to create criminal right now. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteCriminal = async (criminal: CriminalRecordData) => {
    const confirmed = window.confirm(`Delete criminal record \"${criminal.name}\"? This action cannot be undone.`)
    if (!confirmed) return

    try {
      setIsDeletingId(criminal.id)
      await adminAPI.deleteCriminal(criminal.id)
      await fetchCriminals()
    } catch (error) {
      console.error('Failed to delete criminal:', error)
      window.alert('Unable to delete criminal right now. Please try again.')
    } finally {
      setIsDeletingId(null)
    }
  }

  return (
    <section className="admin-criminals" aria-label="Criminal records management page">
      <header className="admin-criminals__header">
        <div>
          <h2>Criminal Records</h2>
          <p>Fetched live from GET /api/admin/criminals</p>
        </div>

        <button type="button" className="admin-criminals__add-btn" onClick={openAddModal}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M11 5h2v14h-2V5Zm-6 6h14v2H5v-2Z" fill="currentColor" />
          </svg>
          <span>Add</span>
        </button>
      </header>

      <div className="admin-criminals__toolbar">
        <label htmlFor="criminal-search" className="admin-criminals__search-wrap">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm0 2a5.5 5.5 0 1 0 3.45 9.78l4.13 4.13 1.42-1.42-4.13-4.13A5.5 5.5 0 0 0 10.5 5Z" fill="currentColor" />
          </svg>
          <input
            id="criminal-search"
            type="text"
            placeholder="Search by name, identification number, or ID..."
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
          />
        </label>

        <div className="admin-criminals__filter-wrap">
          <button
            type="button"
            className="admin-criminals__filter-btn"
            onClick={() => setIsFilterMenuOpen(previous => !previous)}
            aria-expanded={isFilterMenuOpen}
            aria-haspopup="menu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 5h18v2l-7 7v5l-4 2v-7L3 7V5Zm3 2 6 6.2V19l1-.5v-5.3L19 7H6Z" fill="currentColor" />
            </svg>
            <span>{statusFilter === 'all' ? 'Filter by status' : statusLabel[statusFilter]}</span>
          </button>

          {isFilterMenuOpen ? (
            <div className="admin-criminals__filter-menu" role="menu" aria-label="Filter records by status">
              {statusOptions.map(option => (
                <button
                  key={option}
                  type="button"
                  className={`admin-criminals__filter-item${statusFilter === option ? ' is-active' : ''}`}
                  onClick={() => {
                    setStatusFilter(option)
                    setIsFilterMenuOpen(false)
                  }}
                  role="menuitem"
                >
                  {option === 'all' ? 'All Statuses' : statusLabel[option]}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="admin-criminals__table-wrap">
        <table className="admin-criminals__table">
          <thead>
            <tr>
              <th>Criminal ID</th>
              <th>Name</th>
              <th>Identification No.</th>
              <th>Gender</th>
              <th>Status</th>
              <th>Wanted</th>
              <th>Danger</th>
              <th>Arrests</th>
              <th>DOB</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="admin-criminals__empty" colSpan={11}>
                  Loading criminals...
                </td>
              </tr>
            ) : null}

            {!isLoading && loadError ? (
              <tr>
                <td className="admin-criminals__empty" colSpan={11}>
                  {loadError}
                </td>
              </tr>
            ) : null}

            {!isLoading && !loadError
              ? filteredCriminalRecords.map(record => (
                  <tr key={record.id}>
                    <td className="admin-criminals__id">{record.id}</td>
                    <td>{record.name}</td>
                    <td>{record.identificationNumber}</td>
                    <td>{record.gender}</td>
                    <td>
                      <span className={`admin-criminals__status is-${record.status}`}>
                        {statusLabel[record.status] || record.status}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-criminals__wanted${record.wanted ? ' is-yes' : ' is-no'}`}>
                        {record.wanted ? 'Wanted' : 'Not Wanted'}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-criminals__severity is-${record.dangerLevel}`}>
                        {dangerLabel[record.dangerLevel] || record.dangerLevel}
                      </span>
                    </td>
                    <td>{record.arrestCount}</td>
                    <td>{formatDate(record.dateOfBirth)}</td>
                    <td>{formatDate(record.createdAt)}</td>
                    <td>
                      <div className="admin-criminals__actions">
                        <button type="button" className="admin-criminals__action-btn admin-criminals__action-btn--edit" onClick={() => openEditModal(record.id)} aria-label={`Edit ${record.name}`}>
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M3 17.25V21h3.75L17.8 9.95l-3.75-3.75L3 17.25Zm14.71-9.04a1 1 0 0 0 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-1.12 1.12 3.75 3.75 1.28-1.96Z" fill="currentColor" />
                          </svg>
                        </button>
                        <button type="button" className="admin-criminals__action-btn admin-criminals__action-btn--delete" onClick={() => handleDeleteCriminal(record)} aria-label={`Delete ${record.name}`} disabled={isDeletingId === record.id}>
                          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                            <path d="M6 7h12v2H6V7Zm2 3h8l-.67 9.33A2 2 0 0 1 13.34 21H10.66a2 2 0 0 1-1.99-1.67L8 10Zm3-6h2l1 1h4v2H4V5h4l1-1Z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              : null}

            {!isLoading && !loadError && filteredCriminalRecords.length === 0 ? (
              <tr>
                <td className="admin-criminals__empty" colSpan={11}>
                  No criminals found for the selected search and filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <section className="admin-criminals__summary" aria-label="Criminal summary statistics">
        <p className="admin-criminals__summary-note">Summary based on current table results</p>
        <article className="admin-criminals__summary-card">
          <p>Total Criminals</p>
          <strong>{filteredCriminalRecords.length}</strong>
        </article>
        <article className="admin-criminals__summary-card">
          <p>Wanted Criminals</p>
          <strong className="is-red">{wantedCount}</strong>
        </article>
        <article className="admin-criminals__summary-card">
          <p>High Risk / Critical</p>
          <strong className="is-blue">{highRiskCount}</strong>
        </article>
      </section>

      {isModalOpen ? (
        <div className="admin-criminals__modal-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-criminals-modal-title">
          <div className="admin-criminals__modal">
            <div className="admin-criminals__modal-header">
              <h3 id="admin-criminals-modal-title">{editingCriminalId ? 'Edit Criminal Record' : 'Add Criminal Record'}</h3>
              <button type="button" className="admin-criminals__modal-close" onClick={closeModal} aria-label="Close">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form className="admin-criminals__modal-form" onSubmit={handleSaveCriminal}>
              <div className="admin-criminals__modal-grid">
                <label>
                  <span>First Name</span>
                  <input type="text" value={formValues.first_name} onChange={event => updateForm('first_name', event.target.value)} />
                </label>
                <label>
                  <span>Last Name</span>
                  <input type="text" value={formValues.last_name} onChange={event => updateForm('last_name', event.target.value)} />
                </label>
                <label>
                  <span>Identification Number</span>
                  <input type="text" value={formValues.identification_number} onChange={event => updateForm('identification_number', event.target.value)} />
                </label>
                <label>
                  <span>Date of Birth</span>
                  <input type="date" value={formValues.date_of_birth} onChange={event => updateForm('date_of_birth', event.target.value)} />
                </label>
                <label>
                  <span>Gender</span>
                  <input type="text" value={formValues.gender} onChange={event => updateForm('gender', event.target.value)} />
                </label>
                <label>
                  <span>Status</span>
                  <select value={formValues.status} onChange={event => updateForm('status', event.target.value as CriminalStatus)}>
                    {criminalStatusOptions.map(option => (
                      <option key={option} value={option}>{statusLabel[option] || option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Danger Level</span>
                  <select value={formValues.danger_level} onChange={event => updateForm('danger_level', event.target.value as DangerLevel)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </label>
                <label>
                  <span>Arrest Count</span>
                  <input type="number" min="0" value={formValues.arrest_count} onChange={event => updateForm('arrest_count', event.target.value)} />
                </label>
              </div>

              <label>
                <span>Physical Description</span>
                <textarea value={formValues.physical_description} onChange={event => updateForm('physical_description', event.target.value)} />
              </label>

              <label>
                <span>Known Aliases</span>
                <textarea value={formValues.known_aliases} onChange={event => updateForm('known_aliases', event.target.value)} />
              </label>

              <div className="admin-criminals__modal-flags">
                <label className="admin-criminals__check-item">
                  <input type="checkbox" checked={formValues.wanted} onChange={event => updateForm('wanted', event.target.checked)} />
                  <span>Wanted</span>
                </label>
                <label className="admin-criminals__check-item">
                  <input type="checkbox" checked={formValues.arrested_before} onChange={event => updateForm('arrested_before', event.target.checked)} />
                  <span>Arrested Before</span>
                </label>
              </div>

              {formError ? <small className="admin-criminals__form-error">{formError}</small> : null}

              <div className="admin-criminals__modal-actions">
                <button type="button" className="admin-criminals__modal-btn is-muted" onClick={closeModal} disabled={isSaving}>Cancel</button>
                <button type="submit" className="admin-criminals__modal-btn is-primary" disabled={isSaving}>{isSaving ? 'Saving...' : (editingCriminalId ? 'Update Record' : 'Create Record')}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
