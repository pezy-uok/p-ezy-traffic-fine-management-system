# Audit Logs API Endpoint Documentation

## Overview
The audit logs endpoint provides admin-only access to view audit trail records of system activities, including user actions, data modifications, and administrative operations.

## Base URL
```
http://localhost:8000/api/admin/audit-logs
```

## Authentication
All endpoints require:
1. Valid JWT token in `Authorization: Bearer <token>` header
2. Admin role authorization via middleware `authorize('admin')`

---

## Endpoints

### 1. Get All Audit Logs (Paginated & Filtered)
**GET** `/api/admin/audit-logs`

#### Query Parameters
| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| `limit` | number | 50 | 500 | Records per page |
| `offset` | number | 0 | - | Pagination offset |
| `userId` | string | - | - | Filter by user ID (UUID) |
| `action` | string | - | - | Filter by action type |
| `entityType` | string | - | - | Filter by entity type |
| `severity` | string | - | - | Filter by severity level |
| `status` | string | - | - | Filter by status (success/failed/pending) |
| `licenseNumber` | string | - | - | Filter by driver license number |
| `startDate` | string | - | - | Start date (ISO 8601 format) |
| `endDate` | string | - | - | End date (ISO 8601 format) |
| `sortBy` | string | timestamp | - | Field to sort by |
| `sortOrder` | string | desc | - | Sort direction (asc/desc) |

