import { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '@/api'
import './AdminTipsManagement.css'

type TipStatus = 'submitted' | 'under_review' | 'resolved' | 'closed' | 'archived'

interface TipRecord {
  id: string
  tipReference: string
  title: string
  description: string
  category: string
  location: string
  dateTime: string
  status: TipStatus | string
  assignedOfficerId?: string | null
  createdAt: string
}

interface OfficerOption {
  id: string
  name: string
  badgeNumber?: string
}

const statusOptions: Array<{ value: 'all' | TipStatus; label: string }> = [
  { value: 'all', label: 'All Statuses' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'archived', label: 'Archived' },
]

const categoryOptions = [
  { value: 'all', label: 'All Categories' },
  { value: 'suspicious_activity', label: 'Suspicious Activity' },
  { value: 'wanted_person_sighting', label: 'Wanted Person Sighting' },
  { value: 'drug_activity', label: 'Drug Activity' },
  { value: 'traffic_incident', label: 'Traffic Incident' },
  { value: 'other', label: 'Other' },
]

export default function AdminTipsManagement() {
  const [tips, setTips] = useState<TipRecord[]>([])
  const [officers, setOfficers] = useState<OfficerOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TipStatus>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'unassigned'>('all')

  const [limit] = useState(15)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(0)

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedTip, setSelectedTip] = useState<TipRecord | null>(null)
  const [selectedOfficerId, setSelectedOfficerId] = useState('')
  const [assignmentNotes, setAssignmentNotes] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

  const fetchTips = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await adminAPI.getAllTips({
        limit,
        offset,
        search: search.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        assignedTo: assignmentFilter === 'unassigned' ? 'unassigned' : undefined,
      })

      const payload = response.data as {
        data?: Array<{
          id: string
          tipReference?: string
          tip_reference?: string
          title?: string
          description?: string
          category?: string
          location?: string
          dateTime?: string
          date_time?: string
          status?: string
          assignedOfficerId?: string | null
          assigned_officer_id?: string | null
          createdAt?: string
          created_at?: string
        }>
        pagination?: { total?: number }
      }

      const mapped = (payload.data || []).map((tip) => ({
        id: tip.id,
        tipReference: tip.tipReference || tip.tip_reference || tip.id,
        title: tip.title || 'Untitled tip',
        description: tip.description || '',
        category: tip.category || 'other',
        location: tip.location || '-',
        dateTime: tip.dateTime || tip.date_time || '',
        status: tip.status || 'submitted',
        assignedOfficerId: tip.assignedOfficerId || tip.assigned_officer_id || null,
        createdAt: tip.createdAt || tip.created_at || '',
      }))

      setTips(mapped)
      setTotal(payload.pagination?.total || 0)
    } catch (fetchError) {
      console.error('Failed to fetch tips:', fetchError)
      setError('Unable to load tips right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOfficers = async () => {
    try {
      const response = await adminAPI.getAllOfficers()
      const payload = response.data as {
        officers?: Array<{
          id: string
          name?: string
          badge_number?: string
        }>
      }

      const mapped = (payload.officers || []).map((officer) => ({
        id: officer.id,
        name: officer.name || 'Unnamed Officer',
        badgeNumber: officer.badge_number || '',
      }))

      setOfficers(mapped)
    } catch (officerError) {
      console.error('Failed to fetch officers:', officerError)
    }
  }

  useEffect(() => {
    fetchTips()
  }, [offset, limit])

  useEffect(() => {
    fetchOfficers()
  }, [])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit])
  const currentPage = useMemo(() => Math.floor(offset / limit) + 1, [offset, limit])

  const handleApplyFilters = async () => {
    setOffset(0)

    try {
      setIsLoading(true)
      setError(null)

      const response = await adminAPI.getAllTips({
        limit,
        offset: 0,
        search: search.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        category: categoryFilter === 'all' ? undefined : categoryFilter,
        assignedTo: assignmentFilter === 'unassigned' ? 'unassigned' : undefined,
      })

      const payload = response.data as {
        data?: Array<{
          id: string
          tipReference?: string
          tip_reference?: string
          title?: string
          description?: string
          category?: string
          location?: string
          dateTime?: string
          date_time?: string
          status?: string
          assignedOfficerId?: string | null
          assigned_officer_id?: string | null
          createdAt?: string
          created_at?: string
        }>
        pagination?: { total?: number }
      }

      const mapped = (payload.data || []).map((tip) => ({
        id: tip.id,
        tipReference: tip.tipReference || tip.tip_reference || tip.id,
        title: tip.title || 'Untitled tip',
        description: tip.description || '',
        category: tip.category || 'other',
        location: tip.location || '-',
        dateTime: tip.dateTime || tip.date_time || '',
        status: tip.status || 'submitted',
        assignedOfficerId: tip.assignedOfficerId || tip.assigned_officer_id || null,
        createdAt: tip.createdAt || tip.created_at || '',
      }))

      setTips(mapped)
      setTotal(payload.pagination?.total || 0)
    } catch (fetchError) {
      console.error('Failed to fetch filtered tips:', fetchError)
      setError('Unable to apply filters right now. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const openAssignModal = (tip: TipRecord) => {
    setSelectedTip(tip)
    setSelectedOfficerId(tip.assignedOfficerId || '')
    setAssignmentNotes('')
    setIsAssignModalOpen(true)
  }

  const closeAssignModal = () => {
    if (isAssigning) return
    setIsAssignModalOpen(false)
    setSelectedTip(null)
    setSelectedOfficerId('')
    setAssignmentNotes('')
  }

  const handleAssignTip = async () => {
    if (!selectedTip || !selectedOfficerId) {
      return
    }

    try {
      setIsAssigning(true)
      await adminAPI.assignTipToOfficer(selectedTip.id, {
        assignedOfficerId: selectedOfficerId,
        assignmentNotes: assignmentNotes.trim() || undefined,
      })

      closeAssignModal()
      await fetchTips()
    } catch (assignError) {
      console.error('Failed to assign tip:', assignError)
      window.alert('Unable to assign tip right now. Please try again.')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUpdateStatus = async (tipId: string, newStatus: TipStatus) => {
    try {
      await adminAPI.updateTipStatus(tipId, { newStatus })
      await fetchTips()
    } catch (statusError) {
      console.error('Failed to update tip status:', statusError)
      window.alert('Unable to update tip status right now. Please try again.')
    }
  }

  return (
    <section className="admin-tips" aria-label="Tips management page">
      <header className="admin-tips__header">
        <div>
          <h2>Tips Management</h2>
          <p>Review public reports, assign investigations, and track progress.</p>
        </div>
      </header>

      <div className="admin-tips__filters">
        <label>
          Search
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, description, or location"
          />
        </label>

        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | TipStatus)}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Category
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Assignment
          <select value={assignmentFilter} onChange={(event) => setAssignmentFilter(event.target.value as 'all' | 'unassigned')}>
            <option value="all">All</option>
            <option value="unassigned">Unassigned only</option>
          </select>
        </label>

        <button type="button" onClick={handleApplyFilters}>Apply Filters</button>
      </div>

      <div className="admin-tips__summary">
        <span>Total Tips: {total}</span>
        <span>Showing: {tips.length}</span>
      </div>

      <div className="admin-tips__table-wrap">
        <table className="admin-tips__table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Title</th>
              <th>Category</th>
              <th>Location</th>
              <th>Status</th>
              <th>Assigned Officer</th>
              <th>Reported At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="admin-tips__empty">Loading tips...</td>
              </tr>
            ) : null}

            {!isLoading && error ? (
              <tr>
                <td colSpan={8} className="admin-tips__empty">{error}</td>
              </tr>
            ) : null}

            {!isLoading && !error && tips.length === 0 ? (
              <tr>
                <td colSpan={8} className="admin-tips__empty">No tips found for current filters.</td>
              </tr>
            ) : null}

            {!isLoading && !error && tips.map((tip) => {
              const assignedOfficer = officers.find((officer) => officer.id === tip.assignedOfficerId)

              return (
                <tr key={tip.id}>
                  <td className="admin-tips__reference">{tip.tipReference}</td>
                  <td>
                    <div className="admin-tips__title">{tip.title}</div>
                    <div className="admin-tips__description">{tip.description.slice(0, 80)}{tip.description.length > 80 ? '...' : ''}</div>
                  </td>
                  <td>{tip.category}</td>
                  <td>{tip.location}</td>
                  <td>
                    <select
                      value={tip.status}
                      onChange={(event) => handleUpdateStatus(tip.id, event.target.value as TipStatus)}
                    >
                      {statusOptions.filter((option) => option.value !== 'all').map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{assignedOfficer ? `${assignedOfficer.name}${assignedOfficer.badgeNumber ? ` (${assignedOfficer.badgeNumber})` : ''}` : 'Unassigned'}</td>
                  <td>{tip.createdAt ? new Date(tip.createdAt).toLocaleString() : '-'}</td>
                  <td>
                    <button type="button" className="admin-tips__assign-btn" onClick={() => openAssignModal(tip)}>
                      Assign
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="admin-tips__pagination">
        <button
          type="button"
          onClick={() => setOffset((prev) => Math.max(0, prev - limit))}
          disabled={offset === 0 || isLoading}
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          type="button"
          onClick={() => setOffset((prev) => prev + limit)}
          disabled={offset + limit >= total || isLoading}
        >
          Next
        </button>
      </div>

      {isAssignModalOpen && selectedTip ? (
        <div className="admin-tips__modal-backdrop" role="presentation" onClick={closeAssignModal}>
          <section
            className="admin-tips__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Assign tip to officer"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="admin-tips__modal-header">
              <h3>Assign Tip</h3>
              <button type="button" onClick={closeAssignModal} aria-label="Close assign modal">x</button>
            </header>

            <p className="admin-tips__modal-reference">{selectedTip.tipReference} - {selectedTip.title}</p>

            <label>
              Select Officer
              <select value={selectedOfficerId} onChange={(event) => setSelectedOfficerId(event.target.value)}>
                <option value="">Select an officer</option>
                {officers.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.name}{officer.badgeNumber ? ` (${officer.badgeNumber})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Assignment Notes
              <textarea
                rows={4}
                value={assignmentNotes}
                onChange={(event) => setAssignmentNotes(event.target.value)}
                placeholder="Add optional assignment notes"
              />
            </label>

            <div className="admin-tips__modal-actions">
              <button type="button" onClick={closeAssignModal} disabled={isAssigning}>Cancel</button>
              <button
                type="button"
                onClick={handleAssignTip}
                disabled={!selectedOfficerId || isAssigning}
              >
                {isAssigning ? 'Assigning...' : 'Assign Tip'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  )
}
