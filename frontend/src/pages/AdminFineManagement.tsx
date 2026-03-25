import { useMemo, useState } from 'react'
import './AdminFineManagement.css'

interface FineRecord {
  id: string
  offender: string
  violation: string
  amount: string
  date: string
  status: 'paid' | 'pending' | 'overdue'
}

const initialFineRecords: FineRecord[] = [
  {
    id: 'F001',
    offender: 'Nimal Perera',
    violation: 'Speeding',
    amount: 'LKR 250',
    date: '2026-03-18',
    status: 'paid',
  },
  {
    id: 'F002',
    offender: 'Kasun Silva',
    violation: 'No Seat Belt',
    amount: 'LKR 100',
    date: '2026-03-20',
    status: 'pending',
  },
  {
    id: 'F003',
    offender: 'Amila Fernando',
    violation: 'Signal Jumping',
    amount: 'LKR 350',
    date: '2026-03-17',
    status: 'overdue',
  },
  {
    id: 'F004',
    offender: 'Sanduni Jayasuriya',
    violation: 'Illegal Parking',
    amount: 'LKR 150',
    date: '2026-03-22',
    status: 'paid',
  },
  {
    id: 'F005',
    offender: 'Ravindu Senanayake',
    violation: 'Overtaking Violation',
    amount: 'LKR 500',
    date: '2026-03-15',
    status: 'pending',
  },
]

const statusLabel: Record<FineRecord['status'], string> = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
}

export default function AdminFineManagement() {
  const [fineRecords, setFineRecords] = useState<FineRecord[]>(initialFineRecords)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formValues, setFormValues] = useState<FineRecord>({
    id: '',
    offender: '',
    violation: '',
    amount: '',
    date: '',
    status: 'pending',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FineRecord, string>>>({})

  const totalAmount = useMemo(
    () =>
      fineRecords.reduce((sum, record) => {
        const numericValue = Number(record.amount.replace(/[^0-9.]/g, ''))
        return sum + (Number.isFinite(numericValue) ? numericValue : 0)
      }, 0),
    [fineRecords],
  )

  const overdueCount = useMemo(
    () => fineRecords.filter(record => record.status === 'overdue').length,
    [fineRecords],
  )

  const openAddFineModal = () => {
    setIsModalOpen(true)
  }

  const closeAddFineModal = () => {
    setIsModalOpen(false)
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
    } else if (fineRecords.some(record => record.id.toLowerCase() === formValues.id.trim().toLowerCase())) {
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

    setFineRecords(previous => [formattedRecord, ...previous])
    closeAddFineModal()
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
            readOnly
          />
        </label>

        <button type="button" className="admin-fines__filter-btn">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M3 5h18v2l-7 7v5l-4 2v-7L3 7V5Zm3 2 6 6.2V19l1-.5v-5.3L19 7H6Z" fill="currentColor" />
          </svg>
          <span>Filter</span>
        </button>
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
            {fineRecords.map(record => (
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
                    <button type="button" aria-label={`Edit ${record.id}`}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M16.7 3.3a1 1 0 0 1 1.4 0l2.6 2.6a1 1 0 0 1 0 1.4l-9.8 9.8-4.4 1.1 1.1-4.4 9.1-9.1Zm1.1 2.1-8.7 8.7-.4 1.6 1.6-.4 8.7-8.7-1.2-1.2Z" fill="currentColor" />
                      </svg>
                    </button>
                    <button type="button" aria-label={`Delete ${record.id}`}>
                      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path d="M9 4h6l1 2h4v2H4V6h4l1-2Zm-2 6h2v8H7v-8Zm4 0h2v8h-2v-8Zm4 0h2v8h-2v-8ZM6 20V9h12v11H6Z" fill="currentColor" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="admin-fines__summary" aria-label="Fine summary statistics">
        <article className="admin-fines__summary-card">
          <p>Total Fines</p>
          <strong>{fineRecords.length}</strong>
        </article>
        <article className="admin-fines__summary-card">
          <p>Total Amount Due</p>
          <strong className="is-blue">LKR {totalAmount.toLocaleString('en-LK')}</strong>
        </article>
        <article className="admin-fines__summary-card">
          <p>Overdue Fines</p>
          <strong className="is-red">{overdueCount}</strong>
        </article>
      </section>

      {isModalOpen ? (
        <div className="admin-fines__modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-fine-title">
          <div className="admin-fines__modal">
            <div className="admin-fines__modal-header">
              <h3 id="add-fine-title">Add Fine</h3>
              <button type="button" className="admin-fines__modal-close" onClick={closeAddFineModal} aria-label="Close add fine form">
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
                <button type="button" className="admin-fines__btn-secondary" onClick={closeAddFineModal}>Cancel</button>
                <button type="submit" className="admin-fines__btn-primary">Save Fine</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