#### Response
```json
{
  "success": true,
  "auditLogs": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "userRole": "admin|officer|driver",
      "action": "CREATE|UPDATE|DELETE|VIEW|LOGIN|LOGOUT|PAYMENT|APPEAL",
      "entityType": "Driver|Fine|Criminal|Payment|Appeal",
      "entityId": "entity-uuid",
      "entityName": "string",
      "licenseNumber": "DL1234567",
      "driverId": "driver-uuid",
      "status": "success|failed|pending",
      "severity": "low|medium|high|critical",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0...",
      "requestMethod": "GET|POST|PATCH|DELETE",
      "requestPath": "/api/admin/...",
      "fieldName": "status",
      "oldValue": "pending",
      "newValue": "paid",
      "changeSummary": "Fine status changed from pending to paid",
      "reason": "Payment received",
      "notes": "Additional notes",
      "errorMessage": null,
      "resultSummary": "Action completed successfully",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

#### Example Requests

**Get latest 50 audit logs:**
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get logs with pagination (page 2):**
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs?limit=20&offset=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Filter by admin user actions:**
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs?userId=admin-uuid&action=UPDATE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get failed operations:**
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs?status=failed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Date range filtering:**
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs?startDate=2024-01-01T00:00:00Z&endDate=2024-01-31T23:59:59Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Get critical severity logs (sorted by oldest first):**
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs?severity=critical&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 2. Get Audit Log by ID
**GET** `/api/admin/audit-logs/:id`

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Audit log UUID |

#### Response
```json
{
  "success": true,
  "auditLog": { /* same as above */ }
}
```

#### Example
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Get Audit Logs by User
**GET** `/api/admin/audit-logs/user/:userId`

#### Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | User UUID |

#### Query Parameters
Same as "Get All Audit Logs" (limit, offset, sortBy, etc.)

#### Response
```json
{
  "success": true,
  "auditLogs": [ /* array of logs */ ],
  "total": 125,
  "limit": 50,
  "offset": 0
}
```

#### Example
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs/user/550e8400-e29b-41d4-a716-446655440000" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Get Critical Severity Audit Logs
**GET** `/api/admin/audit-logs/critical`

Convenience endpoint for security-critical events (deletions, role changes, etc.)

#### Query Parameters
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | number | 50 | Records per page |
| `offset` | number | 0 | Pagination offset |
| `startDate` | string | - | Start date filter |
| `endDate` | string | - | End date filter |

#### Response
```json
{
  "success": true,
  "auditLogs": [ /* critical severity logs only */ ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

#### Example
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs/critical" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 5. Get Failed Action Audit Logs
**GET** `/api/admin/audit-logs/failed`

Shows all operations that failed (for troubleshooting)

#### Query Parameters
Same as critical logs endpoint

#### Response
```json
{
  "success": true,
  "auditLogs": [ /* failed status logs only */ ],
  "total": 18,
  "limit": 50,
  "offset": 0
}
```

#### Example
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs/failed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Common Query Combinations

### Monitor a specific driver's activity
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs?licenseNumber=DL1234567&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Find who modified a specific fine
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs?entityType=Fine&entityId=fine-uuid" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Track admin changes in the last 24 hours
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs?userRole=admin&startDate=2024-01-14T10:00:00Z&endDate=2024-01-15T10:00:00Z" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Find payment-related actions
```bash
curl -X GET "http://localhost:8000/api/admin/audit-logs?action=PAYMENT&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Handling

### Invalid Token
```json
{
  "success": false,
  "message": "Invalid or malformed token."
}
```
**Status:** 401

### Not Authorized (User is not admin)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```
**Status:** 403

### Invalid Parameters
```json
{
  "success": false,
  "message": "Offset cannot be negative"
}
```
**Status:** 400

### Audit Log Not Found
```json
{
  "success": false,
  "message": "Audit log entry not found"
}
```
**Status:** 404

### Server Error
```json
{
  "success": false,
  "message": "Failed to fetch audit logs: [error details]"
}
```
**Status:** 500

---

## Severity Levels
- **low** - Informational events (views, reads)
- **medium** - Standard changes (updates, modifications)
- **high** - Significant operations (deletions, role changes)
- **critical** - Security-sensitive events (admin actions, access changes)

---

## Action Types
Common actions tracked in the system:
- `CREATE` - New record creation
- `UPDATE` - Record modification
- `DELETE` - Record deletion
- `VIEW` - Record accessed
- `LOGIN` - User login
- `LOGOUT` - User logout
- `PAYMENT` - Payment processed
- `APPEAL` - Appeal filed/updated

---

## Entity Types
- `Driver` - Driver profile/license
- `Fine` - Traffic fine record
- `Criminal` - Criminal record
- `Payment` - Payment transaction
- `Appeal` - Appeal case
- `User` - Admin/officer user account
- `News` - News article

---

## Implementation Details

### Service Functions
Located in `/backend/src/services/auditLogService.js`:
- `getAllAuditLogs(options)` - Fetch with pagination & filters
- `getAuditLogById(id)` - Fetch single log
- `getAuditLogsByUser(userId, options)` - Filter by user
- `getAuditLogsByDriver(licenseNumber, options)` - Filter by driver
- `getAuditLogsByEntity(entityType, entityId, options)` - Filter by entity
- `getCriticalAuditLogs(options)` - Critical severity only
- `getFailedAuditLogs(options)` - Failed status only

### Controller Functions
Located in `/backend/src/controllers/adminController.js`:
- `getAuditLogsForAdmin` - Main endpoint handler
- `getAuditLogByIdForAdmin` - Single log handler
- `getAuditLogsByUserForAdmin` - User filter handler
- `getCriticalAuditLogsForAdmin` - Critical logs handler
- `getFailedAuditLogsForAdmin` - Failed logs handler

### Database Schema
Table: `auditlogs`
- 20+ columns for comprehensive audit trail tracking
- Indexed on: `userId`, `action`, `entityType`, `timestamp`, `severity`, `status`
- Includes IP address, user agent, and request details for forensics

---

## Notes
- All timestamps are in ISO 8601 format (UTC)
- Maximum 500 records per request to prevent performance issues
- Offset-based pagination recommended (no cursor support yet)
- All endpoints are read-only (audit logs cannot be modified or deleted)
- Requires full admin authorization (no granular permissions)
