import { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '@/api'
import './AdminFineManagement.css'

interface FineRecord {
  id: string
  offender: string
  violation: string
  amount: string
  date: string
  status: 'paid' | 'pending' | 'overdue'
}

const initialFineRecords: FineRecord[] = []

const statusLabel: Record<FineRecord['status'], string> = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
}

type StatusFilter = 'all' | FineRecord['status']
type FineModalMode = 'add' | 'edit'

export default function AdminFineManagement() {
  const [fineRecords, setFineRecords] = useState<FineRecord[]>(initialFineRecords)
  const [isLoadingFines, setIsLoadingFines] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [fineToDelete, setFineToDelete] = useState<FineRecord | null>(null)
  const [modalMode, setModalMode] = useState<FineModalMode>('add')
  const [editingFineId, setEditingFineId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [formValues, setFormValues] = useState<FineRecord>({
    id: '',
    offender: '',
    violation: '',
    amount: '',
    date: '',
    status: 'pending',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FineRecord, string>>>({})

  useEffect(() => {
    const fetchFines = async () => {
      try {
        setIsLoadingFines(true)
        setLoadError(null)

        const response = await adminAPI.getAllFines()
        const payload = response.data as {
          fines?: Array<{
            id: string
            offender?: string
            violation?: string
            amount?: number | string
            date?: string | null
            status?: 'paid' | 'pending' | 'overdue'
          }>
        }

        const mapped = (payload.fines || []).map((fine) => {
          const numericAmount = Number(fine.amount || 0)

          return {
            id: fine.id,
            offender: fine.offender || 'Unknown Driver',
            violation: fine.violation || 'N/A',
            amount: `LKR ${numericAmount.toLocaleString('en-LK')}`,
            date: fine.date || '-',
            status: fine.status || 'pending',
          } as FineRecord
        })

        setFineRecords(mapped)
      } catch (error) {
        console.error('Failed to fetch admin fines:', error)
        setLoadError('Unable to load fines right now. Please refresh.')
      } finally {
        setIsLoadingFines(false)
      }
    }

    fetchFines()
  }, [])

  const filteredFineRecords = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return fineRecords.filter(record => {
      const matchesStatus = statusFilter === 'all' ? true : record.status === statusFilter

      if (!normalizedQuery) {
        return matchesStatus
      }

      const matchesSearch =
        record.id.toLowerCase().includes(normalizedQuery) ||
        record.offender.toLowerCase().includes(normalizedQuery) ||
        record.violation.toLowerCase().includes(normalizedQuery)

      return matchesStatus && matchesSearch
    })
  }, [fineRecords, searchQuery, statusFilter])

  const filteredTotalAmount = useMemo(
    () =>
      filteredFineRecords.reduce((sum, record) => {
        const numericValue = Number(record.amount.replace(/[^0-9.]/g, ''))
        return sum + (Number.isFinite(numericValue) ? numericValue : 0)
      }, 0),
    [filteredFineRecords],
  )

  const filteredOverdueCount = useMemo(
    () => filteredFineRecords.filter(record => record.status === 'overdue').length,
    [filteredFineRecords],
  )

  const openAddFineModal = () => {
    setModalMode('add')
    setEditingFineId(null)
    setIsModalOpen(true)
    setIsFilterMenuOpen(false)
  }

  const openEditFineModal = (record: FineRecord) => {
    setModalMode('edit')
    setEditingFineId(record.id)
    setIsModalOpen(true)
    setIsFilterMenuOpen(false)
    setFormErrors({})
    setFormValues({
      ...record,
      amount: record.amount.replace(/[^0-9.]/g, ''),
    })
  }

  const closeFineModal = () => {
    setIsModalOpen(false)
    setModalMode('add')
    setEditingFineId(null)
    setFormErrors({})
    setFormValues({
      id: '',
      offender: '',
      violation: '',
      amount: '',
      date: '',
      status: 'pending',
    })
  }

  const updateFormValue = <K extends keyof FineRecord>(field: K, value: FineRecord[K]) => {
    setFormValues(previous => ({ ...previous, [field]: value }))

    if (formErrors[field]) {
      setFormErrors(previous => ({ ...previous, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const nextErrors: Partial<Record<keyof FineRecord, string>> = {}

    if (!formValues.id.trim()) {
      nextErrors.id = 'Fine ID is required.'
    } else if (
      fineRecords.some(
        record =>
          record.id.toLowerCase() === formValues.id.trim().toLowerCase() &&
          record.id !== editingFineId,
      )
    ) {
      nextErrors.id = 'Fine ID already exists.'
    }

    if (!formValues.offender.trim()) {
      nextErrors.offender = 'Offender name is required.'
    }

    if (!formValues.violation.trim()) {
      nextErrors.violation = 'Violation is required.'
    }

    const rawAmount = formValues.amount.replace(/[^0-9.]/g, '')
    const numericAmount = Number(rawAmount)

    if (!rawAmount) {
      nextErrors.amount = 'Amount is required.'
    } else if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      nextErrors.amount = 'Amount must be a valid number greater than 0.'
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

    const numericAmount = Number(formValues.amount.replace(/[^0-9.]/g, ''))
    const formattedRecord: FineRecord = {
      ...formValues,
      id: formValues.id.trim().toUpperCase(),
      offender: formValues.offender.trim(),
      violation: formValues.violation.trim(),
      amount: `LKR ${numericAmount.toLocaleString('en-LK')}`,
    }

    if (modalMode === 'edit' && editingFineId) {
      setFineRecords(previous =>
        previous.map(record => (record.id === editingFineId ? formattedRecord : record)),
      )
    } else {
      setFineRecords(previous => [formattedRecord, ...previous])
    }

    closeFineModal()
  }

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value)
    setIsFilterMenuOpen(false)
  }

  const openDeleteDialog = (record: FineRecord) => {
    setFineToDelete(record)
    setIsFilterMenuOpen(false)
  }

  const closeDeleteDialog = () => {
    setFineToDelete(null)
  }

  const handleConfirmDelete = () => {
    if (!fineToDelete) {
      return
    }

    setFineRecords(previous => previous.filter(record => record.id !== fineToDelete.id))
    setFineToDelete(null)
  }

  return (
    <section className="admin-fines" aria-label="Fine management page">
      <header className="admin-fines__header">
        <div>
          <h2>Fine Management</h2>
          <p>Manage traffic fines and violations</p>
        </div>

        <button type="button" className="admin-fines__add-btn" onClick={openAddFineModal}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M11 5h2v14h-2V5Zm-6 6h14v2H5v-2Z" fill="currentColor" />
          </svg>
          <span>Add Fine</span>
        </button>
      </header>

      <div className="admin-fines__toolbar">
        <label htmlFor="fine-search" className="admin-fines__search-wrap">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm0 2a5.5 5.5 0 1 0 3.45 9.78l4.13 4.13 1.42-1.42-4.13-4.13A5.5 5.5 0 0 0 10.5 5Z" fill="currentColor" />
          </svg>
          <input
            id="fine-search"
            type="text"
            placeholder="Search by offender, violation, or ID..."
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
          />
        </label>

        <div className="admin-fines__filter-wrap">
          <button
            type="button"
            className="admin-fines__filter-btn"
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
            <div className="admin-fines__filter-menu" role="menu" aria-label="Filter fines by status">
              <button
                type="button"
                className={`admin-fines__filter-item${statusFilter === 'all' ? ' is-active' : ''}`}
                onClick={() => handleStatusFilterChange('all')}
                role="menuitem"
              >
                All Statuses
              </button>
              <button
                type="button"
                className={`admin-fines__filter-item${statusFilter === 'paid' ? ' is-active' : ''}`}
                onClick={() => handleStatusFilterChange('paid')}
                role="menuitem"
              >
                Paid
              </button>
              <button
                type="button"
                className={`admin-fines__filter-item${statusFilter === 'pending' ? ' is-active' : ''}`}
                onClick={() => handleStatusFilterChange('pending')}
                role="menuitem"
              >
                Pending
              </button>
              <button
                type="button"
                className={`admin-fines__filter-item${statusFilter === 'overdue' ? ' is-active' : ''}`}
                onClick={() => handleStatusFilterChange('overdue')}
                role="menuitem"
              >
                Overdue
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="admin-fines__table-wrap">
        <table className="admin-fines__table">
          <thead>
            <tr>
              <th>Fine ID</th>
              <th>Offender</th>
              <th>Violation</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingFines ? (
              <tr>
                <td className="admin-fines__empty" colSpan={7}>
                  Loading fines...
                </td>
              </tr>
            ) : null}

            {!isLoadingFines && loadError ? (
              <tr>
                <td className="admin-fines__empty" colSpan={7}>
                  {loadError}
                </td>
              </tr>
            ) : null}

            {!isLoadingFines && !loadError ? filteredFineRecords.map(record => (
              <tr key={record.id}>
                <td className="admin-fines__id">{record.id}</td>
                <td>{record.offender}</td>
                <td>{record.violation}</td>
                <td className="admin-fines__amount">{record.amount}</td>
                <td>{record.date}</td>
                <td>
                  <span className={`admin-fines__status is-${record.status}`}>{statusLabel[record.status]}</span>
                </td>
                <td>
                  <div className="admin-fines__actions">
                    <button type="button" aria-label={`Edit ${record.id}`} onClick={() => openEditFineModal(record)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M16.7 3.3a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4l-9.8 9.8-4.4 1.1 1.1-4.4 9.1-9.1Zm1.1 2.1-8.7 8.7-.4 1.6 1.6-.4 8.7-8.7-1.2-1.2Z" fill="currentColor" />
                      </svg>
                    </button>
                    <button type="button" aria-label={`Delete ${record.id}`} onClick={() => openDeleteDialog(record)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M9 4h6l1 2h4v2H4V6h4l1-2Zm-2 6h2v8H7v-8Zm4 0h2v8h-2v-8Zm4 0h2v8h-2v-8ZM6 20V9h12v11H6Z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )) : null}
            {!isLoadingFines && !loadError && filteredFineRecords.length === 0 ? (
              <tr>
                <td className="admin-fines__empty" colSpan={7}>
                  No fines found for the selected search and filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <section className="admin-fines__summary" aria-label="Fine summary statistics">
        <p className="admin-fines__summary-note">Summary based on current table results</p>
        <article className="admin-fines__summary-card">
          <p>Total Fines</p>
          <strong>{filteredFineRecords.length}</strong>
        </article>
        <article className="admin-fines__summary-card">
          <p>Total Amount Due</p>
          <strong className="is-blue">LKR {filteredTotalAmount.toLocaleString('en-LK')}</strong>
        </article>
        <article className="admin-fines__summary-card">
          <p>Overdue Fines</p>
          <strong className="is-red">{filteredOverdueCount}</strong>
        </article>
      </section>

      {isModalOpen ? (
        <div className="admin-fines__modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-fine-title">
          <div className="admin-fines__modal">
            <div className="admin-fines__modal-header">
              <h3 id="add-fine-title">{modalMode === 'edit' ? 'Edit Fine' : 'Add Fine'}</h3>
              <button type="button" className="admin-fines__modal-close" onClick={closeFineModal} aria-label="Close fine form">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5Z" fill="currentColor" />
                </svg>
              </button>
            </div>

            <form className="admin-fines__modal-form" onSubmit={handleFormSubmit}>
              <label>
                Fine ID
                <input
                  type="text"
                  value={formValues.id}
                  onChange={event => updateFormValue('id', event.target.value)}
                  placeholder="F006"
                  aria-invalid={Boolean(formErrors.id)}
                />
                {formErrors.id ? <span className="admin-fines__field-error">{formErrors.id}</span> : null}
              </label>

              <label>
                Offender
                <input
                  type="text"
                  value={formValues.offender}
                  onChange={event => updateFormValue('offender', event.target.value)}
                  placeholder="Offender name"
                  aria-invalid={Boolean(formErrors.offender)}
                />
                {formErrors.offender ? <span className="admin-fines__field-error">{formErrors.offender}</span> : null}
              </label>

              <label>
                Violation
                <input
                  type="text"
                  value={formValues.violation}
                  onChange={event => updateFormValue('violation', event.target.value)}
                  placeholder="Violation type"
                  aria-invalid={Boolean(formErrors.violation)}
                />
                {formErrors.violation ? <span className="admin-fines__field-error">{formErrors.violation}</span> : null}
              </label>

              <label>
                Amount (LKR)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formValues.amount.replace(/[^0-9.]/g, '')}
                  onChange={event => updateFormValue('amount', event.target.value)}
                  placeholder="250"
                  aria-invalid={Boolean(formErrors.amount)}
                />
                {formErrors.amount ? <span className="admin-fines__field-error">{formErrors.amount}</span> : null}
              </label>

              <label>
                Date
                <input
                  type="date"
                  value={formValues.date}
                  onChange={event => updateFormValue('date', event.target.value)}
                  aria-invalid={Boolean(formErrors.date)}
                />
                {formErrors.date ? <span className="admin-fines__field-error">{formErrors.date}</span> : null}
              </label>

              <label>
                Status
                <select
                  value={formValues.status}
                  onChange={event => updateFormValue('status', event.target.value as FineRecord['status'])}
                >
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </label>

              <div className="admin-fines__modal-actions">
                <button type="button" className="admin-fines__btn-secondary" onClick={closeFineModal}>Cancel</button>
                <button type="submit" className="admin-fines__btn-primary">
                  {modalMode === 'edit' ? 'Update Fine' : 'Save Fine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {fineToDelete ? (
        <div className="admin-fines__modal-overlay" role="dialog" aria-modal="true" aria-labelledby="delete-fine-title">
          <div className="admin-fines__modal admin-fines__modal--compact">
            <div className="admin-fines__modal-header">
              <h3 id="delete-fine-title">Delete Fine</h3>
              <button type="button" className="admin-fines__modal-close" onClick={closeDeleteDialog} aria-label="Close delete confirmation">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6.4 5 12 10.6 17.6 5 19 6.4 13.4 12 19 17.6 17.6 19 12 13.4 6.4 19 5 17.6 10.6 12 5 6.4 6.4 5Z" fill="currentColor" />
                </svg>
              </button>
            </div>

            <p className="admin-fines__confirm-text">
              Are you sure you want to delete fine <strong>{fineToDelete.id}</strong> for <strong>{fineToDelete.offender}</strong>?
            </p>

            <div className="admin-fines__modal-actions">
              <button type="button" className="admin-fines__btn-secondary" onClick={closeDeleteDialog}>Cancel</button>
              <button type="button" className="admin-fines__btn-danger" onClick={handleConfirmDelete}>Delete Fine</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
