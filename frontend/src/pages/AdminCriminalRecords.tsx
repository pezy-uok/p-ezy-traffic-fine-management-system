import { useMemo, useState } from 'react'
import './AdminCriminalRecords.css'

interface CriminalRecordData {
  id: string
  name: string
  caseNumber: string
  offense: string
  severity: 'critical' | 'high' | 'medium'
  status: 'open' | 'closed' | 'under-investigation'
  date: string
}

const initialCriminalRecords: CriminalRecordData[] = [
  {
    id: 'CR001',
    name: 'Samayan Ahmed Roskey',
    caseNumber: 'CASE-2024-0125',
    offense: 'Armed Robbery',
    severity: 'medium',
    status: 'under-investigation',
    date: '2025-10-15',
  },
  {
    id: 'CR002',
    name: 'Dilshan Fernando',
    caseNumber: 'CASE-2024-0156',
    offense: 'Counterfeit Currency',
    severity: 'high',
    status: 'under-investigation',
    date: '2026-01-05',
  },
  {
    id: 'CR003',
    name: 'Unknown Suspect',
    caseNumber: 'CASE-2024-0089',
    offense: 'Gang Activity',
    severity: 'critical',
    status: 'open',
    date: '2025-11-20',
  },
  {
    id: 'CR004',
    name: 'Roshan Jayasuriya',
    caseNumber: 'CASE-2024-0142',
    offense: 'Drug Trafficking',
    severity: 'high',
    status: 'closed',
    date: '2026-02-10',
  },
  {
    id: 'CR005',
    name: 'Prabath Silva',
    caseNumber: 'CASE-2024-0167',
    offense: 'Assault',
    severity: 'high',
    status: 'closed',
    date: '2026-01-25',
  },
]

const severityLabel: Record<CriminalRecordData['severity'], string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
}

const statusLabel: Record<CriminalRecordData['status'], string> = {
  open: 'Open',
  closed: 'Closed',
  'under-investigation': 'Under Investigation',
}

type StatusFilter = 'all' | CriminalRecordData['status']
type CriminalModalMode = 'add' | 'edit' | 'view'

