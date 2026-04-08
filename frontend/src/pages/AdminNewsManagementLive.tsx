import { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '@/api'
import './AdminNewsManagement.css'

type ArticleStatus = 'published' | 'draft' | 'scheduled'

interface NewsArticle {
  id: string
  title: string
  summary: string
  author: string
  date: string
  status: ArticleStatus
  category: string
  featured: boolean
  pinned: boolean
  views?: number
}

const statusLabel: Record<ArticleStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  scheduled: 'Scheduled',
}

type StatusFilter = 'all' | ArticleStatus

const formatDate = (value: string) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toISOString().split('T')[0]
}

export default function AdminNewsManagementLive() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const fetchNews = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)

      const response = await adminAPI.getAllNews()
      const payload = response.data as {
        news?: Array<{
          id: string
          title?: string
          summary?: string
          content?: string
          author?: string
          publishedAt?: string | null
          createdAt?: string | null
          status?: ArticleStatus | string
          category?: string
          featured?: boolean
          pinned?: boolean
          views?: number
        }>
      }

      const mappedArticles = (payload.news || []).map(article => {
        const rawDate = article.publishedAt || article.createdAt || ''
        const summary = article.summary || article.content || ''

        return {
          id: article.id,
          title: article.title || 'Untitled',
          summary: summary.length > 140 ? `${summary.slice(0, 140).trim()}...` : summary,
          author: article.author || 'Unknown Author',
          date: formatDate(rawDate),
          status: (article.status as ArticleStatus) || (article.publishedAt ? 'published' : 'draft'),
          category: article.category || 'general',
          featured: Boolean(article.featured),
          pinned: Boolean(article.pinned),
          views: article.views,
        }
      })

      setArticles(mappedArticles)
    } catch (error) {
      console.error('Failed to fetch admin news:', error)
      setLoadError('Unable to load news right now. Please refresh the page.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

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
        article.author.toLowerCase().includes(normalizedQuery) ||
        article.category.toLowerCase().includes(normalizedQuery)

      return matchesStatus && matchesSearch
    })
  }, [articles, searchQuery, statusFilter])

  const totalPublished = useMemo(
    () => filteredArticles.filter(article => article.status === 'published').length,
    [filteredArticles],
  )

  const totalDrafts = useMemo(
    () => filteredArticles.filter(article => article.status === 'draft').length,
    [filteredArticles],
  )

  const totalViews = useMemo(
    () => filteredArticles.reduce((sum, article) => sum + (article.views ?? 0), 0),
    [filteredArticles],
  )

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value)
    setIsFilterMenuOpen(false)
  }

  return (
    <section className="admin-news" aria-label="News management page">
      <header className="admin-news__header">
        <div>
          <h2>News Management</h2>
          <p>Fetched live from GET /api/admin/news</p>
        </div>

        <button type="button" className="admin-news__add-btn" onClick={fetchNews}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M11 5h2v14h-2V5Zm-6 6h14v2H5v-2Z" fill="currentColor" />
          </svg>
          <span>Refresh</span>
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
            placeholder="Search by title, author, category, or ID..."
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

      <div className="admin-news__list">
        {isLoading ? (
          <article className="admin-news__card admin-news__card--empty">
            <p>Loading news...</p>
          </article>
        ) : null}

        {!isLoading && loadError ? (
          <article className="admin-news__card admin-news__card--empty">
            <p>{loadError}</p>
          </article>
        ) : null}

        {!isLoading && !loadError
          ? filteredArticles.map(article => (
              <article className="admin-news__card" key={article.id}>
                <div className="admin-news__card-main">
                  <div className="admin-news__card-tags">
                    <span className="admin-news__id">{article.id}</span>
                    <span className={`admin-news__status is-${article.status}`}>
                      {statusLabel[article.status] || article.status}
                    </span>
                    {article.featured ? <span className="admin-news__status is-scheduled">Featured</span> : null}
                    {article.pinned ? <span className="admin-news__status is-published">Pinned</span> : null}
                  </div>
                  <h3>{article.title}</h3>
                  <p className="admin-news__excerpt">{article.summary}</p>
                  <div className="admin-news__meta">
                    <span>{article.author}</span>
                    <span>•</span>
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.category}</span>
                  </div>
                </div>

                <div className="admin-news__card-side">
                  <div className="admin-news__stats">
                    <span>{article.views ?? 0}</span>
                    <small>Views</small>
                  </div>
                </div>
              </article>
            ))
          : null}

        {!isLoading && !loadError && filteredArticles.length === 0 ? (
          <article className="admin-news__card admin-news__card--empty">
            <p>No news found for the selected search and filter.</p>
          </article>
        ) : null}
      </div>

      <section className="admin-news__summary" aria-label="News summary statistics">
        <p className="admin-news__summary-note">Summary based on current table results</p>
        <article className="admin-news__summary-card">
          <p>Total Articles</p>
          <strong>{filteredArticles.length}</strong>
        </article>
        <article className="admin-news__summary-card">
          <p>Published</p>
          <strong className="is-blue">{totalPublished}</strong>
        </article>
        <article className="admin-news__summary-card">
          <p>Drafts</p>
          <strong className="is-red">{totalDrafts}</strong>
        </article>
        <article className="admin-news__summary-card">
          <p>Total Views</p>
          <strong>{totalViews.toLocaleString('en-LK')}</strong>
        </article>
      </section>
    </section>
  )
}
