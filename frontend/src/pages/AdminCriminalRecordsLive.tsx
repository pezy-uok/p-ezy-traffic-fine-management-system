import { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '@/api'
import './AdminCriminalRecords.css'

type CriminalStatus = 'active' | 'inactive' | 'deceased' | 'deported'
type DangerLevel = 'low' | 'medium' | 'high' | 'critical'

interface CriminalRecordData {
  id: string
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

const statusLabel: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  deceased: 'Deceased',
  deported: 'Deported',
}

const dangerLabel: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
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

  return (
    <section className="admin-criminals" aria-label="Criminal records management page">
      <header className="admin-criminals__header">
        <div>
          <h2>Criminal Records</h2>
          <p>Fetched live from GET /api/admin/criminals</p>
        </div>

        <button type="button" className="admin-criminals__add-btn" onClick={fetchCriminals}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M11 5h2v14h-2V5Zm-6 6h14v2H5v-2Z" fill="currentColor" />
          </svg>
          <span>Refresh</span>
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
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="admin-criminals__empty" colSpan={10}>
                  Loading criminals...
                </td>
              </tr>
            ) : null}

            {!isLoading && loadError ? (
              <tr>
                <td className="admin-criminals__empty" colSpan={10}>
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
                  </tr>
                ))
              : null}

            {!isLoading && !loadError && filteredCriminalRecords.length === 0 ? (
              <tr>
                <td className="admin-criminals__empty" colSpan={10}>
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
    </section>
  )
}
