# Quick Start: Database Sync Testing

## Prerequisites Checklist

- [ ] Node.js installed
- [ ] npm dependencies installed (`npm install sequelize pg pg-hstore`)
- [ ] `.env` configured with database credentials
- [ ] PostgreSQL server running (OR Supabase account)

---

## One-Command Setup (macOS)

### Step 1: Start PostgreSQL

```bash
# Install if needed
brew install postgresql@15

# Start service
brew services start postgresql@15

# Verify it's running
psql -U postgres -c "SELECT VERSION();"
```

### Step 2: Create Database

```bash
createdb pezy_db
```

### Step 3: Update .env (if different from defaults)

```bash
# Edit .env file
# Most users can use defaults:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=pezy_db
# DB_USER=postgres
# DB_PASSWORD=postgres
```

### Step 4: Start Server (Auto-Syncs)

```bash
cd backend
npm run dev
```

---

## Expected Output

```
🚀 Initializing database...

📡 Connecting to PostgreSQL: postgres@localhost:5432/pezy_db
✓ Sequelize connected to PostgreSQL successfully
✓ Loaded model: User
✓ Loaded model: Criminal
✓ Loaded model: Driver
✓ Loaded model: Fine
✓ Loaded model: Warning
✓ Loaded model: Payment
✓ Loaded model: AuditLog
✓ Loaded model: News
✓ Loaded model: Tip
✓ Associated model: User
✓ Associated model: Criminal
✓ Associated model: Driver
✓ Associated model: Fine
✓ Associated model: Warning
✓ Associated model: Payment
✓ Associated model: AuditLog
✓ Associated model: News
✓ Associated model: Tip
✓ All model associations established

🔄 Syncing database schema...
✓ Database schema synchronized successfully

📋 Verifying database tables...

📊 Table Verification Results:
══════════════════════════════════════════════════════════════════
  Users                | ✓ EXISTS   Records: 0
  Criminals            | ✓ EXISTS   Records: 0
  Drivers              | ✓ EXISTS   Records: 0
  Fines                | ✓ EXISTS   Records: 0
  Warnings             | ✓ EXISTS   Records: 0
  Payments             | ✓ EXISTS   Records: 0
  AuditLogs            | ✓ EXISTS   Records: 0
  News                 | ✓ EXISTS   Records: 0
  Tips                 | ✓ EXISTS   Records: 0
══════════════════════════════════════════════════════════════════

✅ Summary: 9/9 tables created

✓ Supabase client initialized

✅ Database initialization complete!

✓ Server is running on http://localhost:5000
```

---

## Verification Commands

### Verify Tables Exist

```bash
# In a new terminal
psql -U postgres -d pezy_db -c "\dt"
```

Expected output:

```
                List of relations Schema | Name        | Type  | Owner
--------+-----------+-------+----------
 public | AuditLogs | table | postgres
 public | Criminals | table | postgres
 public | Drivers   | table | postgres
 public | Fines     | table | postgres
 public | News      | table | postgres
 public | Payments  | table | postgres
 public | Tips      | table | postgres
 public | Users     | table | postgres
 public | Warnings  | table | postgres
(9 rows)
```

### Verify Table Structure

```bash
# Check Users table columns
psql -U postgres -d pezy_db -c "\d \"Users\""
```

### Count Records

```bash
# Check record counts
psql -U postgres -d pezy_db -c "
  SELECT 'Users' as tbl, COUNT(*) as cnt FROM \"Users\"
  UNION ALL SELECT 'Criminals', COUNT(*) FROM \"Criminals\"
  UNION ALL SELECT 'Drivers', COUNT(*) FROM \"Drivers\"
  UNION ALL SELECT 'Fines', COUNT(*) FROM \"Fines\"
  UNION ALL SELECT 'Warnings', COUNT(*) FROM \"Warnings\"
  UNION ALL SELECT 'Payments', COUNT(*) FROM \"Payments\"
  UNION ALL SELECT 'AuditLogs', COUNT(*) FROM \"AuditLogs\"
  UNION ALL SELECT 'News', COUNT(*) FROM \"News\"
  UNION ALL SELECT 'Tips', COUNT(*) FROM \"Tips\"
  ORDER BY tbl;
"
```

---

## Using Verification Script

