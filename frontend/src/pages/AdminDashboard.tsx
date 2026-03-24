import type { ReactNode } from 'react'
import AdminMainContent from '../layouts/AdminMainContent'
import './AdminDashboard.css'

interface AdminDashboardProps {
  sectionName?: string
}

interface StatCard {
  title: string
  value: string
  trend: string
  trendPositive: boolean
  tone: 'blue' | 'red' | 'yellow' | 'green'
  icon: ReactNode
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

const statCards: StatCard[] = [
  {
    title: 'Total Fines',
    value: '1,247',
    trend: '+12.5%',
    trendPositive: true,
    tone: 'blue',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M5 19h14v2H5v-2Zm1-2h2V9H6v8Zm5 0h2V5h-2v12Zm5 0h2v-6h-2v6Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Criminal Records',
    value: '856',
    trend: '+8.2%',
    trendPositive: true,
    tone: 'red',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0 2c-1.8 0-3.3.8-4.2 2.1A5.6 5.6 0 0 0 5 21h2a3.6 3.6 0 0 1 3.5-3h2c1.7 0 3.1.7 4.1 2H19a4 4 0 0 0-4-6ZM9 13a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4h1.2a6.2 6.2 0 0 1 2.6-2H9Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'Active Cases',
    value: '342',
    trend: '-4.1%',
    trendPositive: false,
    tone: 'yellow',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M6 3h9l5 5v13H6V3Zm2 2v14h10V9h-4V5H8Zm2 6h6v2h-6v-2Zm0 4h6v2h-6v-2Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: 'News Published',
    value: '47',
    trend: '+5.3%',
    trendPositive: true,
    tone: 'green',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M4 4h14v14H4V4Zm2 2v10h10V6H6Zm2 2h6v2H8V8Zm0 4h6v2H8v-2Zm11-4h1v8a2 2 0 0 1-2 2h-1v-2h1V8Z" fill="currentColor" />
      </svg>
    ),
  },
]

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
  const topSection = (
    <section className="admin-dashboard__stats-grid" aria-label="Summary statistics">
      {statCards.map(card => (
        <article key={card.title} className="admin-dashboard__stat-card">
          <div className="admin-dashboard__stat-top">
            <span className={`admin-dashboard__stat-icon is-${card.tone}`}>{card.icon}</span>
            <span
              className={`admin-dashboard__stat-trend${
                card.trendPositive ? ' is-positive' : ' is-negative'
              }`}
            >
              {card.trend}
            </span>
          </div>
          <p className="admin-dashboard__stat-title">{card.title}</p>
          <p className="admin-dashboard__stat-value">{card.value}</p>
        </article>
      ))}
    </section>
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
        {quickStats.map(item => (
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
