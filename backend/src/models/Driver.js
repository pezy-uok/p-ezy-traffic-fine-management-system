/**
 * Driver Sequelize Model
 *
 * Represents drivers in the system
 * - Can view and pay fines through web portal only
 * - Police officers see their outdated fines in mobile app
 * - Core identity linked to driving license number
 */

const driverModel = (sequelize, DataTypes) => {
  const Driver = sequelize.define(
    'Driver',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: {
          msg: 'Email already exists',
        },
        validate: {
          isEmail: {
            msg: 'Must be a valid email address',
          },
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      // Driver identity information
      licenseNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          msg: 'License number already exists',
        },
        comment: 'Driving license number (unique identifier)',
      },
      firstName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // License information
      licenseExpiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      licenseClass: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'e.g., A, B, C (vehicle categories)',
      },
      licenseStatus: {
        type: DataTypes.ENUM('valid', 'expired', 'suspended', 'revoked'),
        allowNull: false,
        defaultValue: 'valid',
      },
      // Address information
      address: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      state: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      postalCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      // Vehicle information (optional - primary vehicle)
      vehicleRegistrationNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: {
          msg: 'Vehicle registration number already registered',
        },
      },
      vehicleModel: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      vehicleColor: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      // Account status
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'banned'),
        allowNull: false,
        defaultValue: 'active',
      },
      // Total fines tracking
      totalOutstandingFines: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'Total amount of unpaid fines',
      },
      totalFinesPaid: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'Total amount paid for all fines',
      },
      // Last activity tracking
      lastPortalAccessAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last time driver accessed web portal',
      },
      // Metadata
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
          fields: ['license_number'],
        },
        {
          fields: ['email'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['vehicle_registration_number'],
        },
        {
          fields: ['license_status'],
        },
      ],
    }
  );

  /**
   * Associations
   */
  Driver.associate = (models) => {
    // Driver has many fines
    Driver.hasMany(models.Fine, {
      foreignKey: 'driverId',
      as: 'fines',
    });

    // Driver can have payment records
    // Driver.hasMany(models.Payment, { foreignKey: 'driverId' });
  };

  /**
   * Instance Methods
   */

  /**
   * Get full name
   */
  Driver.prototype.getFullName = function () {
    return `${this.firstName} ${this.lastName}`;
  };

  /**
   * Check if license is valid
   */
  Driver.prototype.isLicenseValid = function () {
    if (this.licenseStatus !== 'valid') return false;
    if (
      this.licenseExpiryDate &&
      this.licenseExpiryDate < new Date()
    ) {
      return false;
    }
    return true;
  };

  /**
   * Check if driver can access web portal
   */
  Driver.prototype.canAccessWebPortal = function () {
    return (
      this.status === 'active' &&
      this.isLicenseValid()
    );
  };

  /**
   * Check if driver has outstanding fines
   */
  Driver.prototype.hasOutstandingFines = function () {
    return this.totalOutstandingFines > 0;
  };

  /**
   * Calculate total fines (outstanding + paid)
   */
  Driver.prototype.getTotalFines = function () {
    return this.totalOutstandingFines + this.totalFinesPaid;
  };

  /**
   * Update total outstanding fines
   */
  Driver.prototype.updateOutstandingFines = function (amount) {
    this.totalOutstandingFines = Math.max(0, this.totalOutstandingFines + amount);
    return this.save();
  };

  /**
   * Update total paid fines
   */
  Driver.prototype.updatePaidFines = function (amount) {
    this.totalFinesPaid += amount;
    this.totalOutstandingFines = Math.max(0, this.totalOutstandingFines - amount);
    return this.save();
  };

  /**
   * Update last portal access time
   */
  Driver.prototype.updateLastPortalAccess = function () {
    this.lastPortalAccessAt = new Date();
    return this.save();
  };

  /**
   * Get safe driver object (without sensitive data)
   */
  Driver.prototype.toSafeJSON = function () {
    const safeDriver = this.toJSON();
    // Don't expose sensitive personal info in certain contexts
    return safeDriver;
  };

  /**
   * Class Methods (Statics)
   */

  /**
   * Find driver by license number
   */
  Driver.findByLicenseNumber = function (licenseNumber) {
    return Driver.findOne({
      where: {
        licenseNumber,
      },
    });
  };

  /**
   * Find driver by email
   */
  Driver.findByEmail = function (email) {
    return Driver.findOne({
      where: {
        email,
      },
    });
  };

  /**
   * Find driver by vehicle registration number
   */
  Driver.findByVehicleRegistration = function (registrationNumber) {
    return Driver.findOne({
      where: {
        vehicleRegistrationNumber: registrationNumber,
      },
    });
  };

  /**
   * Find all active drivers
   */
  Driver.findActive = function () {
    return Driver.findAll({
      where: {
        status: 'active',
      },
    });
  };

  /**
   * Find all drivers with outstanding fines
   */
  Driver.findWithOutstandingFines = function () {
    return Driver.findAll({
      where: {
        totalOutstandingFines: {
          [sequelize.Sequelize.Op.gt]: 0,
        },
      },
    });
  };

  /**
   * Find drivers with expired licenses
   */
  Driver.findWithExpiredLicenses = function () {
    return Driver.findAll({
      where: {
        licenseStatus: {
          [sequelize.Sequelize.Op.in]: ['expired', 'suspended', 'revoked'],
        },
      },
    });
  };

  /**
   * Find drivers by status
   */
  Driver.findByStatus = function (status) {
    return Driver.findAll({
      where: {
        status,
      },
    });
  };

  /**
   * Get drivers with high outstanding fines (admin portal)
   */
  Driver.findHighRiskDrivers = function (minFineAmount = 5000) {
    return Driver.findAll({
      where: {
        totalOutstandingFines: {
          [sequelize.Sequelize.Op.gte]: minFineAmount,
        },
      },
      order: [['totalOutstandingFines', 'DESC']],
    });
  };

  return Driver;
};

export default driverModel;