```bash
# Show all current config & status
node scripts/db-init.js stats

# Example output:
# {
#   "connected": true,
#   "host": "localhost",
#   "database": "pezy_db",
#   "dialect": "postgres",
#   "models": ["User", "Criminal", "Driver", "Fine", ...],
#   "tablesCount": 9,
#   "timestamp": "2026-03-25T..."
# }
```

---

## Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Cause**: PostgreSQL not running

**Fix**:
```bash
# Check if running
brew services list | grep postgresql

# Start it
brew services start postgresql@15

# Verify
psql -U postgres -c "SELECT 1"
```

### Error: "password authentication failed"

**Cause**: Wrong password in .env

**Fix**:
```bash
# Check your PostgreSQL password
# Default is usually 'postgres'
# If different, update .env

# Test connection
psql -U postgres -h localhost -W -c "SELECT 1"
```

### Error: "database pezy_db does not exist"

**Cause**: Database not created

**Fix**:
```bash
# Create it
createdb pezy_db

# Verify
psql -U postgres -l | grep pezy_db
```

### Tables don't exist but server started

**Cause**: `sequelize.sync()` failed silently

**Fix**:
```bash
# Check server logs for errors
# Ensure DB connection is working
psql -U postgres -d pezy_db -c "SELECT 1"

# Manually trigger sync
npm run dev  # Restart server

# Check logs carefully for errors
```

---

## Files Involved

| File | Purpose |
|------|---------|
| `src/config/database.js` | Main Sequelize setup & sync logic |
| `src/models/*.js` | Model definitions (9 files) |
| `.env` | Database configuration |
| `src/index.js` | Calls `initializeDatabase()` on startup |
| `scripts/db-init.js` | Manual verification script |

---

## What Gets Created

### 9 Tables

1. **Users** - Admin and officer accounts (userId, email, role, etc.)
2. **Criminals** - Police records (firstName, lastName, warningLevel, etc.)
3. **Drivers** - Driver licenses (licenseNumber, status, violations, etc.)
4. **Fines** - Traffic violations (amount, status, dueDate, etc.)
5. **Warnings** - Police warnings (type, reason, date, etc.)
6. **Payments** - Fine payments (amount, status, date, etc.)
7. **News** - Portal news articles (title, content, category, etc.)
8. **Tips** - Crime tips (title, description, status, priority, etc.)
9. **AuditLogs** - System audit trail (action, entity, changes, etc.)

### Relationships

- Users → News (author)
- Users → Tips (submitter, assignedOfficer)
- Users → AuditLog (user)
- Criminal → Tips (relatedCriminal)
- Driver → Fines (driver)
- Fines → Payments (parent)
- And more...

---

## Testing Table Creation

### Add Sample Data (Optional)

```bash
# Insert a test user
psql -U postgres -d pezy_db -c "
  INSERT INTO \"Users\" (\"userId\", \"email\", \"firstName\", \"role\", \"createdAt\", \"updatedAt\")
  VALUES (gen_random_uuid(), 'test@pezy.com', 'Test User', 'officer', NOW(), NOW());
"

# Verify it
psql -U postgres -d pezy_db -c "SELECT * FROM \"Users\";"
```

### Via API (Once Server Running)

The server will provide API endpoints to manage records:

```bash
# Create a user via API
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "officer@pezy.com",
    "firstName": "John",
    "role": "officer"
  }'

# List users
curl http://localhost:5000/api/users
```

---

## Success Confirmation

✅ **You'll know it worked when:**

1. Server starts without database errors
2. All 9 tables appear in `psql \dt`
3. Verification summary shows "Summary: 9/9 tables created"
4. You can query tables: `SELECT COUNT(*) FROM "Users"`
5. API requests don't get "table does not exist" errors

---

## Next Steps

1. ✅ Tables created
2. Create API endpoints for CRUD operations
3. Add data validation and error handling
4. Implement authentication/authorization
5. Add database seeding for test data
6. Configure backups and monitoring

---

## References

- [Sequelize Docs](https://sequelize.org/)
- [PostgreSQL Commands](https://www.postgresql.org/docs/current/sql-commands.html)
- [DATABASE_SETUP_GUIDE.md](./DATABASE_SETUP_GUIDE.md) - Detailed guide

---

**Status**: ✅ Ready to Test  
**Last Updated**: March 25, 2026
