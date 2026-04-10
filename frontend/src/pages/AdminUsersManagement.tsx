import { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '@/api'
import './AdminUsersManagement.css'

interface OfficerRecord {
  id: string
  name: string
  email: string
  phone: string
  badge_number: string
  department: string
  rank: string
  status: 'active' | 'inactive' | 'suspended' | string
  is_online: boolean
  last_login: string | null
  last_logout: string | null
}

interface OfficerFormValues {
  name: string
  phone: string
  email: string
  badge_number: string
  department: string
  rank: string
  status: 'active' | 'inactive' | 'suspended'
}

const officerStatusLabel: Record<string, string> = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
}

const toEpoch = (value: string | null | undefined) => {
  if (!value) return null
  const epoch = new Date(value).getTime()
  return Number.isNaN(epoch) ? null : epoch
}

const isTimeBetweenLoginAndLogout = (
  nowEpoch: number,
  lastLoginRaw: string | null,
  lastLogoutRaw: string | null,
) => {
  const lastLoginEpoch = toEpoch(lastLoginRaw)
  const lastLogoutEpoch = toEpoch(lastLogoutRaw)

  if (!lastLoginEpoch) return false

  if (lastLogoutEpoch && lastLogoutEpoch >= lastLoginEpoch) {
    return nowEpoch >= lastLoginEpoch && nowEpoch <= lastLogoutEpoch
  }

  // If no logout yet (or login is newer than logout), treat as active after login.
  return nowEpoch >= lastLoginEpoch
}

const initialForm: OfficerFormValues = {
  name: '',
  phone: '',
  email: '',
  badge_number: '',
  department: '',
  rank: '',
  status: 'active',
}

