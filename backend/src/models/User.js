/**
 * User Sequelize Model
 *
 * Represents users in the system:
 * - Police Officers (mobile app access only)
 * - Admins (web admin portal access only)
 *
 * Role-based permissions and app access control
 */

const userModel = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
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
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: {
          msg: 'Phone number already exists',
        },
      },
      role: {
        type: DataTypes.ENUM('admin', 'police_officer'),
        allowNull: false,
        defaultValue: 'police_officer',
      },
      // Authentication: Phone + OTP + PIN (no password)
      phoneVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      otpSecret: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'TOTP secret for OTP generation',
      },
      otpExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When OTP expires',
      },
      otpAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Failed OTP verification attempts',
      },
      pinHash: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Hashed PIN for mobile app login',
      },
      // Police Officer specific fields
      badgeNumber: {
        type: DataTypes.STRING(50),
        allowNull: true,
        unique: {
          msg: 'Badge number already exists',
        },
      },
      department: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      rank: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      yearsOfService: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      // Account status and verification
      status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        allowNull: false,
        defaultValue: 'active',
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      // Last activity tracking
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      lastActivityAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Admin specific fields
      permissions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'Array of permission strings for admins',
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
          fields: ['phone'],
        },
        {
          fields: ['email'],
        },
        {
          fields: ['role'],
        },
        {
          fields: ['status'],
        },
        {
          fields: ['badge_number'],
        },
        {
          fields: ['phone_verified'],
        },
        {
          fields: ['otp_expires_at'],
        },
      ],
    }
  );

  /**
   * Associations
   */
  User.associate = (models) => {
    // Define associations with other models here
    // Example:
    // User.hasMany(models.ActivityLog, { foreignKey: 'userId' });
    // User.hasMany(models.AuditLog, { foreignKey: 'userId' });
  };

  /**
   * Instance Methods
   */

  /**
   * Check if user is an admin
   */
  User.prototype.isAdmin = function () {
    return this.role === 'admin';
  };

  /**
   * Check if user is a police officer
   */
  User.prototype.isPoliceOfficer = function () {
    return this.role === 'police_officer';
  };

  /**
   * Check if user has specific permission (for admins)
   */
  User.prototype.hasPermission = function (permission) {
    if (!this.isAdmin()) return false;
    return this.permissions && this.permissions.includes(permission);
  };

  /**
   * Update last login timestamp
   */
  User.prototype.updateLastLogin = function () {
    this.lastLogin = new Date();
    return this.save();
  };

  /**
   * Update last activity timestamp
   */
  User.prototype.updateLastActivity = function () {
    this.lastActivityAt = new Date();
    return this.save();
  };

  /**
   * Check if user can access mobile app (police officers only)
   */
  User.prototype.canAccessMobileApp = function () {
    return (
      this.isPoliceOfficer() &&
      this.status === 'active' &&
      this.isVerified
    );
  };

  /**
   * Check if user can access admin portal (admins only)
   */
  User.prototype.canAccessAdminPortal = function () {
    return (
      this.isAdmin() &&
      this.status === 'active' &&
      this.isVerified
    );
  };

  /**
   * Check if OTP is still valid (not expired)
   */
  User.prototype.isOtpValid = function () {
    return this.otpSecret && this.otpExpiresAt && new Date() < this.otpExpiresAt;
  };

  /**
   * Check if OTP has expired
   */
  User.prototype.isOtpExpired = function () {
    return !this.otpSecret || !this.otpExpiresAt || new Date() >= this.otpExpiresAt;
  };

  /**
   * Get remaining time for OTP validity (in seconds)
   */
  User.prototype.getOtpTimeRemaining = function () {
    if (!this.otpExpiresAt) return 0;
    const remaining = Math.floor((this.otpExpiresAt - new Date()) / 1000);
    return remaining > 0 ? remaining : 0;
  };

  /**
   * Check if PIN is set
   */
  User.prototype.hasPinSet = function () {
    return !!this.pinHash;
  };

  /**
   * Increment OTP attempt counter
   */
  User.prototype.incrementOtpAttempts = function () {
    this.otpAttempts = (this.otpAttempts || 0) + 1;
    return this.save();
  };

  /**
   * Reset OTP attempts
   */
  User.prototype.resetOtpAttempts = function () {
    this.otpAttempts = 0;
    return this.save();
  };

  /**
   * Get safe user object (without sensitive auth data)
   */
  User.prototype.toSafeJSON = function () {
    const { otpSecret, pinHash, otpAttempts, ...safeUser } = this.toJSON();
    return safeUser;
  };

  /**
   * Class Methods (Statics)
   */

  /**
   * Find active users by role
   */
  User.findActiveByRole = function (role) {
    return User.findAll({
      where: {
        role,
        status: 'active',
      },
    });
  };

  /**
   * Find verified admins
   */
  User.findVerifiedAdmins = function () {
    return User.findAll({
      where: {
        role: 'admin',
        isVerified: true,
        status: 'active',
      },
    });
  };

  /**
   * Find verified police officers
   */
  User.findVerifiedPoliceOfficers = function () {
    return User.findAll({
      where: {
        role: 'police_officer',
        isVerified: true,
        status: 'active',
      },
    });
  };

  /**
   * Find by badge number (police officers)
   */
  User.findByBadgeNumber = function (badgeNumber) {
    return User.findOne({
      where: {
        badgeNumber,
        role: 'police_officer',
      },
    });
  };

  return User;
};

export default userModel;
