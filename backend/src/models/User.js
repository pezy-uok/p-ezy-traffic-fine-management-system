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
        allowNull: false,
        unique: {
          msg: 'Email already exists',
        },
        validate: {
          isEmail: {
            msg: 'Must be a valid email address',
          },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: {
            args: [8, 255],
            msg: 'Password must be at least 8 characters',
          },
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      role: {
        type: DataTypes.ENUM('admin', 'police_officer'),
        allowNull: false,
        defaultValue: 'police_officer',
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
      this.isPoliceOfficer() && this.status === 'active' && this.isVerified
    );
  };

  /**
   * Check if user can access admin portal (admins only)
   */
  User.prototype.canAccessAdminPortal = function () {
    return this.isAdmin() && this.status === 'active' && this.isVerified;
  };

  /**
   * Get safe user object (without password)
   */
  User.prototype.toSafeJSON = function () {
    const { password, ...safeUser } = this.toJSON();
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
