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

interface NewsArticleFormValues {
  title: string
  summary: string
  author: string
  date: string
  status: ArticleStatus
  views: string
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
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null)
  const [articleToDelete, setArticleToDelete] = useState<NewsArticle | null>(null)
  const [formValues, setFormValues] = useState<NewsArticleFormValues>({
    title: '',
    summary: '',
    author: '',
    date: '',
    status: 'draft',
    views: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof NewsArticleFormValues, string>>>({})

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

  const resetForm = () => {
    setFormValues({
      title: '',
      summary: '',
      author: '',
      date: '',
      status: 'draft',
      views: '',
    })
    setFormErrors({})
  }

  const openAddArticleModal = () => {
    closeFilterMenu()
    resetForm()
    setIsAddModalOpen(true)
  }

  const closeAddArticleModal = () => {
    setIsAddModalOpen(false)
    resetForm()
  }

  const openEditArticleModal = (article: NewsArticle) => {
    closeFilterMenu()
    setEditingArticleId(article.id)
    setFormValues({
      title: article.title,
      summary: article.summary,
      author: article.author,
      date: article.date,
      status: article.status,
      views: article.views?.toString() ?? '',
    })
    setFormErrors({})
    setIsEditModalOpen(true)
  }

  const closeEditArticleModal = () => {
    setIsEditModalOpen(false)
    setEditingArticleId(null)
    resetForm()
  }

  const handleEditArticleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm() || !editingArticleId) {
      return
    }

    const parsedViews = Number(formValues.views.trim())

    const updatedArticle: NewsArticle = {
      id: editingArticleId,
      title: formValues.title.trim(),
      summary: formValues.summary.trim(),
      author: formValues.author.trim(),
      date: formValues.date,
      status: formValues.status,
      views: Number.isFinite(parsedViews) ? parsedViews : undefined,
    }

    setArticles(previous =>
      previous.map(article => (article.id === editingArticleId ? updatedArticle : article)),
    )
    closeEditArticleModal()
  }

  const openDeleteDialog = (article: NewsArticle) => {
    closeFilterMenu()
    setArticleToDelete(article)
  }

  const closeDeleteDialog = () => {
    setArticleToDelete(null)
  }

  const handleConfirmDelete = () => {
    if (!articleToDelete) {
      return
    }

    setArticles(previous => previous.filter(article => article.id !== articleToDelete.id))
    closeDeleteDialog()
  }

  const updateFormValue = <K extends keyof NewsArticleFormValues>(
    field: K,
    value: NewsArticleFormValues[K],
  ) => {
    setFormValues(previous => ({ ...previous, [field]: value }))

    if (formErrors[field]) {
      setFormErrors(previous => ({ ...previous, [field]: undefined }))
    }
  }

  const validateForm = () => {
    const nextErrors: Partial<Record<keyof NewsArticleFormValues, string>> = {}

    if (!formValues.title.trim()) {
      nextErrors.title = 'Title is required.'
    }

    if (!formValues.summary.trim()) {
      nextErrors.summary = 'Summary is required.'
    }

    if (!formValues.author.trim()) {
      nextErrors.author = 'Author name is required.'
    }

    if (!formValues.date) {
      nextErrors.date = 'Date is required.'
    }

    const rawViews = formValues.views.trim()
    const parsedViews = Number(rawViews)

    if (rawViews && (!Number.isFinite(parsedViews) || parsedViews < 0)) {
      nextErrors.views = 'Views must be 0 or a positive number.'
    }

    if (formValues.status === 'published' && !rawViews) {
      nextErrors.views = 'Views are required for published articles.'
    }

    setFormErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleAddArticleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const nextNumericId =
      articles.reduce((maxId, article) => {
        const numericPart = Number.parseInt(article.id.replace(/[^0-9]/g, ''), 10)
        return Number.isFinite(numericPart) ? Math.max(maxId, numericPart) : maxId
      }, 0) + 1

    const parsedViews = Number(formValues.views.trim())
    const normalizedDate = new Date(formValues.date).toLocaleDateString('en-US')

    const newArticle: NewsArticle = {
      id: `N${String(nextNumericId).padStart(3, '0')}`,
      title: formValues.title.trim(),
      summary: formValues.summary.trim(),
      author: formValues.author.trim(),
      date: normalizedDate,
      status: formValues.status,
      views: Number.isFinite(parsedViews) ? parsedViews : undefined,
    }

    setArticles(previous => [newArticle, ...previous])
    closeAddArticleModal()
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

        <button type="button" className="admin-news__add-btn" onClick={openAddArticleModal}>
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

                <button
                  type="button"
                  className="admin-news__action-btn"
                  onClick={() => openEditArticleModal(article)}
                  aria-label={`Edit ${article.title}`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M3 17.2V21h3.8L17.9 9.9 14.1 6 3 17.2Zm2 2.8v-2l9.1-9.1 2 2-9.1 9.1H5Zm14.7-11.3a1 1 0 0 0 0-1.4l-3-3a1 1 0 0 0-1.4 0l-1.2 1.2 4.4 4.4 1.2-1.2Z" fill="currentColor" />
                  </svg>
                </button>

                <button
                  type="button"
                  className="admin-news__action-btn"
                  onClick={() => openDeleteDialog(article)}
                  aria-label={`Delete ${article.title}`}
                >
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

      {isAddModalOpen ? (
        <div className="admin-news__modal-overlay" role="presentation" onClick={closeAddArticleModal}>
          <article
            className="admin-news__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Add news article form"
            onClick={event => event.stopPropagation()}
          >
            <header className="admin-news__modal-header">
              <h3>Add New Article</h3>
              <button
                type="button"
                className="admin-news__modal-close"
                onClick={closeAddArticleModal}
                aria-label="Close add article form"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m6.7 5.3 5.3 5.3 5.3-5.3 1.4 1.4-5.3 5.3 5.3 5.3-1.4 1.4-5.3-5.3-5.3 5.3-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4Z" fill="currentColor" />
                </svg>
              </button>
            </header>

            <form className="admin-news__modal-form" onSubmit={handleAddArticleSubmit} noValidate>
              <label htmlFor="article-title">
                <span>Article Title</span>
                <input
                  id="article-title"
                  type="text"
                  value={formValues.title}
                  onChange={event => updateFormValue('title', event.target.value)}
                  placeholder="Enter article title"
                />
                {formErrors.title ? <small>{formErrors.title}</small> : null}
              </label>

              <label htmlFor="article-summary">
                <span>Summary</span>
                <textarea
                  id="article-summary"
                  rows={4}
                  value={formValues.summary}
                  onChange={event => updateFormValue('summary', event.target.value)}
                  placeholder="Write a short summary"
                />
                {formErrors.summary ? <small>{formErrors.summary}</small> : null}
              </label>

              <div className="admin-news__modal-grid">
                <label htmlFor="article-author">
                  <span>Author</span>
                  <input
                    id="article-author"
                    type="text"
                    value={formValues.author}
                    onChange={event => updateFormValue('author', event.target.value)}
                    placeholder="Author name"
                  />
                  {formErrors.author ? <small>{formErrors.author}</small> : null}
                </label>

                <label htmlFor="article-date">
                  <span>Publish Date</span>
                  <input
                    id="article-date"
                    type="date"
                    value={formValues.date}
                    onChange={event => updateFormValue('date', event.target.value)}
                  />
                  {formErrors.date ? <small>{formErrors.date}</small> : null}
                </label>
              </div>

              <div className="admin-news__modal-grid">
                <label htmlFor="article-status">
                  <span>Status</span>
                  <select
                    id="article-status"
                    value={formValues.status}
                    onChange={event => updateFormValue('status', event.target.value as ArticleStatus)}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </label>

                <label htmlFor="article-views">
                  <span>Views {formValues.status === 'published' ? '(required)' : '(optional)'}</span>
                  <input
                    id="article-views"
                    type="number"
                    min="0"
                    step="1"
                    value={formValues.views}
                    onChange={event => updateFormValue('views', event.target.value)}
                    placeholder="0"
                  />
                  {formErrors.views ? <small>{formErrors.views}</small> : null}
                </label>
              </div>

              <footer className="admin-news__modal-actions">
                <button type="button" className="admin-news__modal-btn is-muted" onClick={closeAddArticleModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-news__modal-btn is-primary">
                  Add Article
                </button>
              </footer>
            </form>
          </article>
        </div>
      ) : null}

      {isEditModalOpen ? (
        <div className="admin-news__modal-overlay" role="presentation" onClick={closeEditArticleModal}>
          <article
            className="admin-news__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Edit news article form"
            onClick={event => event.stopPropagation()}
          >
            <header className="admin-news__modal-header">
              <h3>Edit Article</h3>
              <button
                type="button"
                className="admin-news__modal-close"
                onClick={closeEditArticleModal}
                aria-label="Close edit article form"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m6.7 5.3 5.3 5.3 5.3-5.3 1.4 1.4-5.3 5.3 5.3 5.3-1.4 1.4-5.3-5.3-5.3 5.3-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4Z" fill="currentColor" />
                </svg>
              </button>
            </header>

            <form className="admin-news__modal-form" onSubmit={handleEditArticleSubmit} noValidate>
              <label htmlFor="edit-article-title">
                <span>Article Title</span>
                <input
                  id="edit-article-title"
                  type="text"
                  value={formValues.title}
                  onChange={event => updateFormValue('title', event.target.value)}
                  placeholder="Enter article title"
                />
                {formErrors.title ? <small>{formErrors.title}</small> : null}
              </label>

              <label htmlFor="edit-article-summary">
                <span>Summary</span>
                <textarea
                  id="edit-article-summary"
                  rows={4}
                  value={formValues.summary}
                  onChange={event => updateFormValue('summary', event.target.value)}
                  placeholder="Write a short summary"
                />
                {formErrors.summary ? <small>{formErrors.summary}</small> : null}
              </label>

              <div className="admin-news__modal-grid">
                <label htmlFor="edit-article-author">
                  <span>Author</span>
                  <input
                    id="edit-article-author"
                    type="text"
                    value={formValues.author}
                    onChange={event => updateFormValue('author', event.target.value)}
                    placeholder="Author name"
                  />
                  {formErrors.author ? <small>{formErrors.author}</small> : null}
                </label>

                <label htmlFor="edit-article-date">
                  <span>Publish Date</span>
                  <input
                    id="edit-article-date"
                    type="date"
                    value={formValues.date}
                    onChange={event => updateFormValue('date', event.target.value)}
                  />
                  {formErrors.date ? <small>{formErrors.date}</small> : null}
                </label>
              </div>

              <div className="admin-news__modal-grid">
                <label htmlFor="edit-article-status">
                  <span>Status</span>
                  <select
                    id="edit-article-status"
                    value={formValues.status}
                    onChange={event => updateFormValue('status', event.target.value as ArticleStatus)}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </label>

                <label htmlFor="edit-article-views">
                  <span>Views {formValues.status === 'published' ? '(required)' : '(optional)'}</span>
                  <input
                    id="edit-article-views"
                    type="number"
                    min="0"
                    step="1"
                    value={formValues.views}
                    onChange={event => updateFormValue('views', event.target.value)}
                    placeholder="0"
                  />
                  {formErrors.views ? <small>{formErrors.views}</small> : null}
                </label>
              </div>

              <footer className="admin-news__modal-actions">
                <button type="button" className="admin-news__modal-btn is-muted" onClick={closeEditArticleModal}>
                  Cancel
                </button>
                <button type="submit" className="admin-news__modal-btn is-primary">
                  Save Changes
                </button>
              </footer>
            </form>
          </article>
        </div>
      ) : null}

      {articleToDelete ? (
        <div className="admin-news__modal-overlay" role="presentation" onClick={closeDeleteDialog}>
          <article
            className="admin-news__modal admin-news__modal--compact"
            role="dialog"
            aria-modal="true"
            aria-label="Delete article confirmation"
            onClick={event => event.stopPropagation()}
          >
            <header className="admin-news__modal-header">
              <h3>Delete Article</h3>
              <button
                type="button"
                className="admin-news__modal-close"
                onClick={closeDeleteDialog}
                aria-label="Close delete confirmation"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="m6.7 5.3 5.3 5.3 5.3-5.3 1.4 1.4-5.3 5.3 5.3 5.3-1.4 1.4-5.3-5.3-5.3 5.3-1.4-1.4 5.3-5.3-5.3-5.3 1.4-1.4Z" fill="currentColor" />
                </svg>
              </button>
            </header>

            <div className="admin-news__delete-content">
              <p>
                Are you sure you want to delete <strong>{articleToDelete.title}</strong>? This action cannot be undone.
              </p>
            </div>

            <footer className="admin-news__modal-actions">
              <button type="button" className="admin-news__modal-btn is-muted" onClick={closeDeleteDialog}>
                Cancel
              </button>
              <button type="button" className="admin-news__modal-btn is-danger" onClick={handleConfirmDelete}>
                Delete Article
              </button>
            </footer>
          </article>
        </div>
      ) : null}
    </section>
  )
}