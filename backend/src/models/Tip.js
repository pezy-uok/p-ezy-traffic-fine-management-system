/**
 * Tip Sequelize Model
 *
 * Represents crime tips/information submitted by public or officers
 * Can be about missing persons, crimes, incidents, or general intelligence
 * Supports anonymous submissions and reward tracking
 *
 * Fields: Title, description, category (crime type), status (new/investigating/resolved),
 * priority, submitter info, location, attachments, assigned officer, reward, notes
 */

export default (sequelize, DataTypes) => {
  const Tip = sequelize.define(
    'Tip',
    {
      // ========== IDENTIFICATION ==========
      tipId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Unique identifier for the tip',
      },

      // ========== CORE CONTENT ==========
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Short title/subject of the tip',
        validate: {
          len: {
            args: [5, 255],
            msg: 'Title must be between 5 and 255 characters',
          },
        },
        index: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Detailed description of the tip information',
        validate: {
          len: {
            args: [20, 10000],
            msg: 'Description must be between 20 and 10000 characters',
          },
        },
      },

      // ========== CATEGORIZATION ==========
      category: {
        type: DataTypes.ENUM(
          'missing_person',
          'crime_report',
          'accident',
          'suspicious_activity',
          'fraud',
          'theft',
          'violence',
          'drug_related',
          'traffic_violation',
          'wanted_person',
          'witness_information',
          'security_threat',
          'other'
        ),
        allowNull: false,
        comment: 'Type/category of the tip',
        index: true,
      },

      subCategory: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment:
          'More specific subcategory (e.g., "armed robbery" under theft)',
      },

      tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of tags for filtering: ["urgent", "location:downtown"]',
      },

      // ========== STATUS & PRIORITY ==========
      status: {
        type: DataTypes.ENUM(
          'new',
          'investigating',
          'resolved',
          'archived',
          'dismissed'
        ),
        allowNull: false,
        defaultValue: 'new',
        comment: 'Current status of the tip',
        index: true,
      },

      priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'medium',
        comment: 'Priority level for investigation',
        index: true,
      },

      statusUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When status was last changed',
      },

      statusReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for status change (e.g., why dismissed)',
      },

      // ========== SUBMITTER INFORMATION ==========
      submittedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'userId',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'User who submitted the tip (null if anonymous)',
      },

      isAnonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether the tip was submitted anonymously',
      },

      submitterName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Name provided by anonymous submitter',
      },

      submitterEmail: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: {
            msg: 'Must be valid email',
          },
        },
        comment: 'Contact email for follow-up',
      },

      submitterPhone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Phone number for follow-up',
      },

      submitterAddress: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Address of submitter (for in-person verification)',
      },

      allowContact: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Whether submitter allows police to contact them',
      },

      // ========== LOCATION & GEOGRAPHY ==========
      location: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Address/location where incident occurred',
        index: true,
      },

      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        comment: 'Latitude coordinate of incident location',
      },

      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        comment: 'Longitude coordinate of incident location',
      },

      radius: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Radius in meters if location is approximate',
      },

      jurisdiction: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Police jurisdiction/precinct for the location',
      },

      // ========== INCIDENT DETAILS ==========
      incidentDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When the incident occurred',
      },

      incidentDateApproximate: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether the incident date is approximate',
      },

      incidentTime: {
        type: DataTypes.TIME,
        allowNull: true,
        comment: 'Time when incident occurred',
      },

      witnesses: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Estimated number of witnesses',
      },

      estimatedValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        comment: 'Estimated value of items involved (theft/property damage)',
      },

      // ========== RELATED RECORDS ==========
      relatedCriminalId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Criminals',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'FK to Criminal if tip is about known criminal',
      },

      relatedCase: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Case number or reference if related to existing case',
      },

      relatedOffenses: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of referenced offense IDs or descriptions',
      },

      // ========== ASSIGNMENT & HANDLING ==========
      assignedOfficerId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'userId',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        comment: 'Officer assigned to investigate',
      },

      assignedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When tip was assigned',
      },

      department: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Department responsible for investigation',
      },

      investmentHours: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Hours spent investigating',
      },

      // ========== FOLLOW-UP INFORMATION ==========
      notes: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment:
          'Array of follow-up notes with timestamps: [{text, addedAt, addedBy}]',
      },

      actionsTaken: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of actions taken: [{action, date, officer}]',
      },

      outcome: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Final outcome/resolution of investigation',
      },

      investigationNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Detailed investigation findings',
      },

      // ========== REWARD PROGRAM ==========
      rewardOffered: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether reward is offered for information',
      },

      rewardAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Reward amount in dollars',
      },

      rewardCurrency: {
        type: DataTypes.STRING(10),
        defaultValue: 'USD',
        comment: 'Currency code for reward',
      },

      rewardClaimed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether reward was claimed',
      },

      rewardClaimedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'userId',
        },
        onDelete: 'SET NULL',
        comment: 'User who claimed the reward',
      },

      rewardClaimedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When reward was claimed',
      },

      // ========== ATTACHMENTS & MEDIA ==========
      attachments: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment:
          'Array of attachments: [{id, type, url, description, uploadedAt}]',
      },

      photos: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of photo URLs',
      },

      videos: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of video URLs',
      },

      documents: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of document URLs (screenshots, reports)',
      },

      // ========== VERIFICATION & CREDIBILITY ==========
      credibilityScore: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 0.5,
        validate: {
          min: 0,
          max: 1,
        },
        comment:
          'Score from 0-1 indicating credibility of tip (assessed by officers)',
      },

      verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether information has been verified',
      },

      verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When tip was verified',
      },

      verifiedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'userId',
        },
        onDelete: 'SET NULL',
        comment: 'Officer who verified the tip',
      },

      usefulnessRating: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 0,
          max: 5,
        },
        comment: 'Rating 0-5 for usefulness (set after investigation)',
      },

      // ========== VISIBILITY & SENSITIVITY ==========
      visibility: {
        type: DataTypes.ENUM(
          'confidential',
          'officers_only',
          'internal',
          'public'
        ),
        defaultValue: 'confidential',
        comment: 'Who can view this tip',
        index: true,
      },

      sensitive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether tip contains sensitive information',
      },

      redactedForPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether tip was redacted before public release',
      },

      // ========== METADATA & TRACKING ==========
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP address of submitter (if logged)',
      },

      userAgent: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Browser/app user agent (if logged)',
      },

      source: {
        type: DataTypes.ENUM(
          'web_form',
          'mobile_app',
          'phone_call',
          'email',
          'in_person',
          'other'
        ),
        defaultValue: 'web_form',
        comment: 'How the tip was submitted',
        index: true,
      },

      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Additional metadata (custom fields, source-specific data)',
      },

      // ========== SOFT DELETE & ARCHIVING ==========
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Soft delete timestamp (paranoid mode)',
      },

      archivedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When tip was archived',
      },

      archivedReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for archiving',
      },

      // ========== TIMESTAMPS ==========
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
    },
    {
      // ========== TABLE OPTIONS ==========
      tableName: 'Tips',
      timestamps: true,
      paranoid: true, // Soft delete with deletedAt
      underscored: false,
      indexes: [
        { fields: ['tipId'] },
        { fields: ['status'] },
        { fields: ['priority'] },
        { fields: ['category'] },
        { fields: ['submittedBy'] },
        { fields: ['assignedOfficerId'] },
        { fields: ['createdAt'] },
        { fields: ['location'] },
        { fields: ['verified'] },
        { fields: ['visibility'] },
        { fields: ['source'] },
        { fields: ['status', 'priority', 'createdAt'] }, // Composite for dashboard
        { fields: ['category', 'status', 'createdAt'] }, // Composite for filtering
        { fields: ['assignedOfficerId', 'status'] }, // For officer's assigned tips
      ],
      comment:
        'Table for crime tips and information submitted by public or officers',
    }
  );

  // ========== ASSOCIATIONS ==========
  Tip.associate = (models) => {
    // Submitter association (User)
    Tip.belongsTo(models.User, {
      foreignKey: 'submittedBy',
      as: 'submitter',
      targetKey: 'id',
      onDelete: 'SET NULL',
      constraints: false,
    });

    // Assigned officer association (User)
    Tip.belongsTo(models.User, {
      foreignKey: 'assignedOfficerId',
      as: 'assignedOfficer',
      targetKey: 'id',
      onDelete: 'SET NULL',
      constraints: false,
    });

    // Officer who verified association (User)
    Tip.belongsTo(models.User, {
      foreignKey: 'verifiedBy',
      as: 'verifyingOfficer',
      targetKey: 'id',
      onDelete: 'SET NULL',
      constraints: false,
    });

    // Reward claimer association (User)
    Tip.belongsTo(models.User, {
      foreignKey: 'rewardClaimedBy',
      as: 'rewardClaimant',
      targetKey: 'id',
      onDelete: 'SET NULL',
      constraints: false,
    });

    // Related Criminal association
    if (models.Criminal) {
      Tip.belongsTo(models.Criminal, {
        foreignKey: 'relatedCriminalId',
        as: 'relatedCriminal',
        targetKey: 'id',
        onDelete: 'SET NULL',
        constraints: false,
      });
    }
  };

  // ========== INSTANCE METHODS ==========

  /**
   * Get all notes for this tip
   */
  Tip.prototype.getNotes = function () {
    return this.notes || [];
  };

  /**
   * Add a note to the tip
   */
  Tip.prototype.addNote = function (text, userId) {
    if (!this.notes) {
      this.notes = [];
    }
    this.notes.push({
      text,
      addedAt: new Date(),
      addedBy: userId,
    });
    return this.notes;
  };

  /**
   * Get all actions taken on this tip
   */
  Tip.prototype.getActions = function () {
    return this.actionsTaken || [];
  };

  /**
   * Record an action taken
   */
  Tip.prototype.recordAction = function (action, officer) {
    if (!this.actionsTaken) {
      this.actionsTaken = [];
    }
    this.actionsTaken.push({
      action,
      date: new Date(),
      officer,
    });
    return this.actionsTaken;
  };

  /**
   * Check if tip is old (more than 30 days old and not resolved)
   */
  Tip.prototype.isLongstanding = function () {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return (
      this.createdAt < thirtyDaysAgo &&
      this.status !== 'resolved' &&
      this.status !== 'archived'
    );
  };

  /**
   * Calculate days since created
   */
  Tip.prototype.getDaysSinceCreated = function () {
    const now = new Date();
    const diffTime = Math.abs(now - this.createdAt);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  /**
   * Get all attachments
   */
  Tip.prototype.getAllAttachments = function () {
    const all = [];
    if (this.attachments) all.push(...this.attachments);
    if (this.photos) {
      this.photos.forEach((url) => {
        all.push({ type: 'photo', url });
      });
    }
    if (this.videos) {
      this.videos.forEach((url) => {
        all.push({ type: 'video', url });
      });
    }
    if (this.documents) {
      this.documents.forEach((url) => {
        all.push({ type: 'document', url });
      });
    }
    return all;
  };

  /**
   * Check if tip can be deleted (not resolved or archived)
   */
  Tip.prototype.canDelete = function () {
    return ['new', 'investigating'].includes(this.status);
  };

  return Tip;
};
