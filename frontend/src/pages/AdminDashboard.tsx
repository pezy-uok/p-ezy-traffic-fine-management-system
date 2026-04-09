import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '@/api'
import type { AdminDashboardStats } from '@/types'
import AdminMainContent from '../layouts/AdminMainContent'
import AdminStatCards from '../components/admin/AdminStatCards'
import './AdminDashboard.css'

interface AdminDashboardProps {
  sectionName?: string
}

interface ActivityItem {
  title: string
  description: string
  time: string
  icon: ReactNode
}

interface QuickStat {
  label: string
  value: string
  tone: 'blue' | 'red' | 'yellow' | 'green'
}

const activityItems: ActivityItem[] = [
  {
    title: 'New fine record added',
    description: 'Traffic violation - Speeding',
    time: '2 hours ago',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 19h14v2H5v-2Zm1-2h2V9H6v8Zm5 0h2V5h-2v12Zm5 0h2v-6h-2v6Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Criminal record updated',
    description: 'Case #2024-0156 status changed to closed',
    time: '4 hours ago',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M11 17h2v2h-2v-2Zm1-14a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm-1-5h2V8h-2v6Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'News article published',
    description: 'Public safety announcement',
    time: '6 hours ago',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 4h14v14H4V4Zm2 2v10h10V6H6Zm2 2h6v2H8V8Zm0 4h6v2H8v-2Zm11-4h1v8a2 2 0 0 1-2 2h-1v-2h1V8Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'New fine record added',
    description: 'Parking violation - Illegal parking',
    time: '8 hours ago',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 19h14v2H5v-2Zm1-2h2V9H6v8Zm5 0h2V5h-2v12Zm5 0h2v-6h-2v6Z" fill="currentColor" />
      </svg>
    ),
  },
]

const quickStats: QuickStat[] = [
  { label: 'Avg Fines/Week', value: '89', tone: 'blue' },
  { label: 'Pending Cases', value: '24', tone: 'red' },
  { label: 'New Records', value: '12', tone: 'yellow' },
  { label: 'Published News', value: '47', tone: 'green' },
]

export default function AdminDashboard({ sectionName = 'Dashboard' }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [isStatsLoading, setIsStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [tipNotificationCounts, setTipNotificationCounts] = useState({
    unassigned: 0,
    newlySubmitted: 0,
  })

  useEffect(() => {
    let isMounted = true

    const loadStats = async () => {
      try {
        setIsStatsLoading(true)
        setStatsError(null)

        const [statsResponse, unassignedTipsResponse, submittedTipsResponse] = await Promise.all([
          adminAPI.getStats(),
          adminAPI.getAllTips({ limit: 1, offset: 0, assignedTo: 'unassigned' }),
          adminAPI.getAllTips({ limit: 1, offset: 0, status: 'submitted' }),
        ])

        if (!isMounted) {
          return
        }

        setStats(statsResponse.data.stats)

        const unassignedTotal = (unassignedTipsResponse.data as any)?.pagination?.total || 0
        const submittedTotal = (submittedTipsResponse.data as any)?.pagination?.total || 0

        setTipNotificationCounts({
          unassigned: unassignedTotal,
          newlySubmitted: submittedTotal,
        })
      } catch (error) {
        if (!isMounted) {
          return
        }

        console.error('Failed to fetch admin dashboard stats:', error)
        setStatsError('Unable to load dashboard stats right now.')
      } finally {
        if (isMounted) {
          setIsStatsLoading(false)
        }
      }
    }

    loadStats()

    return () => {
      isMounted = false
    }
  }, [])

  const topSection = (
    <div>
      {statsError ? <p className="admin-dashboard__error">{statsError}</p> : null}
      <div className="admin-dashboard__tip-badges" aria-label="Tip notifications">
        <Link to="/admin/tips" className="admin-dashboard__tip-badge is-red">
          <span className="admin-dashboard__tip-badge-label">Unassigned Tips</span>
          <strong>{tipNotificationCounts.unassigned}</strong>
        </Link>
        <Link to="/admin/tips" className="admin-dashboard__tip-badge is-blue">
          <span className="admin-dashboard__tip-badge-label">Newly Submitted Tips</span>
          <strong>{tipNotificationCounts.newlySubmitted}</strong>
        </Link>
      </div>
      <AdminStatCards cards={stats?.cards} isLoading={isStatsLoading} />
    </div>
  )

  const primarySection = (
    <>
      <h3 className="admin-dashboard__panel-title">Recent Activity</h3>
      <div className="admin-dashboard__activity-list">
        {activityItems.map(item => (
          <article key={`${item.title}-${item.time}`} className="admin-dashboard__activity-item">
            <span className="admin-dashboard__activity-icon">{item.icon}</span>
            <div className="admin-dashboard__activity-content">
              <h4>{item.title}</h4>
              <p className="admin-dashboard__activity-description">{item.description}</p>
              <span className="admin-dashboard__activity-time">{item.time}</span>
            </div>
          </article>
        ))}
      </div>
    </>
  )

  const secondarySection = (
    <>
      <h3 className="admin-dashboard__panel-title">Quick Stats</h3>
      <div className="admin-dashboard__quick-stats">
        {(stats?.quickStats || quickStats).map(item => (
          <article key={item.label} className={`admin-dashboard__quick-item is-${item.tone}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </>
  )

  return (
    <AdminMainContent
      title={sectionName}
      subtitle="Welcome back! Here&apos;s an overview of your police administration system."
      topSection={topSection}
      primarySection={primarySection}
      secondarySection={secondarySection}
    />
  )
}
