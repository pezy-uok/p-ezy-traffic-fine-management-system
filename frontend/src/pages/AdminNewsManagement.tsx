import { useMemo, useState } from 'react'
import './AdminNewsManagement.css'

type ArticleStatus = 'published' | 'draft' | 'scheduled'

interface NewsArticle {
  id: string
  title: string
  summary: string
  author: string
  date: string
  status: ArticleStatus
  views?: number
}

const initialArticles: NewsArticle[] = [
  {
    id: 'N001',
    title: 'New Traffic Safety Initiative Launched',
    summary: 'The police department announces a new initiative to improve traffic safety on major roads.',
    author: 'Officer Smith',
    date: '1/20/2024',
    status: 'published',
    views: 1247,
  },
  {
    id: 'N002',
    title: 'Community Policing Program Expansion',
    summary: 'Expanding community policing initiatives to create safer neighborhoods.',
    author: 'Chief Johnson',
    date: '1/18/2024',
    status: 'published',
    views: 892,
  },
  {
    id: 'N003',
    title: 'Crime Prevention Tips for Residents',
    summary: 'Essential tips to keep your home and family safe from crime.',
    author: 'Detective Brown',
    date: '1/15/2024',
    status: 'published',
    views: 2156,
  },
  {
    id: 'N004',
    title: 'Annual Police Department Report',
    summary: 'Review of department activities and achievements in 2023.',
    author: 'Captain Davis',
    date: '1/25/2024',
    status: 'draft',
  },
  {
    id: 'N005',
    title: 'Emergency Response Updates',
    summary: 'Latest updates on emergency response protocols and procedures.',
    author: 'Dispatcher Lee',
    date: '2/1/2024',
    status: 'scheduled',
  },
]

const statusLabel: Record<ArticleStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  scheduled: 'Scheduled',
}

type StatusFilter = 'all' | ArticleStatus

