import { getSupabaseClient } from '../config/supabaseClient.js';
import { ValidationError } from '../utils/errors.js';

/**
 * Get paginated audit logs with filtering and sorting
 * @param {Object} options - Query options
 * @param {number} options.limit - Max results per page (default: 50, max: 500)
 * @param {number} options.offset - Pagination offset (default: 0)
 * @param {string} options.userId - Filter by user ID (optional)
 * @param {string} options.action - Filter by action type (optional)
 * @param {string} options.entityType - Filter by entity type (optional)
 * @param {string} options.severity - Filter by severity level (optional)
 * @param {string} options.status - Filter by status (success/failed/pending) (optional)
 * @param {string} options.licenseNumber - Filter by driver license number (optional)
 * @param {string} options.sortBy - Field to sort by (default: 'timestamp')
 * @param {string} options.sortOrder - Sort direction ('asc' or 'desc', default: 'desc')
 * @param {string} options.startDate - Filter by date (ISO format) - start range (optional)
 * @param {string} options.endDate - Filter by date (ISO format) - end range (optional)
 * @returns {Promise<Object>} { logs: Array, total: number, limit, offset }
 */
export const getAllAuditLogs = async (options = {}) => {
  const supabase = getSupabaseClient();

  // Validate and set defaults
  let limit = options.limit ? parseInt(options.limit, 10) : 50;
  if (limit > 500) limit = 500;
  if (limit < 1) limit = 1;

  const offset = options.offset ? parseInt(options.offset, 10) : 0;
  if (offset < 0) {
    throw new ValidationError('Offset cannot be negative');
  }

  const sortBy = options.sortBy || 'timestamp';
  const sortOrder = options.sortOrder === 'asc' ? 'asc' : 'desc';

  // Build query
  let query = supabase
    .from('auditlogs')
    .select('*', { count: 'exact' });

  // Apply filters
  if (options.userId) {
    query = query.eq('userId', options.userId);
  }

  if (options.action) {
    query = query.eq('action', options.action);
  }

  if (options.entityType) {
    query = query.eq('entityType', options.entityType);
  }

  if (options.severity) {
    query = query.eq('severity', options.severity);
  }

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (options.licenseNumber) {
    query = query.eq('licenseNumber', options.licenseNumber);
  }

  // Date range filtering
  if (options.startDate) {
    query = query.gte('timestamp', options.startDate);
  }

  if (options.endDate) {
    query = query.lte('timestamp', options.endDate);
  }

  // Execute query with pagination and sorting
  const { data: logs, error, count } = await query
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch audit logs: ${error.message}`);
  }

  return {
    logs: (logs || []).map(log => ({
      id: log.auditLogId,
      userId: log.userId,
      userRole: log.userRole,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      entityName: log.entityName,
      licenseNumber: log.licenseNumber,
      driverId: log.driverId,
      status: log.status,
      severity: log.severity,
      timestamp: log.timestamp,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      requestMethod: log.requestMethod,
      requestPath: log.requestPath,
      fieldName: log.fieldName,
      oldValue: log.oldValue,
      newValue: log.newValue,
      changeSummary: log.changeSummary,
      reason: log.reason,
      notes: log.notes,
      errorMessage: log.errorMessage,
      resultSummary: log.resultSummary,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
    })),
    total: count || 0,
    limit,
    offset,
  };
};

/**
 * Get a single audit log entry by ID
 * @param {string} auditLogId - Audit log ID (UUID)
 * @returns {Promise<Object>} Audit log entry
 */
export const getAuditLogById = async (auditLogId) => {
  if (!auditLogId) {
    throw new ValidationError('Audit log ID is required');
  }

  const supabase = getSupabaseClient();

  const { data: log, error } = await supabase
    .from('auditlogs')
    .select('*')
    .eq('auditLogId', auditLogId)
    .single();

  if (error || !log) {
    throw new Error('Audit log entry not found');
  }

  return {
    id: log.auditLogId,
    userId: log.userId,
    userRole: log.userRole,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    entityName: log.entityName,
    licenseNumber: log.licenseNumber,
    driverId: log.driverId,
    status: log.status,
    severity: log.severity,
    timestamp: log.timestamp,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    requestMethod: log.requestMethod,
    requestPath: log.requestPath,
    fieldName: log.fieldName,
    oldValue: log.oldValue,
    newValue: log.newValue,
    changeSummary: log.changeSummary,
    reason: log.reason,
    notes: log.notes,
    errorMessage: log.errorMessage,
    resultSummary: log.resultSummary,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
};

/**
 * Get audit logs for a specific user
 * @param {string} userId - User ID (UUID)
 * @param {Object} options - Additional filter options
 * @returns {Promise<Array>} Array of audit log entries
 */
export const getAuditLogsByUser = async (userId, options = {}) => {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }

  return getAllAuditLogs({ ...options, userId });
};

/**
 * Get audit logs for a specific driver/license
 * @param {string} licenseNumber - Driver license number
 * @param {Object} options - Additional filter options
 * @returns {Promise<Array>} Array of audit log entries
 */
export const getAuditLogsByDriver = async (licenseNumber, options = {}) => {
  if (!licenseNumber) {
    throw new ValidationError('License number is required');
  }

  return getAllAuditLogs({ ...options, licenseNumber });
};

/**
 * Get audit logs by entity (e.g., all changes to a specific fine)
 * @param {string} entityType - Type of entity (Driver, Fine, Criminal, etc.)
 * @param {string} entityId - ID of the entity
 * @param {Object} options - Additional filter options
 * @returns {Promise<Array>} Array of audit log entries
 */
export const getAuditLogsByEntity = async (entityType, entityId, options = {}) => {
  if (!entityType || !entityId) {
    throw new ValidationError('Entity type and ID are required');
  }

  return getAllAuditLogs({ ...options, entityType, entityId: entityId });
};

/**
 * Get critical severity audit logs
 * @param {Object} options - Additional filter options (limit, offset, etc.)
 * @returns {Promise<Array>} Array of critical audit log entries
 */
export const getCriticalAuditLogs = async (options = {}) => {
  return getAllAuditLogs({ ...options, severity: 'critical' });
};

/**
 * Get failed action audit logs
 * @param {Object} options - Additional filter options
 * @returns {Promise<Array>} Array of failed audit log entries
 */
export const getFailedAuditLogs = async (options = {}) => {
  return getAllAuditLogs({ ...options, status: 'failed' });
};
