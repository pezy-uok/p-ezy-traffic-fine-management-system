interface QuickStat {
  label: string
  value: string
  tone: 'blue' | 'red' | 'yellow' | 'green'
}

const quickStats: QuickStat[] = [
  { label: 'Avg Fines/Week', value: '89', tone: 'blue' },
  { label: 'Pending Cases', value: '24', tone: 'red' },
  { label: 'New Records', value: '12', tone: 'yellow' },
  { label: 'Published News', value: '47', tone: 'green' },
]

export default function AdminQuickStats() {
  return (
    <section aria-label="Quick statistics panel">
      <h3 className="admin-dashboard__panel-title">Quick Stats</h3>
      <div className="admin-dashboard__quick-stats">
        {quickStats.map(item => (
          <article key={item.label} className={`admin-dashboard__quick-item is-${item.tone}`}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>
    </section>
  )
}
