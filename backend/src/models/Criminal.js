/**
 * Criminal Sequelize Model
 *
 * Represents criminal records in the system (police records database)
 * Used by police officers to lookup and track criminal information
 * Mobile app only - police officers can view and update records
 *
 * Fields: Full description, warning level, last seen location, photo, ID number
 */

const criminalModel = (sequelize, DataTypes) => {
  const Criminal = sequelize.define(
    'Criminal',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // Identification
      idNumber: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          msg: 'ID number already exists',
        },
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      // Physical description & identification
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true,
      },
      // Photo/Image
      photoUrl: {
        type: DataTypes.STRING(500),
        allowNull: true,
        validate: {
          isUrl: {
            msg: 'Photo URL must be valid',
          },
        },
      },
      photoUploadedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Contact & Details
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: {
            msg: 'Must be valid email',
          },
        },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Location tracking
      lastSeenLocation: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      lastSeenAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
      // Risk Assessment
      warningLevel: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'low',
      },
      warningReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Criminal History & Description
      fullDescription: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: {
            args: [10, 5000],
            msg: 'Description must be between 10 and 5000 characters',
          },
        },
      },
      knownOffenses: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of past offense records',
      },
      aliases: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Known aliases/nicknames',
      },
      // Gang/Group affiliation
      affiliations: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Identification marks
      distinguishingMarks: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Tattoos, scars, birthmarks, etc.',
      },
      // Status
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'arrested', 'deceased'),
        allowNull: false,
        defaultValue: 'active',
      },
      isWanted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      wantedSince: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wantedReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // Additional info
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
      // Tracking
      createdByOfficerId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'Officer who added this record',
      },
      lastUpdatedByOfficerId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'Officer who last updated this record',
      },
      lastUpdatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      underscored: true,
      paranoid: true, // Soft delete
      indexes: [
        {
          fields: ['id_number'],
        },
        {
          fields: ['first_name', 'last_name'],
        },
        {
          fields: ['warning_level'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['is_wanted'],
        },
        {
          fields: ['last_seen_at'],
        },
        {
          fields: ['created_at'],
        },
      ],
    }
  );

  /**
   * Associations
   */
  Criminal.associate = (models) => {
    // Criminal.belongsTo(models.User, {
    //   foreignKey: 'createdByOfficerId',
    //   as: 'createdByOfficer'
    // });
    // Criminal.belongsTo(models.User, {
    //   foreignKey: 'lastUpdatedByOfficerId',
    //   as: 'lastUpdatedByOfficer'
    // });
  };

  /**
   * Instance Methods
   */

  /**
   * Get full name
   */
  Criminal.prototype.getFullName = function () {
    return `${this.firstName} ${this.lastName}`.trim();
  };

  /**
   * Get age (from date of birth)
   */
  Criminal.prototype.getAge = function () {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    let age = today.getFullYear() - this.dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - this.dateOfBirth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())
    ) {
      age--;
    }
    return age;
  };

  /**
   * Check if criminal is wanted
   */
  Criminal.prototype.isCurrentlyWanted = function () {
    return (
      this.isWanted && this.status !== 'arrested' && this.status !== 'deceased'
    );
  };

  /**
   * Check if high risk (warning level)
   */
  Criminal.prototype.isHighRisk = function () {
    return this.warningLevel === 'high' || this.warningLevel === 'critical';
  };

  /**
   * Get warning level badge
   */
  Criminal.prototype.getWarningBadge = function () {
    const badges = {
      low: { label: 'Low', color: 'green' },
      medium: { label: 'Medium', color: 'yellow' },
      high: { label: 'High', color: 'orange' },
      critical: { label: 'Critical', color: 'red' },
    };
    return badges[this.warningLevel] || { label: 'Unknown', color: 'gray' };
  };

  /**
   * Get status badge
   */
  Criminal.prototype.getStatusBadge = function () {
    const badges = {
      active: { label: 'Active', color: 'red' },
      inactive: { label: 'Inactive', color: 'gray' },
      arrested: { label: 'Arrested', color: 'blue' },
      deceased: { label: 'Deceased', color: 'black' },
    };
    return badges[this.status] || { label: 'Unknown', color: 'gray' };
  };

  /**
   * Check if location is recent (within last 7 days)
   */
  Criminal.prototype.isLocationRecent = function () {
    if (!this.lastSeenAt) return false;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.lastSeenAt > sevenDaysAgo;
  };

  /**
   * Get days since last seen
   */
  Criminal.prototype.getDaysSinceLastSeen = function () {
    if (!this.lastSeenAt) return null;
    const now = new Date();
    const diffTime = Math.abs(now - this.lastSeenAt);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Update last seen location
   */
  Criminal.prototype.updateLastSeen = function (location, lat, lng, officerId) {
    this.lastSeenLocation = location;
    this.lastSeenAt = new Date();
    this.latitude = lat;
    this.longitude = lng;
    this.lastUpdatedByOfficerId = officerId;
    this.lastUpdatedAt = new Date();
    return this.save();
  };

  /**
   * Mark as wanted
   */
  Criminal.prototype.markAsWanted = function (reason, officerId) {
    this.isWanted = true;
    this.wantedSince = new Date();
    this.wantedReason = reason;
    this.lastUpdatedByOfficerId = officerId;
    this.lastUpdatedAt = new Date();
    return this.save();
  };

  /**
   * Mark as not wanted
   */
  Criminal.prototype.unmarkAsWanted = function (officerId) {
    this.isWanted = false;
    this.wantedSince = null;
    this.wantedReason = null;
    this.lastUpdatedByOfficerId = officerId;
    this.lastUpdatedAt = new Date();
    return this.save();
  };

  /**
   * Update warning level
   */
  Criminal.prototype.updateWarningLevel = function (level, reason, officerId) {
    this.warningLevel = level;
    this.warningReason = reason;
    this.lastUpdatedByOfficerId = officerId;
    this.lastUpdatedAt = new Date();
    return this.save();
  };

  /**
   * Add offense to history
   */
  Criminal.prototype.addOffense = function (offense) {
    if (!this.knownOffenses) this.knownOffenses = [];
    this.knownOffenses.push({
      ...offense,
      addedAt: new Date(),
    });
    return this.save();
  };

  /**
   * Get safe JSON (exclude sensitive fields if necessary)
   */
  Criminal.prototype.toSafeJSON = function () {
    return this.toJSON();
  };

  /**
   * Class Methods (Statics)
   */

  /**
   * Find wanted criminals
   */
  Criminal.findWanted = function () {
    return Criminal.findAll({
      where: {
        is_wanted: true,
        status: ['active', 'inactive'],
        deleted_at: null,
      },
      order: [['warning_level', 'DESC']],
    });
  };

  /**
   * Find high-risk criminals
   */
  Criminal.findHighRisk = function () {
    return Criminal.findAll({
      where: {
        warning_level: ['high', 'critical'],
        status: 'active',
        deleted_at: null,
      },
      order: [['last_seen_at', 'DESC']],
    });
  };

  /**
   * Find by ID number
   */
  Criminal.findByIdNumber = function (idNumber) {
    return Criminal.findOne({
      where: {
        id_number: idNumber,
        deleted_at: null,
      },
    });
  };

  /**
   * Find by full name
   */
  Criminal.findByName = function (firstName, lastName) {
    return Criminal.findAll({
      where: {
        first_name: firstName,
        last_name: lastName,
        deleted_at: null,
      },
    });
  };

  /**
   * Search by name (partial match)
   */
  Criminal.searchByName = function (query) {
    return Criminal.findAll({
      where: sequelize.where(
        sequelize.fn(
          'concat',
          sequelize.col('first_name'),
          ' ',
          sequelize.col('last_name')
        ),
        sequelize.Op.iLike,
        `%${query}%`
      ),
      deleted_at: null,
    });
  };

  /**
   * Find by warning level
   */
  Criminal.findByWarningLevel = function (level) {
    return Criminal.findAll({
      where: {
        warning_level: level,
        deleted_at: null,
      },
      order: [['last_seen_at', 'DESC']],
    });
  };

  /**
   * Find by status
   */
  Criminal.findByStatus = function (status) {
    return Criminal.findAll({
      where: {
        status: status,
        deleted_at: null,
      },
      order: [['created_at', 'DESC']],
    });
  };

  /**
   * Find recently seen (last 7 days)
   */
  Criminal.findRecentlySeen = function () {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return Criminal.findAll({
      where: {
        last_seen_at: {
          [sequelize.Op.gte]: sevenDaysAgo,
        },
        deleted_at: null,
      },
      order: [['last_seen_at', 'DESC']],
    });
  };

  /**
   * Find nearby criminals (using lat/lng coordinates)
   */
  Criminal.findNearby = function (latitude, longitude, radiusKm = 5) {
    // Using haversine formula approximation
    // For more accuracy, use PostGIS in real implementation
    const latOffset = radiusKm / 111; // ~111 km per degree
    const lngOffset = radiusKm / (111 * Math.cos(latitude * (Math.PI / 180)));

    return Criminal.findAll({
      where: {
        latitude: {
          [sequelize.Op.between]: [latitude - latOffset, latitude + latOffset],
        },
        longitude: {
          [sequelize.Op.between]: [
            longitude - lngOffset,
            longitude + lngOffset,
          ],
        },
        status: 'active',
        deleted_at: null,
      },
      order: [['last_seen_at', 'DESC']],
    });
  };

  /**
   * Get statistics
   */
  Criminal.getStatistics = function () {
    return sequelize.query(
      `
      SELECT
        COUNT(DISTINCT id) as total_records,
        COUNT(CASE WHEN is_wanted = true THEN 1 END) as wanted_count,
        COUNT(CASE WHEN warning_level = 'critical' THEN 1 END) as critical_count,
        COUNT(CASE WHEN warning_level = 'high' THEN 1 END) as high_count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN status = 'arrested' THEN 1 END) as arrested_count,
        COUNT(CASE WHEN last_seen_at > NOW() - INTERVAL '7 days' THEN 1 END) as recently_seen_count
      FROM criminals
      WHERE deleted_at IS NULL
      `,
      { type: sequelize.QueryTypes.SELECT }
    );
  };

  /**
   * Find by location area
   */
  Criminal.findByLocation = function (location) {
    return Criminal.findAll({
      where: {
        last_seen_location: {
          [sequelize.Op.iLike]: `%${location}%`,
        },
        deleted_at: null,
      },
      order: [['last_seen_at', 'DESC']],
    });
  };

  return Criminal;
};

export default criminalModel;
