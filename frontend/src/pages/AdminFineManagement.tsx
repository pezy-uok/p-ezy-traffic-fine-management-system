import './AdminFineManagement.css'

interface FineRecord {
  id: string
  offender: string
  violation: string
  amount: string
  date: string
  status: 'paid' | 'pending' | 'overdue'
}

const fineRecords: FineRecord[] = [
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
  return (
    <section className="admin-fines" aria-label="Fine management page">
      <header className="admin-fines__header">
        <div>
          <h2>Fine Management</h2>
          <p>Manage traffic fines and violations</p>
        </div>

        <button type="button" className="admin-fines__add-btn">
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
          <strong>5</strong>
        </article>
        <article className="admin-fines__summary-card">
          <p>Total Amount Due</p>
          <strong className="is-blue">LKR 1,350</strong>
        </article>
        <article className="admin-fines__summary-card">
          <p>Overdue Fines</p>
          <strong className="is-red">1</strong>
        </article>
      </section>
    </section>
  )
}