export default function AdminCriminalRecords() {
  const [criminalRecords, setCriminalRecords] = useState<CriminalRecordData[]>(initialCriminalRecords)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<CriminalRecordData | null>(null)
  const [modalMode, setModalMode] = useState<CriminalModalMode>('add')
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [formValues, setFormValues] = useState<CriminalRecordData>({
    id: '',
    name: '',
    caseNumber: '',
    offense: '',
    severity: 'medium',
    status: 'open',
    date: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CriminalRecordData, string>>>({})

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
        record.caseNumber.toLowerCase().includes(normalizedQuery) ||
        record.offense.toLowerCase().includes(normalizedQuery)

      return matchesStatus && matchesSearch
    })
  }, [criminalRecords, searchQuery, statusFilter])

  const totalRecords = filteredCriminalRecords.length
  const openCases = filteredCriminalRecords.filter(r => r.status === 'open').length
  const underInvestigation = filteredCriminalRecords.filter(r => r.status === 'under-investigation').length
  const criticalCases = filteredCriminalRecords.filter(r => r.severity === 'critical').length

  const openAddRecordModal = () => {
    setModalMode('add')
    setEditingRecordId(null)
    setIsModalOpen(true)
    setIsFilterMenuOpen(false)
    setFormValues({
      id: '',
      name: '',
      caseNumber: '',
      offense: '',
      severity: 'medium',
      status: 'open',
      date: '',
    })
    setFormErrors({})
  }

  const openViewRecordModal = (record: CriminalRecordData) => {
    setModalMode('view')
    setEditingRecordId(record.id)
    setIsModalOpen(true)
    setIsFilterMenuOpen(false)
    setFormValues(record)
  }

  const openEditRecordModal = (record: CriminalRecordData) => {
    setModalMode('edit')
    setEditingRecordId(record.id)
    setIsModalOpen(true)
    setIsFilterMenuOpen(false)
    setFormErrors({})
    setFormValues(record)
  }

  const closeRecordModal = () => {
    setIsModalOpen(false)
    setModalMode('add')
    setEditingRecordId(null)
    setFormErrors({})
    setFormValues({
      id: '',
      name: '',
      caseNumber: '',
      offense: '',
      severity: 'medium',
      status: 'open',
      date: '',
    })
  }

  const updateFormValue = <K extends keyof CriminalRecordData>(field: K, value: CriminalRecordData[K]) => {
    setFormValues(previous => ({ ...previous, [field]: value }))

    if (formErrors[field]) {
      setFormErrors(previous => ({ ...previous, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof CriminalRecordData, string>> = {}

    if (!formValues.id.trim()) {
      nextErrors.id = 'Record ID is required.'
    } else if (
      criminalRecords.some(
        record =>
          record.id.toLowerCase() === formValues.id.trim().toLowerCase() &&
          record.id !== editingRecordId,
      )
    ) {
      nextErrors.id = 'Record ID already exists.'
    }

    if (!formValues.name.trim()) {
      nextErrors.name = 'Name is required.'
    }

    if (!formValues.caseNumber.trim()) {
      nextErrors.caseNumber = 'Case number is required.'
    }

    if (!formValues.offense.trim()) {
      nextErrors.offense = 'Offense is required.'
    }

    if (!formValues.date) {
      nextErrors.date = 'Date is required.'
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const formattedRecord: CriminalRecordData = {
      ...formValues,
      id: formValues.id.trim().toUpperCase(),
      name: formValues.name.trim(),
      caseNumber: formValues.caseNumber.trim().toUpperCase(),
      offense: formValues.offense.trim(),
    }

    if (modalMode === 'edit' && editingRecordId) {
      setCriminalRecords(previous =>
        previous.map(record => (record.id === editingRecordId ? formattedRecord : record)),
      )
    } else {
      setCriminalRecords(previous => [formattedRecord, ...previous])
    }

    closeRecordModal()
  }

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value)
    setIsFilterMenuOpen(false)
  }

  const openDeleteDialog = (record: CriminalRecordData) => {
    setRecordToDelete(record)
    setIsFilterMenuOpen(false)
  }

  const closeDeleteDialog = () => {
    setRecordToDelete(null)
  }

  const handleConfirmDelete = () => {
    if (!recordToDelete) {
      return
    }

    setCriminalRecords(previous => previous.filter(record => record.id !== recordToDelete.id))
    setRecordToDelete(null)
  }

  return (
    <section className="admin-criminals" aria-label="Criminal records management page">
      <header className="admin-criminals__header">
        <div>
          <h2>Criminal Records</h2>
          <p>Manage criminal cases and records</p>
        </div>

        <button type="button" className="admin-criminals__add-btn" onClick={openAddRecordModal}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M11 5h2v14h-2V5Zm-6 6h14v2H5v-2Z" fill="currentColor" />
          </svg>
          <span>New Record</span>
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
            placeholder="Search by name, case number, or offense..."
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
            <span>{statusFilter === 'all' ? 'Filter' : statusLabel[statusFilter]}</span>
          </button>

          {isFilterMenuOpen ? (
            <div className="admin-criminals__filter-menu" role="menu" aria-label="Filter records by status">
              <button
                type="button"
                className={`admin-criminals__filter-item${statusFilter === 'all' ? ' is-active' : ''}`}
                onClick={() => handleStatusFilterChange('all')}
                role="menuitem"
              >
                All Statuses
              </button>
              <button
                type="button"
                className={`admin-criminals__filter-item${statusFilter === 'open' ? ' is-active' : ''}`}
                onClick={() => handleStatusFilterChange('open')}
                role="menuitem"
              >
                Open
              </button>
              <button
                type="button"
                className={`admin-criminals__filter-item${statusFilter === 'under-investigation' ? ' is-active' : ''}`}
                onClick={() => handleStatusFilterChange('under-investigation')}
                role="menuitem"
              >
                Under Investigation
              </button>
              <button
                type="button"
                className={`admin-criminals__filter-item${statusFilter === 'closed' ? ' is-active' : ''}`}
                onClick={() => handleStatusFilterChange('closed')}
                role="menuitem"
              >
                Closed
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="admin-criminals__table-wrap">
        <table className="admin-criminals__table">
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Name</th>
              <th>Case Number</th>
              <th>Offense</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCriminalRecords.map(record => (
              <tr key={record.id}>
                <td className="admin-criminals__id">{record.id}</td>
                <td>{record.name}</td>
                <td>{record.caseNumber}</td>
                <td>{record.offense}</td>
                <td>
                  <span className={`admin-criminals__severity is-${record.severity}`}>
                    {severityLabel[record.severity]}
                  </span>
                </td>
                <td>
                  <span className={`admin-criminals__status is-${record.status}`}>
                    {statusLabel[record.status]}
                  </span>
                </td>
                <td>{record.date}</td>
                <td>
                  <div className="admin-criminals__actions">
                    <button
                      type="button"
                      className="admin-criminals__action-btn admin-criminals__action-btn--view"
                      aria-label={`View ${record.id}`}
                      onClick={() => openViewRecordModal(record)}
                      title="View record"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="admin-criminals__action-btn admin-criminals__action-btn--edit"
                      aria-label={`Edit ${record.id}`}
                      onClick={() => openEditRecordModal(record)}
                      title="Edit record"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M16.7 3.3a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4l-9.8 9.8-4.4 1.1 1.1-4.4 9.1-9.1Zm1.1 2.1-8.7 8.7-.4 1.6 1.6-.4 8.7-8.7-1.2-1.2Z" fill="currentColor" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="admin-criminals__action-btn admin-criminals__action-btn--delete"
                      aria-label={`Delete ${record.id}`}
                      onClick={() => openDeleteDialog(record)}
                      title="Delete record"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M9 4h6l1 2h4v2H4V6h4l1-2Zm-2 6h2v8H7v-8Zm4 0h2v8h-2v-8Zm4 0h2v8h-2v-8ZM6 20V9h12v11H6Z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredCriminalRecords.length === 0 ? (
              <tr>
                <td className="admin-criminals__empty" colSpan={8}>
                  No criminal records found for the selected search and filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <section className="admin-criminals__summary" aria-label="Criminal records summary statistics">
        <article className="admin-criminals__summary-card">
          <p>Total Records</p>
          <strong>{totalRecords}</strong>
        </article>
        <article className="admin-criminals__summary-card">
          <p>Open Cases</p>
          <strong className="is-red">{openCases}</strong>
        </article>
        <article className="admin-criminals__summary-card">
          <p>Under Investigation</p>
          <strong className="is-blue">{underInvestigation}</strong>
        </article>
        <article className="admin-criminals__summary-card">
          <p>Critical Cases</p>
          <strong className="is-orange">{criticalCases}</strong>
        </article>
      </section>

      {isModalOpen ? (
        <div className="admin-criminals__modal-overlay" role="dialog" aria-modal="true" aria-labelledby="criminal-modal-title">
          <div className="admin-criminals__modal">
            <div className="admin-criminals__modal-header">
              <h3 id="criminal-modal-title">
                {modalMode === 'view' ? 'View Record' : modalMode === 'edit' ? 'Edit Record' : 'Add New Record'}
              </h3>
              <button type="button" className="admin-criminals__modal-close" onClick={closeRecordModal} aria-label="Close record form">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5Z" fill="currentColor" />
                </svg>
              </button>
            </div>

            <form className="admin-criminals__modal-form" onSubmit={handleFormSubmit}>
              <label>
                Record ID
                <input
                  type="text"
                  value={formValues.id}
                  onChange={event => updateFormValue('id', event.target.value)}
                  placeholder="e.g., CR006"
                  disabled={modalMode === 'view'}
                  aria-invalid={Boolean(formErrors.id)}
                />
                {formErrors.id ? <span className="admin-criminals__field-error">{formErrors.id}</span> : null}
              </label>

              <label>
                Name
                <input
                  type="text"
                  value={formValues.name}
                  onChange={event => updateFormValue('name', event.target.value)}
                  placeholder="Full name"
                  disabled={modalMode === 'view'}
                  aria-invalid={Boolean(formErrors.name)}
                />
                {formErrors.name ? <span className="admin-criminals__field-error">{formErrors.name}</span> : null}
              </label>

              <label>
                Case Number
                <input
                  type="text"
                  value={formValues.caseNumber}
                  onChange={event => updateFormValue('caseNumber', event.target.value)}
                  placeholder="e.g., CASE-2026-0001"
                  disabled={modalMode === 'view'}
                  aria-invalid={Boolean(formErrors.caseNumber)}
                />
                {formErrors.caseNumber ? <span className="admin-criminals__field-error">{formErrors.caseNumber}</span> : null}
              </label>

              <label>
                Offense
                <input
                  type="text"
                  value={formValues.offense}
                  onChange={event => updateFormValue('offense', event.target.value)}
                  placeholder="Type of offense"
                  disabled={modalMode === 'view'}
                  aria-invalid={Boolean(formErrors.offense)}
                />
                {formErrors.offense ? <span className="admin-criminals__field-error">{formErrors.offense}</span> : null}
              </label>

              <label>
                Severity
                <select
                  value={formValues.severity}
                  onChange={event => updateFormValue('severity', event.target.value as CriminalRecordData['severity'])}
                  disabled={modalMode === 'view'}
                >
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>

              <label>
                Status
                <select
                  value={formValues.status}
                  onChange={event => updateFormValue('status', event.target.value as CriminalRecordData['status'])}
                  disabled={modalMode === 'view'}
                >
                  <option value="open">Open</option>
                  <option value="under-investigation">Under Investigation</option>
                  <option value="closed">Closed</option>
                </select>
              </label>

              <label>
                Date
                <input
                  type="date"
                  value={formValues.date}
                  onChange={event => updateFormValue('date', event.target.value)}
                  disabled={modalMode === 'view'}
                  aria-invalid={Boolean(formErrors.date)}
                />
                {formErrors.date ? <span className="admin-criminals__field-error">{formErrors.date}</span> : null}
              </label>

              <div className="admin-criminals__modal-actions">
                <button type="button" className="admin-criminals__btn-secondary" onClick={closeRecordModal}>
                  {modalMode === 'view' ? 'Close' : 'Cancel'}
                </button>
                {modalMode !== 'view' ? (
                  <button type="submit" className="admin-criminals__btn-primary">
                    {modalMode === 'edit' ? 'Update Record' : 'Save Record'}
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {recordToDelete ? (
        <div className="admin-criminals__modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-criminal-title">
          <div className="admin-criminals__modal admin-criminals__modal--compact">
            <div className="admin-criminals__modal-header">
              <h3 id="delete-criminal-title">Delete Record</h3>
            </div>

            <div className="admin-criminals__modal-body">
              <p>
                Are you sure you want to delete the criminal record <strong>{recordToDelete.id}</strong> ({recordToDelete.name})? This
                action cannot be undone.
              </p>
            </div>

            <div className="admin-criminals__modal-actions">
              <button type="button" className="admin-criminals__btn-secondary" onClick={closeDeleteDialog}>
                Cancel
              </button>
              <button type="button" className="admin-criminals__btn-danger" onClick={handleConfirmDelete}>
                Delete Record
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
