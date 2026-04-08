import './AdminStatCards.css'

interface StatCard {
  id: string
  title: string
  value: string
  trend: string
  trendPositive: boolean
  tone: 'blue' | 'red' | 'yellow' | 'green'
}

const defaultCards: StatCard[] = [
  {
    id: 'totalFines',
    title: 'Total Fines',
    value: '0',
    trend: 'Live',
    trendPositive: true,
    tone: 'blue',
  },
  {
    id: 'criminalRecords',
    title: 'Criminal Records',
    value: '0',
    trend: 'Live',
    trendPositive: true,
    tone: 'red',
  },
  {
    id: 'activeCases',
    title: 'Active Cases',
    value: '0',
    trend: 'Live',
    trendPositive: false,
    tone: 'yellow',
  },
  {
    id: 'newsPublished',
    title: 'News Published',
    value: '0',
    trend: 'Live',
    trendPositive: true,
    tone: 'green',
  },
]

interface AdminStatCardsProps {
  cards?: StatCard[]
  isLoading?: boolean
}

const getIconForCard = (cardId: string) => {
  switch (cardId) {
    case 'criminalRecords':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm0 2c-1.8 0-3.3.8-4.2 2.1A5.6 5.6 0 0 0 5 21h2a3.6 3.6 0 0 1 3.5-3h2c1.7 0 3.1.7 4.1 2H19a4 4 0 0 0-4-6ZM9 13a6 6 0 0 0-6 6h2a4 4 0 0 1 4-4h1.2a6.2 6.2 0 0 1 2.6-2H9Z" fill="currentColor" />
        </svg>
      )
    case 'activeCases':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M6 3h9l5 5v13H6V3Zm2 2v14h10V9h-4V5H8Zm2 6h6v2h-6v-2Zm0 4h6v2h-6v-2Z" fill="currentColor" />
        </svg>
      )
    case 'newsPublished':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M4 4h14v14H4V4Zm2 2v10h10V6H6Zm2 2h6v2H8V8Zm0 4h6v2H8v-2Zm11-4h1v8a2 2 0 0 1-2 2h-1v-2h1V8Z" fill="currentColor" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M5 19h14v2H5v-2Zm1-2h2V9H6v8Zm5 0h2V5h-2v12Zm5 0h2v-6h-2v6Z" fill="currentColor" />
        </svg>
      )
  }
}

export default function AdminStatCards({ cards = defaultCards, isLoading = false }: AdminStatCardsProps) {
  if (isLoading) {
    return (
      <section className="admin-dashboard__stats-grid" aria-label="Summary statistics loading">
        {defaultCards.map(card => (
          <article key={card.id} className="admin-dashboard__stat-card" aria-busy="true">
            <div className="admin-dashboard__stat-top">
              <span className={`admin-dashboard__stat-icon is-${card.tone}`}>{getIconForCard(card.id)}</span>
              <span className="admin-dashboard__stat-trend is-negative">Loading</span>
            </div>
            <p className="admin-dashboard__stat-title">{card.title}</p>
            <p className="admin-dashboard__stat-value">&mdash;</p>
          </article>
        ))}
      </section>
    )
  }

  return (
    <section className="admin-dashboard__stats-grid" aria-label="Summary statistics">
      {cards.map(card => (
        <article key={card.id} className="admin-dashboard__stat-card">
          <div className="admin-dashboard__stat-top">
            <span className={`admin-dashboard__stat-icon is-${card.tone}`}>{getIconForCard(card.id)}</span>
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
}
