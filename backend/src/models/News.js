const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const News = sequelize.define(
    'News',
    {
      newsId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Unique identifier for news article',
      },

      // Content Fields
      title: {
        type: DataTypes.VARCHAR(255),
        allowNull: false,
        comment: 'News article title',
        validate: {
          len: {
            args: [5, 255],
            msg: 'Title must be between 5 and 255 characters',
          },
        },
        index: true,
      },

      slug: {
        type: DataTypes.VARCHAR(300),
        allowNull: false,
        unique: true,
        comment: 'URL-friendly slug for the article',
        validate: {
          isSlug(value) {
            if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
              throw new Error(
                'Slug must contain only lowercase letters, numbers, and hyphens'
              );
            }
          },
        },
        index: true,
      },

      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Main article content (supports HTML/Markdown)',
      },

      summary: {
        type: DataTypes.VARCHAR(500),
        allowNull: true,
        comment: 'Short summary/excerpt of the article',
      },

      category: {
        type: DataTypes.ENUM(
          'alert',
          'update',
          'safety_tip',
          'law_change',
          'event',
          'awareness',
          'announcement',
          'other'
        ),
        allowNull: false,
        defaultValue: 'announcement',
        comment: 'News category/type',
        index: true,
      },

      // Media Fields
      thumbnailUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL to thumbnail/featured image',
        validate: {
          isUrl: {
            msg: 'Thumbnail URL must be a valid URL',
          },
        },
      },

      thumbnailAlt: {
        type: DataTypes.VARCHAR(255),
        allowNull: true,
        comment: 'Alt text for thumbnail (accessibility)',
      },

      contentImages: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of image URLs used in article content',
      },

      // Author & Source Information
      authorUserId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Admin user who created the news',
        references: {
          model: 'Users',
          key: 'userId',
        },
        index: true,
      },

      authorName: {
        type: DataTypes.VARCHAR(100),
        allowNull: true,
        comment: 'Display name of author (denormalized)',
      },

      source: {
        type: DataTypes.VARCHAR(255),
        allowNull: true,
        comment: 'Source of news (if external)',
      },

      sourceUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URL to original source',
        validate: {
          isUrl: {
            msg: 'Source URL must be a valid URL',
          },
        },
      },

      // Status & Visibility
      status: {
        type: DataTypes.ENUM('draft', 'scheduled', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft',
        comment: 'Publication status of the news',
        index: true,
      },

      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the article was published',
        index: true,
      },

      scheduledFor: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When article should be auto-published (for scheduled status)',
      },

      visibility: {
        type: DataTypes.ENUM(
          'public',
          'officers_only',
          'drivers_only',
          'all_users'
        ),
        allowNull: false,
        defaultValue: 'public',
        comment: 'Who can view this news',
        index: true,
      },

      // Feature & Engagement
      featured: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether article is featured on homepage',
        index: true,
      },

      featureOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Order for featured articles (lower = higher priority)',
      },

      views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of article views',
      },

      likes: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of likes/reactions',
      },

      shares: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of shares',
      },

      comments: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of comments',
      },

      // Tags & Keywords
      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of tags for filtering and search',
      },

      keywords: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of keywords for SEO',
      },

      // Related Content
      relatedNewsIds: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of related news article IDs',
      },

      // Metadata
      priority: {
        type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'normal',
        comment: 'Priority level for importance ranking',
        index: true,
      },

      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the news becomes outdated/archived',
      },

      pinned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether article is pinned to top',
        index: true,
      },

      allowComments: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Whether to allow user comments',
      },

      edited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether article was edited after publish',
      },

      editedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last edit timestamp',
      },

      editReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for last edit',
      },

      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional metadata (reading time, word count, etc.)',
      },

      // Timestamps
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp',
      },
    },
    {
      sequelize,
      modelName: 'News',
      tableName: 'news',
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          fields: ['title'],
          name: 'idx_news_title',
        },
        {
          fields: ['slug'],
          name: 'idx_news_slug',
        },
        {
          fields: ['category'],
          name: 'idx_news_category',
        },
        {
          fields: ['status'],
          name: 'idx_news_status',
        },
        {
          fields: ['visibility'],
          name: 'idx_news_visibility',
        },
        {
          fields: ['authorUserId'],
          name: 'idx_news_author_user_id',
        },
        {
          fields: ['featured'],
          name: 'idx_news_featured',
        },
        {
          fields: ['pinned'],
          name: 'idx_news_pinned',
        },
        {
          fields: ['publishedAt'],
          name: 'idx_news_published_at',
        },
        {
          fields: ['priority'],
          name: 'idx_news_priority',
        },
        {
          fields: ['createdAt'],
          name: 'idx_news_created_at',
        },
        {
          fields: ['status', 'publishedAt'],
          name: 'idx_news_status_published',
        },
        {
          fields: ['featured', 'status', 'publishedAt'],
          name: 'idx_news_featured_status_published',
        },
        {
          fields: ['category', 'status', 'publishedAt'],
          name: 'idx_news_category_status_published',
        },
        {
          fields: ['visibility', 'status', 'publishedAt'],
          name: 'idx_news_visibility_status_published',
        },
      ],
      comment: 'News and announcements for web portal and admin management',
    }
  );

  // ============================================================================
  // INSTANCE METHODS
  // ============================================================================

  /**
   * Generate slug from title
   * @returns {string} Generated slug
   */
  News.prototype.generateSlug = function () {
    return this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  /**
   * Publish the article
   * @returns {object} Updated news
   */
  News.prototype.publish = async function () {
    this.status = 'published';
    this.publishedAt = new Date();
    return this.save();
  };

  /**
   * Archive the article
   * @returns {object} Updated news
   */
  News.prototype.archive = async function () {
    this.status = 'archived';
    return this.save();
  };

  /**
   * Schedule article for future publishing
   * @param {Date} publishDate - When to publish
   * @returns {object} Updated news
   */
  News.prototype.schedule = async function (publishDate) {
    this.status = 'scheduled';
    this.scheduledFor = publishDate;
    return this.save();
  };

  /**
   * Increment view count
   * @returns {object} Updated news
   */
  News.prototype.incrementViews = async function () {
    this.views += 1;
    return this.save();
  };

  /**
   * Like/react to article
   * @returns {object} Updated news
   */
  News.prototype.addLike = async function () {
    this.likes += 1;
    return this.save();
  };

  /**
   * Share article
   * @returns {object} Updated news
   */
  News.prototype.addShare = async function () {
    this.shares += 1;
    return this.save();
  };

  /**
   * Add/update comment count
   * @param {number} delta - Change in comment count (+1 for new, -1 for deletion)
   * @returns {object} Updated news
   */
  News.prototype.updateCommentCount = async function (delta = 1) {
    this.comments = Math.max(0, this.comments + delta);
    return this.save();
  };

  /**
   * Edit article
   * @param {object} updates - Fields to update (title, content, etc.)
   * @param {string} reason - Reason for edit
   * @returns {object} Updated news
   */
  News.prototype.edit = async function (updates, reason = '') {
    const allowedFields = [
      'title',
      'content',
      'summary',
      'thumbnailUrl',
      'thumbnailAlt',
    ];
    allowedFields.forEach((field) => {
      if (updates[field]) {
        this[field] = updates[field];
      }
    });
    this.edited = true;
    this.editedAt = new Date();
    this.editReason = reason;
    return this.save();
  };

  /**
   * Pin article to top
   * @param {number} order - Display order (lower = higher priority)
   * @returns {object} Updated news
   */
  News.prototype.pin = async function (order = 1) {
    this.pinned = true;
    this.featureOrder = order;
    return this.save();
  };

  /**
   * Unpin article
   * @returns {object} Updated news
   */
  News.prototype.unpin = async function () {
    this.pinned = false;
    return this.save();
  };

  /**
   * Feature article on homepage
   * @param {number} order - Feature display order
   * @returns {object} Updated news
   */
  News.prototype.feature = async function (order = null) {
    this.featured = true;
    if (order !== null) {
      this.featureOrder = order;
    }
    return this.save();
  };

  /**
   * Unfeature article
   * @returns {object} Updated news
   */
  News.prototype.unfeature = async function () {
    this.featured = false;
    return this.save();
  };

  /**
   * Check if article is published
   * @returns {boolean} True if published
   */
  News.prototype.isPublished = function () {
    return this.status === 'published';
  };

  /**
   * Check if article is draft
   * @returns {boolean} True if draft
   */
  News.prototype.isDraft = function () {
    return this.status === 'draft';
  };

  /**
   * Check if article is archived
   * @returns {boolean} True if archived
   */
  News.prototype.isArchived = function () {
    return this.status === 'archived';
  };

  /**
   * Check if published and not expired
   * @returns {boolean} True if active
   */
  News.prototype.isActive = function () {
    const now = new Date();
    return (
      this.status === 'published' && (!this.expiresAt || this.expiresAt > now)
    );
  };

  /**
   * Check if article has expired
   * @returns {boolean} True if expired
   */
  News.prototype.isExpired = function () {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  };

  /**
   * Get category badge for UI
   * @returns {object} Badge with label and color
   */
  News.prototype.getCategoryBadge = function () {
    const badges = {
      alert: { label: 'Alert', color: 'red' },
      update: { label: 'Update', color: 'blue' },
      safety_tip: { label: 'Safety Tip', color: 'green' },
      law_change: { label: 'Law Change', color: 'orange' },
      event: { label: 'Event', color: 'purple' },
      awareness: { label: 'Awareness', color: 'yellow' },
      announcement: { label: 'Announcement', color: 'gray' },
      other: { label: 'Other', color: 'gray' },
    };
    return badges[this.category] || badges.other;
  };

  /**
   * Get status badge for UI
   * @returns {object} Badge with label and color
   */
  News.prototype.getStatusBadge = function () {
    const badges = {
      draft: { label: 'Draft', color: 'gray' },
      scheduled: { label: 'Scheduled', color: 'yellow' },
      published: { label: 'Published', color: 'green' },
      archived: { label: 'Archived', color: 'gray' },
    };
    return badges[this.status] || badges.draft;
  };

  /**
   * Get priority badge
   * @returns {object} Badge with label and color
   */
  News.prototype.getPriorityBadge = function () {
    const badges = {
      low: { label: 'Low', color: 'green' },
      normal: { label: 'Normal', color: 'gray' },
      high: { label: 'High', color: 'orange' },
      urgent: { label: 'Urgent', color: 'red' },
    };
    return badges[this.priority] || badges.normal;
  };

  /**
   * Get reading time estimate (in minutes)
   * @returns {number} Estimated reading time
   */
  News.prototype.getReadingTime = function () {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  /**
   * Get formatted published date
   * @returns {string} Formatted date
   */
  News.prototype.getFormattedPublishedDate = function () {
    if (!this.publishedAt) return null;
    return this.publishedAt.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Get time since published
   * @returns {string} Human-readable time (e.g., "2h ago")
   */
  News.prototype.getTimeSincePublished = function () {
    if (!this.publishedAt) return null;
    const now = new Date();
    const elapsed = Math.floor((now - this.publishedAt) / 1000);

    if (elapsed < 60) return `${elapsed}s ago`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
    if (elapsed < 604800) return `${Math.floor(elapsed / 86400)}d ago`;
    return `${Math.floor(elapsed / 604800)}w ago`;
  };

  /**
   * Convert to safe JSON (exclude sensitive data)
   * @returns {object} Safe JSON representation
   */
  News.prototype.toSafeJSON = function () {
    return {
      newsId: this.newsId,
      title: this.title,
      slug: this.slug,
      summary: this.summary,
      category: this.category,
      categoryBadge: this.getCategoryBadge(),
      thumbnailUrl: this.thumbnailUrl,
      authorName: this.authorName,
      status: this.status,
      statusBadge: this.getStatusBadge(),
      publishedAt: this.getFormattedPublishedDate(),
      timeSincePublished: this.getTimeSincePublished(),
      featured: this.featured,
      pinned: this.pinned,
      priority: this.priority,
      priorityBadge: this.getPriorityBadge(),
      views: this.views,
      likes: this.likes,
      shares: this.shares,
      comments: this.comments,
      tags: this.tags,
      readingTime: this.getReadingTime(),
      allowComments: this.allowComments,
    };
  };

  // ============================================================================
  // CLASS METHODS
  // ============================================================================

  /**
   * Find published news
   * @param {number} limit - Result limit
   * @param {number} offset - Offset for pagination
   * @returns {array} Published news articles
   */
  News.findPublished = async function (limit = 20, offset = 0) {
    return this.findAll({
      where: { status: 'published' },
      order: [
        ['pinned', 'DESC'],
        ['featureOrder', 'ASC'],
        ['publishedAt', 'DESC'],
      ],
      limit,
      offset,
    });
  };

  /**
   * Find featured news
   * @param {number} limit - Result limit
   * @returns {array} Featured news articles
   */
  News.findFeatured = async function (limit = 5) {
    return this.findAll({
      where: { featured: true, status: 'published' },
      order: [['featureOrder', 'ASC']],
      limit,
    });
  };

  /**
   * Find pinned news
   * @param {number} limit - Result limit
   * @returns {array} Pinned news articles
   */
  News.findPinned = async function (limit = 3) {
    return this.findAll({
      where: { pinned: true, status: 'published' },
      order: [['featureOrder', 'ASC']],
      limit,
    });
  };

  /**
   * Find by category
   * @param {string} category - News category
   * @param {number} limit - Result limit
   * @returns {array} News by category
   */
  News.findByCategory = async function (category, limit = 20) {
    return this.findAll({
      where: { category, status: 'published' },
      order: [['publishedAt', 'DESC']],
      limit,
    });
  };

  /**
   * Find by author
   * @param {string} authorUserId - Admin user ID
   * @param {number} limit - Result limit
   * @returns {array} News by author
   */
  News.findByAuthor = async function (authorUserId, limit = 50) {
    return this.findAll({
      where: { authorUserId },
      order: [['createdAt', 'DESC']],
      limit,
    });
  };

  /**
   * Find by tag
   * @param {string} tag - Tag to search for
   * @param {number} limit - Result limit
   * @returns {array} News with tag
   */
  News.findByTag = async function (tag, limit = 20) {
    return this.findAll({
      where: sequelize.Sequelize.where(
        sequelize.Sequelize.fn(
          'jsonb_contains',
          sequelize.Sequelize.col('tags'),
          `"${tag}"`
        ),
        true
      ),
      order: [['publishedAt', 'DESC']],
      limit,
    });
  };

  /**
   * Find drafts
   * @param {number} limit - Result limit
   * @returns {array} Draft articles
   */
  News.findDrafts = async function (limit = 50) {
    return this.findAll({
      where: { status: 'draft' },
      order: [['createdAt', 'DESC']],
      limit,
    });
  };

  /**
   * Find scheduled articles
   * @returns {array} Articles scheduled but not published
   */
  News.findScheduled = async function () {
    return this.findAll({
      where: {
        status: 'scheduled',
        scheduledFor: {
          [sequelize.Sequelize.Op.lte]: new Date(),
        },
      },
      order: [['scheduledFor', 'ASC']],
    });
  };

  /**
   * Find by priority
   * @param {string} priority - Priority level
   * @param {number} limit - Result limit
   * @returns {array} News by priority
   */
  News.findByPriority = async function (priority, limit = 50) {
    return this.findAll({
      where: { priority, status: 'published' },
      order: [['publishedAt', 'DESC']],
      limit,
    });
  };

  /**
   * Find urgent news
   * @returns {array} Urgent news articles
   */
  News.findUrgent = async function () {
    return this.findAll({
      where: { priority: 'urgent', status: 'published' },
      order: [['publishedAt', 'DESC']],
    });
  };

  /**
   * Search news by title and content
   * @param {string} query - Search query
   * @param {number} limit - Result limit
   * @returns {array} Matching news
   */
  News.search = async function (query, limit = 20) {
    return this.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { title: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
          { content: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
          { summary: { [sequelize.Sequelize.Op.iLike]: `%${query}%` } },
        ],
        status: 'published',
      },
      order: [['publishedAt', 'DESC']],
      limit,
    });
  };

  /**
   * Get trending news by views
   * @param {number} days - Days to lookback
   * @param {number} limit - Result limit
   * @returns {array} Trending news
   */
  News.getTrending = async function (days = 7, limit = 10) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.findAll({
      where: {
        status: 'published',
        publishedAt: {
          [sequelize.Sequelize.Op.gte]: startDate,
        },
      },
      order: [['views', 'DESC']],
      limit,
    });
  };

  /**
   * Get popular news by engagement (likes + shares + comments)
   * @param {number} limit - Result limit
   * @returns {array} Popular news
   */
  News.getPopular = async function (limit = 10) {
    return this.findAll({
      where: { status: 'published' },
      order: [
        [sequelize.Sequelize.literal('(likes + shares + comments)'), 'DESC'],
      ],
      limit,
    });
  };

  /**
   * Get related news
   * @param {string} newsId - News article ID
   * @param {number} limit - Result limit
   * @returns {array} Related news
   */
  News.getRelated = async function (newsId, limit = 5) {
    const article = await this.findByPk(newsId);
    if (
      !article ||
      !article.relatedNewsIds ||
      article.relatedNewsIds.length === 0
    ) {
      return [];
    }

    return this.findAll({
      where: {
        newsId: {
          [sequelize.Sequelize.Op.in]: article.relatedNewsIds,
        },
        status: 'published',
      },
      limit,
    });
  };

  /**
   * Get count by category
   * @returns {object} Category counts
   */
  News.countByCategory = async function () {
    const counts = await this.findAll({
      attributes: [
        'category',
        [
          sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('newsId')),
          'count',
        ],
      ],
      where: { status: 'published' },
      group: ['category'],
      raw: true,
    });

    const result = {};
    counts.forEach((row) => {
      result[row.category] = parseInt(row.count, 10);
    });
    return result;
  };

  /**
   * Get statistics for admin dashboard
   * @returns {object} News statistics
   */
  News.getStatistics = async function () {
    const total = await this.count();
    const published = await this.count({ where: { status: 'published' } });
    const drafts = await this.count({ where: { status: 'draft' } });
    const scheduled = await this.count({ where: { status: 'scheduled' } });
    const archived = await this.count({ where: { status: 'archived' } });

    const totalViews = await this.sum('views', {
      where: { status: 'published' },
    });
    const totalLikes = await this.sum('likes', {
      where: { status: 'published' },
    });
    const totalComments = await this.sum('comments', {
      where: { status: 'published' },
    });

    return {
      total,
      published,
      drafts,
      scheduled,
      archived,
      totalViews: totalViews || 0,
      totalLikes: totalLikes || 0,
      totalComments: totalComments || 0,
      avgViewsPerArticle:
        published > 0 ? Math.round((totalViews || 0) / published) : 0,
    };
  };

  /**
   * Get recent activity
   * @param {number} days - Days lookback
   * @returns {array} Recent news activity
   */
  News.getRecentActivity = async function (days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.findAll({
      where: {
        [sequelize.Sequelize.Op.or]: [
          { createdAt: { [sequelize.Sequelize.Op.gte]: startDate } },
          { updatedAt: { [sequelize.Sequelize.Op.gte]: startDate } },
        ],
      },
      order: [['updatedAt', 'DESC']],
    });
  };

  // ============================================================================
  // ASSOCIATIONS
  // ============================================================================

  News.associate = (models) => {
    // Author/admin who created the news
    News.belongsTo(models.User, {
      foreignKey: 'authorUserId',
      as: 'author',
      onDelete: 'CASCADE',
    });
  };

  return News;
};
