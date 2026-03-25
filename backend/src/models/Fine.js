/**
 * Fine Sequelize Model
 *
 * Represents fines issued to drivers by police officers
 * - Created by police officers via mobile app
 * - Tracks fine status: unpaid, paid, outdated
 * - Automatically marks fines as outdated after 14 days overdue
 * - Links drivers to the fines they need to pay
 */

const fineModel = (sequelize, DataTypes) => {
  const Fine = sequelize.define(
    'Fine',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      // Foreign keys
      driverId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'drivers',
          key: 'id',
        },
      },
      issuedByOfficerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        comment: 'Police officer who issued this fine',
      },
      // Fine details
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0.01,
        },
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Description of the violation',
      },
      violationCode: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Traffic violation code/reference',
      },
      // Location & vehicle details
      location: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Location where violation occurred',
      },
      vehicleRegistration: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Vehicle registration number at time of violation',
      },
      // Date tracking
      issueDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Date fine was issued',
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: 'Payment due date (14 days from issue)',
      },
      // Payment status
      status: {
        type: DataTypes.ENUM('unpaid', 'paid', 'outdated'),
        allowNull: false,
        defaultValue: 'unpaid',
        comment:
          'unpaid: Not yet paid | paid: Payment received | outdated: Overdue 14+ days',
      },
      paymentDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date payment was received',
      },
      paymentMethod: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'e.g., credit_card, bank_transfer, cash',
      },
      // Metadata
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Additional notes about the fine',
      },
      metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
      },
    },
    {
      timestamps: true,
      underscored: true,
      paranoid: true, // Soft delete: deletedAt column
      indexes: [
        {
          fields: ['driver_id'],
        },
        {
          fields: ['issued_by_officer_id'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['due_date'],
        },
        {
          fields: ['issue_date'],
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
  Fine.associate = (models) => {
    // Fine belongs to Driver
    Fine.belongsTo(models.Driver, {
      foreignKey: 'driverId',
      as: 'driver',
    });

    // Fine issued by User (police officer)
    Fine.belongsTo(models.User, {
      foreignKey: 'issuedByOfficerId',
      as: 'issuedByOfficer',
    });
  };

  /**
   * Instance Methods
   */

  /**
   * Check if fine is overdue
   */
  Fine.prototype.isOverdue = function () {
    return new Date() > this.dueDate && this.status === 'unpaid';
  };

  /**
   * Calculate days overdue
   */
  Fine.prototype.getDaysOverdue = function () {
    if (!this.isOverdue()) return 0;
    const today = new Date();
    const daysOverdue = Math.floor(
      (today - this.dueDate) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, daysOverdue);
  };

  /**
   * Check if fine is outdated (14+ days overdue)
   */
  Fine.prototype.isOutdated = function () {
    return this.status === 'outdated' || this.getDaysOverdue() >= 14;
  };

  /**
   * Mark fine as outdated if it meets the criteria
   */
  Fine.prototype.updateOutdatedStatus = function () {
    if (this.isOutdated() && this.status !== 'outdated') {
      this.status = 'outdated';
      return this.save();
    }
    return Promise.resolve(this);
  };

  /**
   * Mark fine as paid
   */
  Fine.prototype.markAsPaid = function (
    paymentDate = null,
    paymentMethod = null
  ) {
    this.status = 'paid';
    this.paymentDate = paymentDate || new Date();
    if (paymentMethod) {
      this.paymentMethod = paymentMethod;
    }
    return this.save();
  };

  /**
   * Get payment days remaining
   */
  Fine.prototype.getPaymentDaysRemaining = function () {
    if (this.status === 'paid') return 0;
    const today = new Date();
    const daysRemaining = Math.ceil(
      (this.dueDate - today) / (1000 * 60 * 60 * 24)
    );
    return Math.max(0, daysRemaining);
  };

  /**
   * Get fine status badge
   */
  Fine.prototype.getStatusBadge = function () {
    if (this.status === 'paid') {
      return { status: 'paid', label: 'Paid', color: 'green' };
    }
    if (this.isOutdated()) {
      return { status: 'outdated', label: 'Outdated', color: 'red' };
    }
    if (this.isOverdue()) {
      return { status: 'overdue', label: 'Overdue', color: 'orange' };
    }
    return { status: 'unpaid', label: 'Unpaid', color: 'yellow' };
  };

  /**
   * Get safe fine object
   */
  Fine.prototype.toSafeJSON = function () {
    return this.toJSON();
  };

  /**
   * Class Methods (Statics)
   */

  /**
   * Find unpaid fines for a driver
   */
  Fine.findUnpaidByDriver = function (driverId) {
    return Fine.findAll({
      where: {
        driverId,
        status: ['unpaid', 'outdated'],
      },
      order: [['dueDate', 'ASC']],
    });
  };

  /**
   * Find overdue fines (not yet 14 days overdue)
   */
  Fine.findOverdueFines = function () {
    const today = new Date();
    return Fine.findAll({
      where: {
        status: 'unpaid',
        dueDate: {
          [sequelize.Sequelize.Op.lt]: today,
        },
      },
      order: [['dueDate', 'ASC']],
    });
  };

  /**
   * Find outdated fines (14+ days overdue)
   */
  Fine.findOutdatedFines = function () {
    return Fine.findAll({
      where: {
        status: 'outdated',
      },
      order: [['dueDate', 'ASC']],
    });
  };

  /**
   * Find unpaid fines (both overdue and upcoming)
   */
  Fine.findUnpaidFines = function () {
    return Fine.findAll({
      where: {
        status: ['unpaid', 'outdated'],
      },
      order: [['dueDate', 'ASC']],
    });
  };

  /**
   * Find paid fines
   */
  Fine.findPaidFines = function (driverId) {
    return Fine.findAll({
      where: {
        driverId,
        status: 'paid',
      },
      order: [['paymentDate', 'DESC']],
    });
  };

  /**
   * Find fines issued by a police officer
   */
  Fine.findByOfficer = function (officerId) {
    return Fine.findAll({
      where: {
        issuedByOfficerId: officerId,
      },
      order: [['issueDate', 'DESC']],
    });
  };

  /**
   * Find fines issued today by an officer
   */
  Fine.findTodaysIssuesByOfficer = function (officerId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Fine.findAll({
      where: {
        issuedByOfficerId: officerId,
        issueDate: {
          [sequelize.Sequelize.Op.between]: [today, tomorrow],
        },
      },
      order: [['issueDate', 'DESC']],
    });
  };

  /**
   * Get fine statistics
   */
  Fine.getStatistics = function () {
    return sequelize.query(
      `
      SELECT
        COUNT(*) as total_fines,
        SUM(CASE WHEN status = 'unpaid' THEN 1 ELSE 0 END) as unpaid_count,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
        SUM(CASE WHEN status = 'outdated' THEN 1 ELSE 0 END) as outdated_count,
        SUM(CASE WHEN status = 'unpaid' OR status = 'outdated' THEN amount ELSE 0 END) as outstanding_amount,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount
      FROM fines
      WHERE deleted_at IS NULL
      `,
      { type: sequelize.QueryTypes.SELECT }
    );
  };

  /**
   * Auto-update outdated fines (run periodically)
   */
  Fine.updateOutdatedFinesDaily = async function () {
    const overdueFines = await Fine.findOverdueFines();
    const updates = overdueFines.map((fine) => {
      if (fine.getDaysOverdue() >= 14) {
        fine.status = 'outdated';
        return fine.save();
      }
      return Promise.resolve(fine);
    });

    return Promise.all(updates);
  };

  return Fine;
};

export default fineModel;