export default function AdminNewsManagement() {
  const [articles] = useState<NewsArticle[]>(initialArticles)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)

  const filteredArticles = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return articles.filter(article => {
      const matchesStatus = statusFilter === 'all' ? true : article.status === statusFilter

      if (!normalizedQuery) {
        return matchesStatus
      }

      const matchesSearch =
        article.id.toLowerCase().includes(normalizedQuery) ||
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.author.toLowerCase().includes(normalizedQuery)

      return matchesStatus && matchesSearch
    })
  }, [articles, searchQuery, statusFilter])

  const totalArticles = filteredArticles.length
  const totalPublished = filteredArticles.filter(article => article.status === 'published').length
  const totalDrafts = filteredArticles.filter(article => article.status === 'draft').length
  const totalViews = filteredArticles.reduce((sum, article) => sum + (article.views ?? 0), 0)

  const closeFilterMenu = () => {
    setIsFilterMenuOpen(false)
  }

  const handleStatusFilterChange = (filter: StatusFilter) => {
    setStatusFilter(filter)
    closeFilterMenu()
  }

  return (
    <section className="admin-news" aria-label="News management page">
      <header className="admin-news__header">
        <div>
          <h2>News Management</h2>
          <p>Publish and manage news articles for the public</p>
        </div>

        <button type="button" className="admin-news__add-btn">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M11 5h2v14h-2V5Zm-6 6h14v2H5v-2Z" fill="currentColor" />
          </svg>
          <span>New Article</span>
        </button>
      </header>

      <div className="admin-news__toolbar">
        <label htmlFor="news-search" className="admin-news__search-wrap">
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M10.5 3a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Zm0 2a5.5 5.5 0 1 0 3.45 9.78l4.13 4.13 1.42-1.42-4.13-4.13A5.5 5.5 0 0 0 10.5 5Z" fill="currentColor" />
          </svg>
          <input
            id="news-search"
            type="text"
            placeholder="Search by title, author, or slug..."
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
          />
        </label>

        <div className="admin-news__filter-wrap">
          <button
            type="button"
            className="admin-news__filter-btn"
            onClick={() => setIsFilterMenuOpen(previous => !previous)}
            aria-expanded={isFilterMenuOpen}
            aria-haspopup="menu"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M3 5h18v2l-7 7v5l-4 2v-7L3 7V5Zm3 2 6 6.2V19l1-.5v-5.3L19 7H6Z" fill="currentColor" />
            </svg>
            <span>{statusFilter === 'all' ? 'Filter' : statusLabel[statusFilter]}</span>
          </button>

          {isFilterMenuOpen ? (
            <div className="admin-news__filter-menu" role="menu" aria-label="Filter news by status">
              <button
                type="button"
                className={`admin-news__filter-item${statusFilter === 'all' ? ' is-active' : ''}`}
                onClick={() => handleStatusFilterChange('all')}
                role="menuitem"
              >
                All statuses
              </button>
              <button
                type="button"
                className={`admin-news__filter-item${statusFilter === 'published' ? ' is-active' : ''}`}
                onClick={() => handleStatusFilterChange('published')}
                role="menuitem"
              >
                Published
              </button>
              <button
                type="button"
                className={`admin-news__filter-item${statusFilter === 'draft' ? ' is-active' : ''}`}
                onClick={() => handleStatusFilterChange('draft')}
                role="menuitem"
              >
                Draft
              </button>
              <button
                type="button"
                className={`admin-news__filter-item${statusFilter === 'scheduled' ? ' is-active' : ''}`}
                onClick={() => handleStatusFilterChange('scheduled')}
                role="menuitem"
              >
                Scheduled
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <section className="admin-news__list" aria-label="News articles list">
        {filteredArticles.length ? (
          filteredArticles.map(article => (
            <article key={article.id} className="admin-news__card">
              <div className="admin-news__card-main">
                <div className="admin-news__card-tags">
                  <span className="admin-news__id">{article.id}</span>
                  <span className={`admin-news__status is-${article.status}`}>{statusLabel[article.status]}</span>
                </div>

                <h3>{article.title}</h3>
                <p className="admin-news__excerpt">{article.summary}</p>

                <footer className="admin-news__meta">
                  <span>{article.author}</span>
                  <span aria-hidden="true">•</span>
                  <span>{article.date}</span>
                  {typeof article.views === 'number' ? (
                    <>
                      <span aria-hidden="true">•</span>
                      <span className="admin-news__views">
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path d="M12 5c4.8 0 8.7 2.8 10 7-1.3 4.2-5.2 7-10 7S3.3 16.2 2 12c1.3-4.2 5.2-7 10-7Zm0 2c-3.7 0-6.8 2-8 5 1.2 3 4.3 5 8 5s6.8-2 8-5c-1.2-3-4.3-5-8-5Zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" fill="currentColor" />
                        </svg>
                        <span>{article.views.toLocaleString('en-US')} views</span>
                      </span>
                    </>
                  ) : null}
                </footer>
              </div>

              <div className="admin-news__actions" aria-label={`Actions for ${article.title}`}>
                {article.status === 'published' ? (
                  <button type="button" className="admin-news__action-btn" aria-label={`Preview ${article.title}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <path d="M12 5c4.8 0 8.7 2.8 10 7-1.3 4.2-5.2 7-10 7S3.3 16.2 2 12c1.3-4.2 5.2-7 10-7Zm0 2c-3.7 0-6.8 2-8 5 1.2 3 4.3 5 8 5s6.8-2 8-5c-1.2-3-4.3-5-8-5Zm0 2.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" fill="currentColor" />
                    </svg>
                  </button>
                ) : null}

                <button type="button" className="admin-news__action-btn" aria-label={`Edit ${article.title}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M3 17.2V21h3.8L17.9 9.9 14.1 6 3 17.2Zm2 2.8v-2l9.1-9.1 2 2-9.1 9.1H5Zm14.7-11.3a1 1 0 0 0 0-1.4l-3-3a1 1 0 0 0-1.4 0l-1.2 1.2 4.4 4.4 1.2-1.2Z" fill="currentColor" />
                  </svg>
                </button>

                <button type="button" className="admin-news__action-btn" aria-label={`Delete ${article.title}`}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M7 4h10l1 2h4v2H2V6h4l1-2Zm1 6h2v8H8v-8Zm6 0h2v8h-2v-8ZM6 8h12l-1 12H7L6 8Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </article>
          ))
        ) : (
          <article className="admin-news__card admin-news__card--empty">
            <p>No articles found for the current search and filter.</p>
          </article>
        )}
      </section>

      <section className="admin-news__summary-grid" aria-label="News summary statistics">
        <article className="admin-news__summary-card">
          <p>Total Articles</p>
          <strong>{totalArticles}</strong>
        </article>
        <article className="admin-news__summary-card">
          <p>Published</p>
          <strong className="is-green">{totalPublished}</strong>
        </article>
        <article className="admin-news__summary-card">
          <p>Drafts</p>
          <strong>{totalDrafts}</strong>
        </article>
        <article className="admin-news__summary-card">
          <p>Total Views</p>
          <strong className="is-blue">{totalViews.toLocaleString('en-US')}</strong>
        </article>
      </section>
    </section>
  )
}