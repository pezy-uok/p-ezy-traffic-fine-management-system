/**
 * Warning Sequelize Model
 *
 * Represents warnings issued to drivers by police officers
 * Used as an escalation tool before fines or for behavioral tracking
 * Mobile app access for police officers to issue warnings in real-time
 *
 * Fields: Description, category, severity, driver, issued officer, status
 */

const warningModel = (sequelize, DataTypes) => {
  const Warning = sequelize.define(
    'Warning',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // Foreign Keys
      driverId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      issuedByOfficerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      // Warning Details
      category: {
        type: DataTypes.ENUM(
          'speeding',
          'traffic_light_violation',
          'parking_violation',
          'seatbelt_violation',
          'mobile_usage',
          'reckless_driving',
          'expired_license',
          'vehicle_condition',
          'other'
        ),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          len: {
            args: [10, 1000],
            msg: 'Description must be between 10 and 1000 characters',
          },
        },
      },
      // Severity Assessment
      severityLevel: {
        type: DataTypes.ENUM('minor', 'moderate', 'serious'),
        allowNull: false,
        defaultValue: 'minor',
      },
      // Location & Time
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      issuedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      // Vehicle Information
      vehicleRegistration: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      speedRecorded: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Recorded speed in kmph (if applicable)',
      },
      speedLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Speed limit at location in kmph',
      },
      // Evidence & Documentation
      evidencePhotos: {
        type: DataTypes.JSON,
        defaultValue: [],
        comment: 'Array of photo URLs documenting the violation',
      },
      witnessesPresent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      // Status & Escalation
      status: {
        type: DataTypes.ENUM(
          'issued',
          'acknowledged',
          'disputed',
          'escalated_to_fine'
        ),
        allowNull: false,
        defaultValue: 'issued',
      },
      acknowledgedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      acknowledgedByDriverId: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Whether driver acknowledged the warning',
      },
      // Escalation Tracking
      escalatedToFineId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'If escalated, reference to Fine model',
      },
      escalatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      escalationReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for escalating to fine (repeat offense, etc)',
      },
      // Dispute Handling
      disputedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      disputeDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      disputeStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: true,
      },
      disputeResolvedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Administrative Notes
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSON,
        defaultValue: {},
      },
      // Timestamps
      createdAt: {
        type: DataTypes.DATE,
        allowValue: false,
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
      },
    },
    {
      timestamps: true,
      underscored: true,
      paranoid: true, // Soft delete
      indexes: [
        {
          fields: ['driver_id'],
        },
        {
          fields: ['issued_by_officer_id'],
        },
        {
          fields: ['category'],
        },
        {
          fields: ['severity_level'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['issued_date'],
        },
        {
          fields: ['escalated_to_fine_id'],
        },
        {
          fields: ['status', 'driver_id'],
        },
      ],
    }
  );

  /**
   * Associations
   */
  Warning.associate = (models) => {
    // Warning.belongsTo(models.Driver, {
    //   foreignKey: 'driverId',
    //   as: 'driver'
    // });
    // Warning.belongsTo(models.User, {
    //   foreignKey: 'issuedByOfficerId',
    //   as: 'issuedByOfficer'
    // });
  };

  /**
   * Instance Methods
   */

  /**
   * Check if warning is still active (not escalated or disputed)
   */
  Warning.prototype.isActive = function () {
    return this.status === 'issued' || this.status === 'acknowledged';
  };

  /**
   * Check if warning can be escalated to fine
   */
  Warning.prototype.canBeEscalated = function () {
    return (
      (this.status === 'issued' || this.status === 'acknowledged') &&
      !this.escalatedToFineId
    );
  };

  /**
   * Get severity badge
   */
  Warning.prototype.getSeverityBadge = function () {
    const badges = {
      minor: { label: 'Minor', color: 'green' },
      moderate: { label: 'Moderate', color: 'yellow' },
      serious: { label: 'Serious', color: 'red' },
    };
    return badges[this.severityLevel] || { label: 'Unknown', color: 'gray' };
  };

  /**
   * Get status badge
   */
  Warning.prototype.getStatusBadge = function () {
    const badges = {
      issued: { label: 'Issued', color: 'blue' },
      acknowledged: { label: 'Acknowledged', color: 'green' },
      disputed: { label: 'Disputed', color: 'orange' },
      escalated_to_fine: { label: 'Escalated to Fine', color: 'red' },
    };
    return badges[this.status] || { label: 'Unknown', color: 'gray' };
  };

  /**
   * Get category display name
   */
  Warning.prototype.getCategoryName = function () {
    const categories = {
      speeding: 'Speeding',
      traffic_light_violation: 'Traffic Light Violation',
      parking_violation: 'Parking Violation',
      seatbelt_violation: 'Seatbelt Violation',
      mobile_usage: 'Mobile Usage While Driving',
      reckless_driving: 'Reckless Driving',
      expired_license: 'Expired License/Documents',
      vehicle_condition: 'Vehicle Condition Issue',
      other: 'Other',
    };
    return categories[this.category] || 'Unknown';
  };

  /**
   * Days since warning was issued
   */
  Warning.prototype.getDaysSinceIssued = function () {
    const now = new Date();
    const diffTime = Math.abs(now - this.issuedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  /**
   * Acknowledge warning by driver
   */
  Warning.prototype.acknowledgeByDriver = function (driverId) {
    if (this.driverId.toString() !== driverId.toString()) {
      throw new Error('Only the warned driver can acknowledge');
    }
    this.status = 'acknowledged';
    this.acknowledgedDate = new Date();
    this.acknowledgedByDriverId = true;
    return this.save();
  };

  /**
   * Escalate warning to fine
   */
  Warning.prototype.escalateToFine = function (fineId, reason) {
    if (!this.canBeEscalated()) {
      throw new Error('Warning cannot be escalated');
    }
    this.status = 'escalated_to_fine';
    this.escalatedToFineId = fineId;
    this.escalatedDate = new Date();
    this.escalationReason = reason;
    return this.save();
  };

  /**
   * Mark as disputed
   */
  Warning.prototype.markAsDisputed = function (disputeDescription) {
    this.status = 'disputed';
    this.disputedDate = new Date();
    this.disputeDescription = disputeDescription;
    this.disputeStatus = 'pending';
    return this.save();
  };

  /**
   * Resolve dispute
   */
  Warning.prototype.resolveDispute = function (approved) {
    if (this.status !== 'disputed') {
      throw new Error('Warning is not in disputed status');
    }
    this.disputeStatus = approved ? 'approved' : 'rejected';
    this.disputeResolvedDate = new Date();
    if (approved) {
      this.status = 'issued'; // Reset to issued if approved
    }
    return this.save();
  };

  /**
   * Check if speed recorded exceeds limit
   */
  Warning.prototype.isSpeedingViolation = function () {
    return (
      this.category === 'speeding' &&
      this.speedRecorded &&
      this.speedLimit &&
      this.speedRecorded > this.speedLimit
    );
  };

  /**
   * Get speed excess (kmph over limit)
   */
  Warning.prototype.getSpeedExcess = function () {
    if (this.isSpeedingViolation()) {
      return this.speedRecorded - this.speedLimit;
    }
    return 0;
  };

  /**
   * Get safe JSON
   */
  Warning.prototype.toSafeJSON = function () {
    return this.toJSON();
  };

  /**
   * Class Methods (Statics)
   */

  /**
   * Find pending warnings for driver
   */
  Warning.findPendingByDriver = function (driverId) {
    return Warning.findAll({
      where: {
        driver_id: driverId,
        status: ['issued', 'acknowledged'],
        deleted_at: null,
      },
      order: [['issued_date', 'DESC']],
    });
  };

  /**
   * Find disputed warnings
   */
  Warning.findDisputed = function () {
    return Warning.findAll({
      where: {
        status: 'disputed',
        deleted_at: null,
      },
      order: [['disputed_date', 'DESC']],
    });
  };

  /**
   * Find warnings by category
   */
  Warning.findByCategory = function (category) {
    return Warning.findAll({
      where: {
        category: category,
        deleted_at: null,
      },
      order: [['issued_date', 'DESC']],
    });
  };

  /**
   * Find by severity level
   */
  Warning.findBySeverity = function (level) {
    return Warning.findAll({
      where: {
        severity_level: level,
        status: ['issued', 'acknowledged'],
        deleted_at: null,
      },
      order: [['issued_date', 'DESC']],
    });
  };

  /**
   * Find warnings issued by officer
   */
  Warning.findByOfficer = function (officerId) {
    return Warning.findAll({
      where: {
        issued_by_officer_id: officerId,
        deleted_at: null,
      },
      order: [['issued_date', 'DESC']],
    });
  };

  /**
   * Find today's warnings
   */
  Warning.findTodaysWarnings = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Warning.findAll({
      where: {
        issued_date: {
          [sequelize.Op.between]: [today, tomorrow],
        },
        deleted_at: null,
      },
      order: [['issued_date', 'DESC']],
    });
  };

  /**
   * Find serious warnings (not yet escalated)
   */
  Warning.findSeriousUnescalated = function () {
    return Warning.findAll({
      where: {
        severity_level: 'serious',
        status: ['issued', 'acknowledged'],
        escalated_to_fine_id: null,
        deleted_at: null,
      },
      order: [['issued_date', 'DESC']],
    });
  };

  /**
   * Count warnings by category
   */
  Warning.countByCategory = function () {
    return sequelize.query(
      `
      SELECT
        category,
        COUNT(*) as count
      FROM warnings
      WHERE deleted_at IS NULL
      GROUP BY category
      ORDER BY count DESC
      `,
      { type: sequelize.QueryTypes.SELECT }
    );
  };

  /**
   * Get repeat violators (drivers with multiple warnings)
   */
  Warning.findRepeatViolators = function (minWarnings = 3) {
    return sequelize.query(
      `
      SELECT
        driver_id,
        COUNT(*) as warning_count,
        MAX(issued_date) as last_warning_date
      FROM warnings
      WHERE deleted_at IS NULL AND status IN ('issued', 'acknowledged')
      GROUP BY driver_id
      HAVING COUNT(*) >= ${minWarnings}
      ORDER BY warning_count DESC
      `,
      { type: sequelize.QueryTypes.SELECT }
    );
  };

  /**
   * Get warning statistics
   */
  Warning.getStatistics = function () {
    return sequelize.query(
      `
      SELECT
        COUNT(DISTINCT id) as total_warnings,
        COUNT(CASE WHEN status = 'issued' THEN 1 END) as issued_count,
        COUNT(CASE WHEN status = 'acknowledged' THEN 1 END) as acknowledged_count,
        COUNT(CASE WHEN status = 'disputed' THEN 1 END) as disputed_count,
        COUNT(CASE WHEN status = 'escalated_to_fine' THEN 1 END) as escalated_count,
        COUNT(CASE WHEN severity_level = 'serious' THEN 1 END) as serious_count,
        COUNT(CASE WHEN severity_level = 'moderate' THEN 1 END) as moderate_count,
        COUNT(CASE WHEN severity_level = 'minor' THEN 1 END) as minor_count,
        COUNT(DISTINCT driver_id) as unique_drivers_warned
      FROM warnings
      WHERE deleted_at IS NULL
      `,
      { type: sequelize.QueryTypes.SELECT }
    );
  };

  /**
   * Find warnings between dates
   */
  Warning.findByDateRange = function (startDate, endDate) {
    return Warning.findAll({
      where: {
        issued_date: {
          [sequelize.Op.between]: [startDate, endDate],
        },
        deleted_at: null,
      },
      order: [['issued_date', 'DESC']],
    });
  };

  return Warning;
};

export default warningModel;
