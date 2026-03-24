import type { ReactNode } from 'react'

interface ActivityItem {
  title: string
  description: string
  time: string
  icon: ReactNode
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

export default function AdminRecentActivity() {
  return (
    <section aria-label="Recent activity feed">
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
    </section>
  )
}
