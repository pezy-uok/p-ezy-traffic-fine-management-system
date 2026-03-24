import type { ReactNode } from 'react'
import './AdminMainContent.css'

interface AdminMainContentProps {
  title: string
  subtitle: string
  topSection?: ReactNode
  primarySection: ReactNode
  secondarySection?: ReactNode
}

export default function AdminMainContent({
  title,
  subtitle,
  topSection,
  primarySection,
  secondarySection,
}: AdminMainContentProps) {
  return (
    <section className="admin-main" aria-label={`${title} content`}>
      <header className="admin-main__header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

      {topSection ? <div className="admin-main__top">{topSection}</div> : null}

      <div className="admin-main__body">
        <section className="admin-main__panel admin-main__panel--primary">{primarySection}</section>
        {secondarySection ? (
          <aside className="admin-main__panel admin-main__panel--secondary">{secondarySection}</aside>
        ) : null}
      </div>
    </section>
  )
}