export default function AdminUsersManagement() {
  const [officers, setOfficers] = useState<OfficerRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [editingOfficerId, setEditingOfficerId] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<OfficerFormValues>(initialForm)
  const [formError, setFormError] = useState<string | null>(null)
  const [nowEpoch, setNowEpoch] = useState(Date.now())

  const fetchOfficers = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)

      const response = await adminAPI.getAllOfficers()
      const payload = response.data as {
        officers?: Array<{
          id: string
          name?: string
          email?: string
          phone?: string
          badge_number?: string
          department?: string
          rank?: string
          status?: string
          is_online?: boolean
          last_login?: string | null
          last_login_at?: string | null
          last_logout?: string | null
          last_logout_at?: string | null
        }>
      }

      const mapped = (payload.officers || []).map((officer) => ({
        id: officer.id,
        name: officer.name || '-',
        email: officer.email || '-',
        phone: officer.phone || '-',
        badge_number: officer.badge_number || '-',
        department: officer.department || '-',
        rank: officer.rank || '-',
        status: officer.status || 'active',
        is_online: Boolean(officer.is_online),
        last_login: officer.last_login || officer.last_login_at || null,
        last_logout: officer.last_logout || officer.last_logout_at || null,
      }))

      setOfficers(mapped)
    } catch (error) {
      console.error('Failed to fetch officers:', error)
      setLoadError('Unable to load users right now. Please refresh.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOfficers()
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowEpoch(Date.now())
    }, 30000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

  const filteredOfficers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return officers

    return officers.filter((officer) =>
      officer.name.toLowerCase().includes(q) ||
      officer.email.toLowerCase().includes(q) ||
      officer.phone.toLowerCase().includes(q) ||
      officer.badge_number.toLowerCase().includes(q) ||
      officer.department.toLowerCase().includes(q),
    )
  }, [officers, searchQuery])

  const openModal = () => {
    setEditingOfficerId(null)
    setFormValues(initialForm)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (officer: OfficerRecord) => {
    setEditingOfficerId(officer.id)
    setFormValues({
      name: officer.name === '-' ? '' : officer.name,
      phone: officer.phone === '-' ? '' : officer.phone,
      email: officer.email === '-' ? '' : officer.email,
      badge_number: officer.badge_number === '-' ? '' : officer.badge_number,
      department: officer.department === '-' ? '' : officer.department,
      rank: officer.rank === '-' ? '' : officer.rank,
      status: (officer.status === 'inactive' || officer.status === 'suspended') ? officer.status : 'active',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setIsModalOpen(false)
    setEditingOfficerId(null)
  }

  const updateForm = <K extends keyof OfficerFormValues>(field: K, value: OfficerFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    if (formError) setFormError(null)
  }

  const validateForm = () => {
    if (!formValues.name.trim()) {
      setFormError('Officer name is required.')
      return false
    }

    if (!formValues.phone.trim()) {
      setFormError('Phone number is required.')
      return false
    }

    return true
  }

  const handleSaveOfficer = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSaving(true)
      setFormError(null)

      const payload = {
        name: formValues.name.trim(),
        phone: formValues.phone.trim(),
        email: formValues.email.trim() || undefined,
        badge_number: formValues.badge_number.trim() || undefined,
        department: formValues.department.trim() || undefined,
        rank: formValues.rank.trim() || undefined,
        status: formValues.status,
      }

      if (editingOfficerId) {
        await adminAPI.updateOfficer(editingOfficerId, payload)
      } else {
        await adminAPI.createOfficer(payload)
      }

      await fetchOfficers()
      setIsModalOpen(false)
      setEditingOfficerId(null)
    } catch (error) {
      console.error('Failed to save officer:', error)
      setFormError(editingOfficerId ? 'Unable to update user right now. Please try again.' : 'Unable to create user right now. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteOfficer = async (officer: OfficerRecord) => {
    const ok = window.confirm(`Delete user ${officer.name}? This action cannot be undone.`)
    if (!ok) return

    try {
      setIsDeletingId(officer.id)
      await adminAPI.deleteOfficer(officer.id)
      await fetchOfficers()
    } catch (error) {
      console.error('Failed to delete officer:', error)
      window.alert('Unable to delete user right now. Please try again.')
    } finally {
      setIsDeletingId(null)
    }
  }

  const onlineCount = filteredOfficers.filter((officer) =>
    isTimeBetweenLoginAndLogout(nowEpoch, officer.last_login, officer.last_logout),
  ).length

  return (
    <section className="admin-users" aria-label="Users management page">
      <header className="admin-users__header">
        <div>
          <h2>Users Management</h2>
          <p>Create, edit, and manage police officer users</p>
        </div>

        <button type="button" className="admin-users__add-btn" onClick={openModal}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M11 5h2v14h-2V5Zm-6 6h14v2H5v-2Z" fill="currentColor" />
          </svg>
          <span>Add User</span>
        </button>
      </header>

      <div className="admin-users__toolbar">
        <label htmlFor="users-search" className="admin-users__search-wrap">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm0 2a5.5 5.5 0 1 0 3.45 9.78l4.13 4.13 1.42-1.42-4.13-4.13A5.5 5.5 0 0 0 10.5 5Z" fill="currentColor" />
          </svg>
          <input
            id="users-search"
            type="text"
            placeholder="Search by name, email, phone, badge, or department"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
      </div>

      <div className="admin-users__table-wrap">
        <table className="admin-users__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Badge</th>
              <th>Department</th>
              <th>Rank</th>
              <th>Status</th>
              <th>Online</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="admin-users__empty">Loading users...</td>
              </tr>
            ) : null}

            {!isLoading && loadError ? (
              <tr>
                <td colSpan={9} className="admin-users__empty">{loadError}</td>
              </tr>
            ) : null}

            {!isLoading && !loadError && filteredOfficers.length === 0 ? (
              <tr>
                <td colSpan={9} className="admin-users__empty">No users found.</td>
              </tr>
            ) : null}

            {!isLoading && !loadError
              ? filteredOfficers.map((officer) => {
                  const computedStatus = officer.status === 'suspended'
                    ? 'suspended'
                    : isTimeBetweenLoginAndLogout(nowEpoch, officer.last_login, officer.last_logout)
                      ? 'active'
                      : 'inactive'

                  return (
                    <tr key={officer.id}>
                      <td>{officer.name}</td>
                      <td>{officer.email}</td>
                      <td>{officer.phone}</td>
                      <td>{officer.badge_number}</td>
                      <td>{officer.department}</td>
                      <td>{officer.rank}</td>
                      <td>
                        <span className={`admin-users__pill is-${computedStatus}`}>
                          {officerStatusLabel[computedStatus] || computedStatus}
                        </span>
                      </td>
                      <td>{computedStatus === 'active' ? 'Online' : 'Offline'}</td>
                      <td>
                        <div className="admin-users__actions">
                          <button type="button" onClick={() => openEditModal(officer)}>Edit</button>
                          <button
                            type="button"
                            className="is-danger"
                            onClick={() => handleDeleteOfficer(officer)}
                            disabled={isDeletingId === officer.id}
                          >
                            {isDeletingId === officer.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              : null}
          </tbody>
        </table>
      </div>

      <section className="admin-users__summary" aria-label="Users summary">
        <p className="admin-users__summary-note">Summary based on current table results</p>
        <article className="admin-users__summary-card">
          <p>Total Users</p>
          <strong>{filteredOfficers.length}</strong>
        </article>
        <article className="admin-users__summary-card">
          <p>Online Users</p>
          <strong className="is-blue">{onlineCount}</strong>
        </article>
      </section>

      {isModalOpen ? (
        <div className="admin-users__modal-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-users-create-title">
          <div className="admin-users__modal">
            <div className="admin-users__modal-header">
              <h3 id="admin-users-create-title">{editingOfficerId ? 'Edit Officer User' : 'Add Officer User'}</h3>
              <button type="button" className="admin-users__modal-close" onClick={closeModal} aria-label="Close">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form className="admin-users__form" onSubmit={handleSaveOfficer}>
              <label>
                Name
                <input type="text" value={formValues.name} onChange={(e) => updateForm('name', e.target.value)} />
              </label>
              <label>
                Phone
                <input type="text" value={formValues.phone} onChange={(e) => updateForm('phone', e.target.value)} />
              </label>
              <label>
                Email
                <input type="email" value={formValues.email} onChange={(e) => updateForm('email', e.target.value)} />
              </label>
              <label>
                Badge Number
                <input type="text" value={formValues.badge_number} onChange={(e) => updateForm('badge_number', e.target.value)} />
              </label>
              <label>
                Department
                <input type="text" value={formValues.department} onChange={(e) => updateForm('department', e.target.value)} />
              </label>
              <label>
                Rank
                <input type="text" value={formValues.rank} onChange={(e) => updateForm('rank', e.target.value)} />
              </label>
              <label>
                Status
                <select value={formValues.status} onChange={(e) => updateForm('status', e.target.value as OfficerFormValues['status'])}>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="suspended">suspended</option>
                </select>
              </label>

              {formError ? <p className="admin-users__form-error">{formError}</p> : null}

              <div className="admin-users__modal-actions">
                <button type="button" onClick={closeModal} disabled={isSaving}>Cancel</button>
                <button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : (editingOfficerId ? 'Update User' : 'Create User')}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
