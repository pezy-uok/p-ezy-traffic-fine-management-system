export default (sequelize, DataTypes) => {
  const AuditLog = sequelize.define(
    'AuditLog',
    {
      auditLogId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        comment: 'Unique identifier for audit log entry',
      },

      // Actor Information
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        comment: 'Officer/Admin who performed the action',
        references: {
          model: 'Users',
          key: 'userId',
        },
        index: true,
      },

      userRole: {
        type: DataTypes.ENUM('officer', 'admin', 'system'),
        allowNull: false,
        defaultValue: 'officer',
        comment: 'Role of user who performed action',
      },

      // Driver Reference (Denormalized - as required)
      licenseNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Driver license number (denormalized for quick lookup)',
        index: true,
      },

      driverId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'Driver being audited (if applicable)',
        references: {
          model: 'Drivers',
          key: 'driverId',
        },
        index: true,
      },

      // Action Details
      action: {
        type: DataTypes.ENUM(
          'create',
          'read',
          'update',
          'delete',
          'export',
          'import',
          'acknowledge',
          'approve',
          'reject',
          'escalate',
          'cancel',
          'refund',
          'dispute',
          'resolve',
          'login',
          'logout',
          'download',
          'upload',
          'verify',
          'flag',
          'search'
        ),
        allowNull: false,
        comment: 'Type of action performed',
        index: true,
      },

      // Entity Being Changed
      entityType: {
        type: DataTypes.ENUM(
          'User',
          'Driver',
          'Fine',
          'Criminal',
          'Warning',
          'Payment',
          'Dispute',
          'Officer',
          'Admin',
          'System'
        ),
        allowNull: false,
        comment: 'Type of entity affected',
        index: true,
      },

      entityId: {
        type: DataTypes.UUID,
        allowNull: true,
        comment: 'ID of the entity being audited',
        index: true,
      },

      entityName: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment:
          'Display name/identifier of entity (e.g., license number, fine ID)',
      },

      // Change Details
      fieldName: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Field that was changed (for updates)',
      },

      oldValue: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Previous value of the field',
      },

      newValue: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'New value of the field',
      },

      changeSummary: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Human-readable summary of changes',
      },

      // Request Context
      ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        comment: 'IP address of request (supports IPv4 and IPv6)',
      },

      userAgent: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'User agent string for device/browser tracking',
      },

      requestMethod: {
        type: DataTypes.STRING(10),
        allowNull: true,
        comment: 'HTTP method (GET, POST, PUT, DELETE, PATCH)',
      },

      requestPath: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'API endpoint that was called',
      },

      // Metadata
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Reason for the action (e.g., fine escalation reason)',
      },

      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional notes about the audit event',
      },

      status: {
        type: DataTypes.ENUM('success', 'failed', 'pending'),
        allowNull: false,
        defaultValue: 'success',
        comment: 'Status of the audited action',
        index: true,
      },

      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Error message if action failed',
      },

      resultSummary: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON summary of action result (counts, values, etc.)',
      },

      // Severity Level
      severity: {
        type: DataTypes.ENUM('info', 'warning', 'critical'),
        allowNull: false,
        defaultValue: 'info',
        comment: 'Severity level of the action (for alerting)',
        index: true,
      },

      // Timestamps
      timestamp: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'When the action was performed',
        index: true,
      },

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
        comment: 'Soft delete timestamp (never actually delete audit logs)',
      },
    },
    {
      sequelize,
      modelName: 'AuditLog',
      tableName: 'auditlogs',
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          fields: ['userId'],
          name: 'idx_auditlog_user_id',
        },
        {
          fields: ['driverId'],
          name: 'idx_auditlog_driver_id',
        },
        {
          fields: ['licenseNumber'],
          name: 'idx_auditlog_license_number',
        },
        {
          fields: ['action'],
          name: 'idx_auditlog_action',
        },
        {
          fields: ['entityType'],
          name: 'idx_auditlog_entity_type',
        },
        {
          fields: ['entityId'],
          name: 'idx_auditlog_entity_id',
        },
        {
          fields: ['status'],
          name: 'idx_auditlog_status',
        },
        {
          fields: ['severity'],
          name: 'idx_auditlog_severity',
        },
        {
          fields: ['timestamp'],
          name: 'idx_auditlog_timestamp',
        },
        {
          fields: ['userId', 'timestamp'],
          name: 'idx_auditlog_user_timestamp',
        },
        {
          fields: ['entityType', 'entityId'],
          name: 'idx_auditlog_entity_composite',
        },
        {
          fields: ['licenseNumber', 'timestamp'],
          name: 'idx_auditlog_license_timestamp',
        },
        {
          fields: ['action', 'severity'],
          name: 'idx_auditlog_action_severity',
        },
      ],
      comment: 'Audit trail for all system actions and changes',
    }
  );

  // ============================================================================
  // INSTANCE METHODS
  // ============================================================================

  /**
   * Get action display name
   * @returns {string} User-friendly action name
   */
  AuditLog.prototype.getActionName = function () {
    const actionNames = {
      create: 'Created',
      read: 'Viewed',
      update: 'Updated',
      delete: 'Deleted',
      export: 'Exported',
      import: 'Imported',
      acknowledge: 'Acknowledged',
      approve: 'Approved',
      reject: 'Rejected',
      escalate: 'Escalated',
      cancel: 'Cancelled',
      refund: 'Refunded',
      dispute: 'Disputed',
      resolve: 'Resolved',
      login: 'Logged In',
      logout: 'Logged Out',
      download: 'Downloaded',
      upload: 'Uploaded',
      verify: 'Verified',
      flag: 'Flagged',
      search: 'Searched',
    };
    return actionNames[this.action] || this.action;
  };

  /**
   * Get severity badge for UI display
   * @returns {object} Badge with label and color
   */
  AuditLog.prototype.getSeverityBadge = function () {
    const badges = {
      info: { label: 'Info', color: 'blue' },
      warning: { label: 'Warning', color: 'orange' },
      critical: { label: 'Critical', color: 'red' },
    };
    return badges[this.severity] || badges.info;
  };

  /**
   * Get status badge for UI display
   * @returns {object} Badge with label and color
   */
  AuditLog.prototype.getStatusBadge = function () {
    const badges = {
      success: { label: 'Success', color: 'green' },
      failed: { label: 'Failed', color: 'red' },
      pending: { label: 'Pending', color: 'yellow' },
    };
    return badges[this.status] || badges.success;
  };

  /**
   * Format timestamp for display
   * @returns {string} Formatted timestamp
   */
  AuditLog.prototype.getFormattedTimestamp = function () {
    return this.timestamp.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  /**
   * Get time elapsed since action
   * @returns {string} Human-readable time elapsed
   */
  AuditLog.prototype.getTimeElapsed = function () {
    const now = new Date();
    const elapsed = Math.floor((now - this.timestamp) / 1000);

    if (elapsed < 60) return `${elapsed}s ago`;
    if (elapsed < 3600) return `${Math.floor(elapsed / 60)}m ago`;
    if (elapsed < 86400) return `${Math.floor(elapsed / 3600)}h ago`;
    return `${Math.floor(elapsed / 86400)}d ago`;
  };

  /**
   * Check if action was successful
   * @returns {boolean} True if successful
   */
  AuditLog.prototype.isSuccessful = function () {
    return this.status === 'success';
  };

  /**
   * Check if action failed
   * @returns {boolean} True if failed
   */
  AuditLog.prototype.hasFailed = function () {
    return this.status === 'failed';
  };

  /**
   * Check if severity is critical
   * @returns {boolean} True if critical
   */
  AuditLog.prototype.isCritical = function () {
    return this.severity === 'critical';
  };

  /**
   * Get detailed change description
   * @returns {string} Human-readable change description
   */
  AuditLog.prototype.getChangeDescription = function () {
    if (this.action === 'update' && this.fieldName) {
      return `${this.getActionName()} ${this.fieldName} from "${this.oldValue}" to "${this.newValue}"`;
    }
    return this.changeSummary || `${this.getActionName()} ${this.entityType}`;
  };

  /**
   * Convert to safe JSON (exclude sensitive data)
   * @returns {object} Safe JSON representation
   */
  AuditLog.prototype.toSafeJSON = function () {
    return {
      auditLogId: this.auditLogId,
      userId: this.userId,
      userRole: this.userRole,
      licenseNumber: this.licenseNumber,
      action: this.action,
      actionName: this.getActionName(),
      entityType: this.entityType,
      entityId: this.entityId,
      entityName: this.entityName,
      changeDescription: this.getChangeDescription(),
      severity: this.severity,
      severityBadge: this.getSeverityBadge(),
      status: this.status,
      statusBadge: this.getStatusBadge(),
      timestamp: this.getFormattedTimestamp(),
      timeElapsed: this.getTimeElapsed(),
      notes: this.notes,
    };
  };

  // ============================================================================
  // CLASS METHODS
  // ============================================================================

  /**
   * Create audit log entry
   * @param {object} data - Log data
   * @returns {object} Created audit log
   */
  AuditLog.createEntry = async function (data) {
    return this.create({
      userId: data.userId,
      userRole: data.userRole || 'officer',
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      entityName: data.entityName,
      driverId: data.driverId,
      licenseNumber: data.licenseNumber,
      fieldName: data.fieldName,
      oldValue: data.oldValue,
      newValue: data.newValue,
      changeSummary: data.changeSummary,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      requestMethod: data.requestMethod,
      requestPath: data.requestPath,
      reason: data.reason,
      notes: data.notes,
      status: data.status || 'success',
      errorMessage: data.errorMessage,
      resultSummary: data.resultSummary,
      severity: data.severity || 'info',
      timestamp: data.timestamp || new Date(),
    });
  };

  /**
   * Find logs by user
   * @param {string} userId - Officer/Admin ID
   * @param {number} limit - Result limit
   * @returns {array} Audit logs
   */
  AuditLog.findByUser = async function (userId, limit = 50) {
    return this.findAll({
      where: { userId },
      order: [['timestamp', 'DESC']],
      limit,
    });
  };

  /**
   * Find logs by driver license
   * @param {string} licenseNumber - Driver license
   * @param {number} limit - Result limit
   * @returns {array} Audit logs
   */
  AuditLog.findByLicense = async function (licenseNumber, limit = 50) {
    return this.findAll({
      where: { licenseNumber },
      order: [['timestamp', 'DESC']],
      limit,
    });
  };

  /**
   * Find logs for entity
   * @param {string} entityType - Entity type
   * @param {string} entityId - Entity ID
   * @returns {array} Audit logs
   */
  AuditLog.findByEntity = async function (entityType, entityId) {
    return this.findAll({
      where: { entityType, entityId },
      order: [['timestamp', 'DESC']],
    });
  };

  /**
   * Find logs by action type
   * @param {string} action - Action type
   * @param {number} limit - Result limit
   * @returns {array} Audit logs
   */
  AuditLog.findByAction = async function (action, limit = 50) {
    return this.findAll({
      where: { action },
      order: [['timestamp', 'DESC']],
      limit,
    });
  };

  /**
   * Find critical logs
   * @param {number} limit - Result limit
   * @returns {array} Critical audit logs
   */
  AuditLog.findCritical = async function (limit = 50) {
    return this.findAll({
      where: { severity: 'critical' },
      order: [['timestamp', 'DESC']],
      limit,
    });
  };

  /**
   * Find failed operations
   * @param {number} limit - Result limit
   * @returns {array} Failed audit logs
   */
  AuditLog.findFailed = async function (limit = 50) {
    return this.findAll({
      where: { status: 'failed' },
      order: [['timestamp', 'DESC']],
      limit,
    });
  };

  /**
   * Find by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {array} Audit logs in range
   */
  AuditLog.findByDateRange = async function (startDate, endDate) {
    return this.findAll({
      where: {
        timestamp: {
          [sequelize.Sequelize.Op.between]: [startDate, endDate],
        },
      },
      order: [['timestamp', 'DESC']],
    });
  };

  /**
   * Get statistics
   * @returns {object} Audit statistics
   */
  AuditLog.getStatistics = async function () {
    const total = await this.count();
    const successful = await this.count({ where: { status: 'success' } });
    const failed = await this.count({ where: { status: 'failed' } });
    const critical = await this.count({ where: { severity: 'critical' } });

    return {
      total,
      successful,
      failed,
      critical,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(2) : 0,
    };
  };

  /**
   * Count by action
   * @returns {object} Action counts
   */
  AuditLog.countByAction = async function () {
    const logs = await this.findAll({
      attributes: [
        'action',
        [
          sequelize.Sequelize.fn(
            'COUNT',
            sequelize.Sequelize.col('auditLogId')
          ),
          'count',
        ],
      ],
      group: ['action'],
      raw: true,
    });

    const result = {};
    logs.forEach((log) => {
      result[log.action] = parseInt(log.count, 10);
    });
    return result;
  };

  /**
   * Count by entity type
   * @returns {object} Entity type counts
   */
  AuditLog.countByEntity = async function () {
    const logs = await this.findAll({
      attributes: [
        'entityType',
        [
          sequelize.Sequelize.fn(
            'COUNT',
            sequelize.Sequelize.col('auditLogId')
          ),
          'count',
        ],
      ],
      group: ['entityType'],
      raw: true,
    });

    const result = {};
    logs.forEach((log) => {
      result[log.entityType] = parseInt(log.count, 10);
    });
    return result;
  };

  /**
   * Find user activity by date
   * @param {string} userId - Officer/Admin ID
   * @param {Date} date - Date to check
   * @returns {array} Activity logs for the day
   */
  AuditLog.findUserActivityByDate = async function (userId, date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.findAll({
      where: {
        userId,
        timestamp: {
          [sequelize.Sequelize.Op.between]: [startOfDay, endOfDay],
        },
      },
      order: [['timestamp', 'ASC']],
    });
  };

  /**
   * Find suspicious activity
   * @param {number} failureThreshold - Failure count threshold
   * @returns {array} Suspicious activity logs
   */
  AuditLog.findSuspiciousActivity = async function (failureThreshold = 5) {
    const users = await this.findAll({
      attributes: [
        'userId',
        [
          sequelize.Sequelize.fn(
            'COUNT',
            sequelize.Sequelize.col('auditLogId')
          ),
          'failureCount',
        ],
      ],
      where: { status: 'failed' },
      group: ['userId'],
      having: sequelize.Sequelize.where(
        sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('auditLogId')),
        sequelize.Sequelize.Op.gte,
        failureThreshold
      ),
      raw: true,
    });

    return users;
  };

  /**
   * Archive old logs (logical delete via soft delete)
   * @param {number} daysOld - Delete logs older than N days
   * @returns {number} Count of archived logs
   */
  AuditLog.archiveOldLogs = async function (daysOld = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.destroy({
      where: {
        timestamp: {
          [sequelize.Sequelize.Op.lt]: cutoffDate,
        },
      },
      force: false, // Soft delete
    });
  };

  /**
   * Restore archived logs
   * @param {number} daysOld - Restore logs deleted N days ago
   * @returns {number} Count of restored logs
   */
  AuditLog.restoreArchived = async function (daysOld = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.restore({
      where: {
        deletedAt: {
          [sequelize.Sequelize.Op.lt]: cutoffDate,
        },
      },
    });
  };

  /**
   * Get activity summary for dashboard
   * @param {number} days - Number of days to summarize
   * @returns {object} Activity summary
   */
  AuditLog.getActivitySummary = async function (days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.findAll({
      where: {
        timestamp: {
          [sequelize.Sequelize.Op.gte]: startDate,
        },
      },
      raw: true,
    });

    const summary = {
      totalActions: logs.length,
      actionsByType: {},
      actionsBySeverity: { info: 0, warning: 0, critical: 0 },
      actionsByStatus: { success: 0, failed: 0, pending: 0 },
      topUsers: {},
    };

    logs.forEach((log) => {
      summary.actionsByType[log.action] =
        (summary.actionsByType[log.action] || 0) + 1;
      summary.actionsBySeverity[log.severity] += 1;
      summary.actionsByStatus[log.status] += 1;
      summary.topUsers[log.userId] = (summary.topUsers[log.userId] || 0) + 1;
    });

    return summary;
  };

  // ============================================================================
  // ASSOCIATIONS
  // ============================================================================

  AuditLog.associate = (models) => {
    // User who performed the action
    AuditLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'actor',
      onDelete: 'CASCADE',
    });

    // Driver being audited
    AuditLog.belongsTo(models.Driver, {
      foreignKey: 'driverId',
      as: 'driver',
      onDelete: 'SET NULL',
    });
  };

  return AuditLog;
};
