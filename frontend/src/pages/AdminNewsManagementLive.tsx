import { useEffect, useMemo, useState } from 'react'
import { adminAPI } from '@/api'
import './AdminNewsManagement.css'

type ArticleStatus = 'published' | 'draft' | 'scheduled'

interface NewsArticle {
  id: string
  title: string
  content: string
  summary: string
  author: string
  date: string
  publishedAt: string
  status: ArticleStatus
  category: string
  featured: boolean
  pinned: boolean
  views?: number
  imagePath: string | null
}

const statusLabel: Record<ArticleStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  scheduled: 'Scheduled',
}

type StatusFilter = 'all' | ArticleStatus

interface NewsFormValues {
  title: string
  content: string
  category: string
  status: ArticleStatus
  featured: boolean
  pinned: boolean
  publishedAt: string
}

const initialFormValues: NewsFormValues = {
  title: '',
  content: '',
  category: 'general',
  status: 'draft',
  featured: false,
  pinned: false,
  publishedAt: '',
}

const formatDate = (value: string) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toISOString().split('T')[0]
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '')
const ASSET_BASE_URL = API_BASE_URL.replace(/\/api$/, '')

const buildImageUrl = (path: string | null) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${ASSET_BASE_URL}${path}`
}

export default function AdminNewsManagementLive() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [formValues, setFormValues] = useState<NewsFormValues>(initialFormValues)
  const [formError, setFormError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('')
  const [existingImagePath, setExistingImagePath] = useState<string | null>(null)

  const fetchNews = async () => {
    try {
      setIsLoading(true)
      setLoadError(null)

      const response = await adminAPI.getAllNews()
      const payload = response.data as {
        news?: Array<{
          id: string
          title?: string
          content?: string
          summary?: string
          author?: string
          publishedAt?: string | null
          createdAt?: string | null
          status?: ArticleStatus | string
          category?: string
          featured?: boolean
          pinned?: boolean
          views?: number
          imagePath?: string | null
          image_path?: string | null
          image_url?: string | null
          thumbnail_url?: string | null
          cover_image?: string | null
          featured_image?: string | null
        }>
      }

      const mappedArticles = (payload.news || []).map(article => {
        const rawDate = article.publishedAt || article.createdAt || ''
        const summary = article.summary || article.content || ''

        return {
          id: article.id,
          title: article.title || 'Untitled',
          content: article.content || article.summary || '',
          summary: summary.length > 140 ? `${summary.slice(0, 140).trim()}...` : summary,
          author: article.author || 'Unknown Author',
          publishedAt: rawDate,
          date: formatDate(rawDate),
          status: (article.status as ArticleStatus) || (article.publishedAt ? 'published' : 'draft'),
          category: article.category || 'general',
          featured: Boolean(article.featured),
          pinned: Boolean(article.pinned),
          views: article.views,
          imagePath:
            article.imagePath ||
            article.image_path ||
            article.image_url ||
            article.thumbnail_url ||
            article.cover_image ||
            article.featured_image ||
            null,
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

  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl)
      }
    }
  }, [imagePreviewUrl])

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

  const openAddModal = () => {
    setEditingNewsId(null)
    setFormValues(initialFormValues)
    setFormError(null)
    setSelectedImage(null)
    setImagePreviewUrl('')
    setExistingImagePath(null)
    setIsModalOpen(true)
  }

  const openEditModal = (article: NewsArticle) => {
    setEditingNewsId(article.id)
    setFormValues({
      title: article.title,
      content: article.content,
      category: article.category,
      status: article.status,
      featured: article.featured,
      pinned: article.pinned,
        publishedAt: article.publishedAt ? article.publishedAt.slice(0, 16) : '',
    })
    setSelectedImage(null)
    setImagePreviewUrl('')
    setExistingImagePath(article.imagePath)
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (isSaving) return
    setIsModalOpen(false)
    setEditingNewsId(null)
    setSelectedImage(null)
    setImagePreviewUrl('')
    setExistingImagePath(null)
  }

  const updateForm = <K extends keyof NewsFormValues>(field: K, value: NewsFormValues[K]) => {
    setFormValues(previous => ({ ...previous, [field]: value }))
    if (formError) setFormError(null)
  }

  const handleSaveNews = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formValues.title.trim() || !formValues.content.trim()) {
      setFormError('Title and content are required.')
      return
    }

    try {
      setIsSaving(true)
      setFormError(null)

      const payload = {
        title: formValues.title.trim(),
        content: formValues.content.trim(),
        category: formValues.category.trim() || 'general',
        status: formValues.status,
        featured: formValues.featured,
        pinned: formValues.pinned,
        publishedAt: formValues.publishedAt ? new Date(formValues.publishedAt).toISOString() : null,
      }

      if (editingNewsId) {
        await adminAPI.updateNews(editingNewsId, payload, selectedImage)
      } else {
        await adminAPI.createNews(payload, selectedImage)
      }

      await fetchNews()
      setIsModalOpen(false)
      setEditingNewsId(null)
    } catch (error) {
      console.error('Failed to save news:', error)
      setFormError(editingNewsId ? 'Unable to update news right now. Please try again.' : 'Unable to create news right now. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageChange = (event: import('react').ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      setSelectedImage(null)
      setImagePreviewUrl('')
      return
    }

    if (!file.type.startsWith('image/')) {
      setFormError('Please choose a valid image file.')
      event.target.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError('Image must be smaller than 10MB.')
      event.target.value = ''
      return
    }

    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl)
    }

    setSelectedImage(file)
    setImagePreviewUrl(URL.createObjectURL(file))
    if (formError) setFormError(null)
  }

  const handleDeleteNews = async (article: NewsArticle) => {
    const confirmed = window.confirm(`Delete news article \"${article.title}\"? This action cannot be undone.`)
    if (!confirmed) return

    try {
      setIsDeletingId(article.id)
      await adminAPI.deleteNews(article.id)
      await fetchNews()
    } catch (error) {
      console.error('Failed to delete news:', error)
      window.alert('Unable to delete news right now. Please try again.')
    } finally {
      setIsDeletingId(null)
    }
  }

  return (
    <section className="admin-news" aria-label="News management page">
      <header className="admin-news__header">
        <div>
          <h2>News Management</h2>
          <p>Fetched live from GET /api/admin/news</p>
        </div>

        <button type="button" className="admin-news__add-btn" onClick={openAddModal}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M11 5h2v14h-2V5Zm-6 6h14v2H5v-2Z" fill="currentColor" />
          </svg>
          <span>Add</span>
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

                    <div className="admin-news__actions">
                      <button type="button" className="admin-news__action-btn admin-news__action-btn--edit" onClick={() => openEditModal(article)} aria-label={`Edit ${article.title}`}>
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path d="M3 17.25V21h3.75L17.8 9.95l-3.75-3.75L3 17.25Zm14.71-9.04a1 1 0 0 0 0-1.41l-1.5-1.5a1 1 0 0 0-1.41 0l-1.12 1.12 3.75 3.75 1.28-1.96Z" fill="currentColor" />
                        </svg>
                      </button>
                      <button type="button" className="admin-news__action-btn admin-news__action-btn--delete" onClick={() => handleDeleteNews(article)} aria-label={`Delete ${article.title}`} disabled={isDeletingId === article.id}>
                        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                          <path d="M6 7h12v2H6V7Zm2 3h8l-.67 9.33A2 2 0 0 1 13.34 21H10.66a2 2 0 0 1-1.99-1.67L8 10Zm3-6h2l1 1h4v2H4V5h4l1-1Z" fill="currentColor" />
                        </svg>
                      </button>
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

      {isModalOpen ? (
        <div className="admin-news__modal-overlay" role="dialog" aria-modal="true" aria-labelledby="admin-news-modal-title">
          <div className="admin-news__modal">
            <div className="admin-news__modal-header">
              <h3 id="admin-news-modal-title">{editingNewsId ? 'Edit News Article' : 'Add News Article'}</h3>
              <button type="button" className="admin-news__modal-close" onClick={closeModal} aria-label="Close">
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <form className="admin-news__modal-form" onSubmit={handleSaveNews}>
              <label>
                <span>Title</span>
                <input type="text" value={formValues.title} onChange={event => updateForm('title', event.target.value)} />
              </label>

              <label>
                <span>Content</span>
                <textarea value={formValues.content} onChange={event => updateForm('content', event.target.value)} />
              </label>

              <label>
                <span>News Image (one image)</span>
                <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleImageChange} />
                {selectedImage ? <small>{selectedImage.name}</small> : null}
                {!selectedImage && existingImagePath ? <small>Current image: {existingImagePath.split('/').pop()}</small> : null}
              </label>

              {imagePreviewUrl ? (
                <div className="admin-news__image-preview-wrap">
                  <img src={imagePreviewUrl} alt="Selected news" className="admin-news__image-preview" />
                </div>
              ) : null}

              {!imagePreviewUrl && existingImagePath ? (
                <div className="admin-news__image-preview-wrap">
                  <img src={buildImageUrl(existingImagePath)} alt="Current news" className="admin-news__image-preview" />
                </div>
              ) : null}

              <div className="admin-news__modal-grid">
                <label>
                  <span>Category</span>
                  <input type="text" value={formValues.category} onChange={event => updateForm('category', event.target.value)} />
                </label>

                <label>
                  <span>Status</span>
                  <select value={formValues.status} onChange={event => updateForm('status', event.target.value as ArticleStatus)}>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>
                </label>

                <label>
                  <span>Published At</span>
                  <input type="datetime-local" value={formValues.publishedAt} onChange={event => updateForm('publishedAt', event.target.value)} />
                </label>

                <label>
                  <span>Flags</span>
                  <div className="admin-news__modal-flags">
                    <label className="admin-news__check-item">
                      <input type="checkbox" checked={formValues.featured} onChange={event => updateForm('featured', event.target.checked)} />
                      <span>Featured</span>
                    </label>
                    <label className="admin-news__check-item">
                      <input type="checkbox" checked={formValues.pinned} onChange={event => updateForm('pinned', event.target.checked)} />
                      <span>Pinned</span>
                    </label>
                  </div>
                </label>
              </div>

              <div className="admin-news__modal-flags">
                <label className="admin-news__check-item">
                  <input type="checkbox" checked={formValues.featured} onChange={event => updateForm('featured', event.target.checked)} />
                  <span>Featured</span>
                </label>
                <label className="admin-news__check-item">
                  <input type="checkbox" checked={formValues.pinned} onChange={event => updateForm('pinned', event.target.checked)} />
                  <span>Pinned</span>
                </label>
              </div>

              {formError ? <small>{formError}</small> : null}

              <div className="admin-news__modal-actions">
                <button type="button" className="admin-news__modal-btn is-muted" onClick={closeModal} disabled={isSaving}>Cancel</button>
                <button type="submit" className="admin-news__modal-btn is-primary" disabled={isSaving}>{isSaving ? 'Saving...' : (editingNewsId ? 'Update News' : 'Create News')}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  )
}
