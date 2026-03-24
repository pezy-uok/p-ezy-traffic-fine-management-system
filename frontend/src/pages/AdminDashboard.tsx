import './AdminDashboard.css'

interface AdminDashboardProps {
  sectionName?: string
}

export default function AdminDashboard({ sectionName = 'Dashboard' }: AdminDashboardProps) {
  return (
    <section className="admin-dashboard" aria-label={`${sectionName} page`}>
      <h2>{sectionName}</h2>
      <p>
        Welcome back! Here&apos;s an overview of your police administration system.
      </p>
    </section>
  )
}
